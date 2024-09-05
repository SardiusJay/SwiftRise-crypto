/**
 * Contains the PaymentServices for All the CyptoCoins
 * handles all payment operations
 * @author Eyang Daniel Eyoh <https://github.com/Tediyang>
*/

const ethers = require('ethers');
const wallet = require('../encryption/decryptKey');
const axios = require('axios');
const { Contract } = require('../models/engine/db_storage');
const { logger } = require('../logger');
require('dotenv').config();

class PaymentServiceEth {
    /**
     * Constructor for initializing environment-specific variables and creating provider and wallet.
     */

    ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
    CONFIRMATIONS = process.env.CONFIRMATIONS;

    constructor() {
        this.provider;
        this.signer;
        this.contract;
    }

    async init() {
        // Initialize the provider and wallet
        if (process.env.ENVIRONMENT === 'test') {
            this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // connect to blockchain
            this.signer = new ethers.Wallet((await wallet()).privateKey, this.provider); // create wallet
            this.contract = new ethers.Contract(  // Initialize the contract
                (await Contract.findOne({ coin: "ETH" })).address,
                (await Contract.findOne({ coin: "ETH" })).abi,
                this.signer
            );
        }

        if (process.env.ENVIRONMENT === "production") {
            ;
        }
    }

    /**
     * Asynchronously transfers an amount to a recipient's Ethereum address.
     *
     * @param {Object} body - the input body containing amountInUsd and recipientEthAddress
     * @return {Promise} a Promise that resolves to the status of the transaction
     */
    async transfer(body) {
        try {
            // Initialize the provider and wallet
            await this.init();

            // Validate the input
            const { amountInUsd, recipientEthAddress } = this.validateInput(body);

            // Convert the Usd amount to Eth
            const data = await this.convertUsdToEth(amountInUsd);
            if (data.status !== 'success') {
                throw new Error(data.error);
            }

            // Create a transaction
            const tx = await this.createTransaction(data.amountInEth, recipientEthAddress);

            // Send the transaction and wait for the receipt
            const receipt = await this.sendAndWaitForReceipt(tx);

            // Check the status of the transaction
            return this.checkTransactionStatus(receipt);

        } catch (error) {
            return { status: 'error', error };
        }
    }

    /**
     * Asynchronously withdraws funds from the Ethereum Contract to the owner account.
     *
     * @return {Promise<Object>} An object containing the transaction status and error, if any.
     * @throws {Error} If an error occurs during the withdrawal process.
     */
    async withdraw() {
        try {
            // Initialize the signer
            await this.init();

            // Call the withdraw function
            const tx = await this.contract.withdraw();
            const receipt = await tx.wait(this.CONFIRMATIONS);

            // Check the status of the transaction
            return this.checkTransactionStatus(receipt);

        } catch (error) {
            return ({ status: 'error', error });
        }
    }

    /**
     * Validates the input body, ensuring the amountInUsd is a valid number and recipientEthAddress is a valid Ethereum address.
     *
     * @param {object} body - the input object containing amountInUsd and recipientEthAddress
     * @return {object} the validated amountInUsd and recipientEthAddress
     */
    validateInput(body) {
        const { amountInUsd, recipientEthAddress } = body;

        if (isNaN(amountInUsd) || amountInUsd <= 0) {
            throw new Error('Invalid amountInUsd');
        }

        if (!ethers.isAddress(recipientEthAddress)) {
            throw new Error('Invalid recipientEthAddress');
        }

        return { amountInUsd, recipientEthAddress };
    }

    /**
     * Converts the given amount in USD to ETH using the Etherscan API.
     *
     * @param {number} amountInUsd - the amount in USD to convert to ETH
     * @return {object} an object containing the status and the amount in ETH, or an error object
     */
    async convertUsdToEth(amountInUsd) {
        try {
            const response = await axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${this.ETHERSCAN_API_KEY}`);
            if (response.status != 200 || response.data.result.ethusd === undefined) {
                throw new Error(`${response.data.message} or Eth|Usd data not found`);
            };

            const usdValue = response.data.result.ethusd;

            return ({ status: 'success', amountInEth: (amountInUsd / usdValue).toFixed(8) });

        } catch (error) {
            if (error.response && error.response.status === 429) {
                // Handle rate limit error
                logger.error('Rate limit exceeded. Please try again later.');
            } else {
                // Handle other errors
                logger.error('An error occurred:', error.message);
            }
            return ({ status: 'error', error });
        }
    }

    /**
     * Creates a transaction with the specified amount in Eth and recipient Ethereum address.
     *
     * @param {number} amountInEth - The amount in Eth to be transferred.
     * @param {string} recipientEthAddress - The Ethereum address of the recipient.
     * @return {Promise<string>} A promise that resolves to the signed transaction.
     */
    async createTransaction(amountInEth, recipientEthAddress) {
        // Get the current nonce for the sender's address
        try {
            const nonce = await this.signer.getNonce();

            // Create transaction
            const tx = {
                to: recipientEthAddress,
                value: ethers.parseEther(amountInEth),
                gasPrice: (await this.provider.getFeeData()).gasPrice,
                nonce: nonce
            };

            // Estimate the gas required for the transaction and update the limit
            const estimatedGas = await this.signer.estimateGas(tx);
            tx.gasLimit = estimatedGas + 500n; // Add 500 gas to the limit

            return tx;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Send a transaction and wait for its receipt.
     *
     * @param {Object} tx - The transaction object to be sent
     * @param {number} [maxRetries=3] - The maximum number of retries for waiting for the receipt
     * @return {Object} The receipt of the transaction
     */
    async sendAndWaitForReceipt(tx, maxRetries = 3) {
        // Send transaction
        const sent = await this.signer.sendTransaction(tx);

        // Wait for confirmations
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const receipt = await sent.wait(this.CONFIRMATIONS);
                return receipt;
            } catch (error) {
                if (error.code === "ProviderError" || error.message.includes("timeout")) {
                    const waitTime = 2 * Math.pow(2, attempt) * 1000; // Exponential backoff
                    logger.error(`ProviderError or Transaction timed out, retrying after ${waitTime / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));

                    // Increase gas price slightly
                    const increaseAmt = ethers.parseUnits("1.1", 18); // Increment gas price by 10%
                    tx.gasPrice = (tx.gasPrice * increaseAmt) / 1000000000000000000n; // divided by 10^18 created from the increaseAmt

                    continue; // Retry the transaction
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Transaction confirmation failed after multiple retries");
    }

    /**
     * Check the status of a transaction receipt.
     *
     * @param {object} receipt - the transaction receipt to be checked
     * @return {object} the transaction receipt if status is 1, otherwise throw an error
     */
    checkTransactionStatus(receipt) {
        if (receipt.status === 1 || receipt.status === 0) {
            return receipt;
        } else {
            throw new Error('Transaction failed');
        }
    }
}

class PaymentServiceBNB {
    /**
     * Constructor for initializing environment-specific variables and creating provider and wallet.
     */

    BSCAN_API_KEY = process.env.BSCAN_API_KEY;
    CONFIRMATIONS = process.env.CONFIRMATIONS;

    constructor() {
        this.provider;
        this.signer;
        this.contract;
    }

    async init() {
        // Initialize the provider and wallet
        if (process.env.ENVIRONMENT === 'test') {
            this.provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL); // connect to blockchain
            this.signer = new ethers.Wallet((await wallet()).privateKey, this.provider); // create wallet
            this.contract = new ethers.Contract(  // Initialize the contract
                (await Contract.findOne({ coin: "BNB" })).address,
                (await Contract.findOne({ coin: "BNB" })).abi,
                this.signer
            );
        };

        if (process.env.ENVIRONMENT === "production") {
            ;
        };
    }

    /**
     * Asynchronously transfers an amount to a recipient's BNB address.
     *
     * @param {Object} body - the input body containing amountInUsd and recipientBNBAddress.
     * @return {Promise} a Promise that resolves to the status of the transaction.
     */
    async transfer(body) {
        try {
            // Initialize the provider and wallet
            await this.init();

            // Validate the input
            const { amountInUsd, recipientBNBAddress } = this.validateInput(body);

            // Convert the Usd amount to Eth
            const data = await this.convertUsdToBNB(amountInUsd);
            if (data.status !== 'success') {
                throw new Error(data.error);
            }

            // Create a transaction
            const tx = await this.createTransaction(data.amountInBNB, recipientBNBAddress);

            // Send the transaction and wait for the receipt.
            const receipt = await this.sendAndWaitForReceipt(tx);

            // Check the status of the transaction
            return this.checkTransactionStatus(receipt);

        } catch (error) {
            return ({ status: 'error', error });
        }
    }

    /**
     * Asynchronously withdraws funds from the BNB Contract to the owner address.
     *
     * @return {Promise<Object>} An object containing the transaction status and error, if any.
     * @throws {Error} If an error occurs during the withdrawal process.
     */
    async withdraw() {
        try {
            // Initialize the signer
            await this.init();

            // Call the withdraw function
            const tx = await this.contract.withdraw();
            const receipt = await tx.wait(this.CONFIRMATIONS);
            
            // Check the status of the transaction
            return this.checkTransactionStatus(receipt);

        } catch (error) {
            return ({ status: 'error', error });
        }
    }

    /**
     * Validates the input body, ensuring the amountInUsd is a valid number and recipientBNBAddress is a valid BSCAN address.
     *
     * @param {object} body - the input object containing amountInUsd and recipientBNBAddress.
     * @return {object} the validated amountInUsd and recipientBNBAddress.
     */
    validateInput(body) {
        const { amountInUsd, recipientBNBAddress } = body;

        if (isNaN(amountInUsd) || amountInUsd <= 0) {
            throw new Error('Invalid amountInUsd');
        }

        if (!ethers.isAddress(recipientBNBAddress)) {
            throw new Error('Invalid recipientBNBAddress');
        }

        return { amountInUsd, recipientBNBAddress };
    }

    /**
     * Converts the given amount in USD to BNB using the Etherscan API.
     *
     * @param {number} amountInUsd - the amount in USD to convert to BNB.
     * @return {object} an object containing the status and the amount in BNB, or an error object.
     */
    async convertUsdToBNB(amountInUsd) {
        try {
            const response = await axios.get(`https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${this.BSCAN_API_KEY}`);
            if (response.status != 200 || response.data.result.ethusd === undefined) {
                throw new Error(`${response.data.message} or Eth|Usd data not found`);
            };

            const usdValue = response.data.result.ethusd;

            return ({ status: 'success', amountInBNB: (amountInUsd / usdValue).toFixed(8) });

        } catch (error) {
            if (error.response && error.response.status === 429) {
                // Handle rate limit error
                logger.error('Rate limit exceeded. Please try again later.');
            } else {
                // Handle other errors
                logger.error('An error occurred:', error.message);
            }
            return ({ status: 'error', error });
        }
    }

    /**
     * Creates a transaction with the specified amount in BNB and recipient BNB address.
     *
     * @param {number} amountInBNB - The amount in BNB to be transferred.
     * @param {string} recipientBNBAddress - The BNB address of the recipient.
     * @return {Promise<string>} A promise that resolves to the signed transaction.
     */
    async createTransaction(amountInBNB, recipientBNBAddress) {
        // Get the current nonce for the sender's address
        try {
            const nonce = await this.signer.getNonce();

            // Create transaction
            const tx = {
                to: recipientBNBAddress,
                value: ethers.parseUnits(amountInBNB, 18),
                gasPrice: (await this.provider.getFeeData()).gasPrice,
                nonce: nonce
            };

            // Estimate the gas required for the transaction and update the limit
            const estimatedGas = await this.signer.estimateGas(tx);
            tx.gasLimit = estimatedGas + 500n; // Add 500 gas to the limit

            return tx;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Send a transaction and wait for its receipt.
     *
     * @param {Object} tx - The transaction object to be sent
     * @param {number} [maxRetries=3] - The maximum number of retries for waiting for the receipt
     * @return {Object} The receipt of the transaction
     */
    async sendAndWaitForReceipt(tx, maxRetries = 3) {
        // Send transaction
        const sent = await this.signer.sendTransaction(tx);

        // Wait for confirmations
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const receipt = await sent.wait(this.CONFIRMATIONS);
                return receipt;
            } catch (error) {
                if (error.code === "ProviderError" || error.message.includes("timeout")) {
                    const waitTime = 2 * Math.pow(2, attempt) * 1000; // Exponential backoff
                    logger.error(`ProviderError or Transaction timed out, retrying after ${waitTime / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));

                    // Increase gas price slightly
                    const increaseAmt = ethers.parseUnits("1.1", 18); // Increment gas price by 10%
                    tx.gasPrice = (tx.gasPrice * increaseAmt) / 1000000000000000000n; // divided by 10^18 created from the increaseAmt

                    continue; // Retry the transaction
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Transaction confirmation failed after multiple retries");
    }

    /**
     * Check the status of a transaction receipt.
     *
     * @param {object} receipt - the transaction receipt to be checked
     * @return {object} the transaction receipt if status is 1, otherwise throw an error
     */
    checkTransactionStatus(receipt) {
        if (receipt.status === 1 || receipt.status === 0) {
            return receipt;
        } else {
            throw new Error('Transaction failed');
        }
    }
}

class PaymentServiceMatic {
    /**
     * Constructor for initializing environment-specific variables and creating provider and wallet.
     */

    POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY;
    CONFIRMATIONS = process.env.CONFIRMATIONS;

    constructor() {
        this.provider;
        this.signer;
        this.contract;
    }

    async init() {
        // Initialize the provider and wallet
        if (process.env.ENVIRONMENT === 'test') {
            this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_TESTNET_RPC_URL); // connect to blockchain
            this.signer = new ethers.Wallet((await wallet()).privateKey, this.provider); // create wallet
            this.contract = new ethers.Contract(  // Initialize the contract
                (await Contract.findOne({ coin: "MATIC" })).address,
                (await Contract.findOne({ coin: "MATIC" })).abi,
                this.signer
            );
        };

        if (process.env.ENVIRONMENT === "production") {
            ;
        }
    }

    /**
     * Asynchronously transfers an amount to a recipient's Polygon address.
     *
     * @param {Object} body - the input body containing amountInUsd and recipientMaticAddress
     * @return {Promise} a Promise that resolves to the status of the transaction
     */
    async transfer(body) {
        try {
            // Initialize the provider and wallet
            await this.init();

            // Validate the input
            const { amountInUsd, recipientMaticAddress } = this.validateInput(body);

            // Convert the Usd amount to Matic
            const data = await this.convertUsdToMatic(amountInUsd);
            if (data.status !== 'success') {
                throw new Error(data.error);
            }

            // Create a transaction
            const tx = await this.createTransaction(data.amountInMatic, recipientMaticAddress);

            // Send the transaction and wait for the receipt
            const receipt = await this.sendAndWaitForReceipt(tx);

            // Check the status of the transaction
            return this.checkTransactionStatus(receipt);

        } catch (error) {
            return ({ status: 'error', error });
        }
    }

    /**
     * Asynchronously withdraws funds from the Polygon Contract to the owner address.
     *
     * @return {Promise<Object>} An object containing the transaction status and error, if any.
     * @throws {Error} If an error occurs during the withdrawal process.
     */
    async withdraw() {
        try {
            // Initialize the signer
            await this.init();

            // Call the withdraw function
            const tx = await this.contract.withdraw();
            const receipt = await tx.wait(this.CONFIRMATIONS);
            
            // Check the status of the transaction
            return this.checkTransactionStatus(receipt);

        } catch (error) {
            return ({ status: 'error', error });
        }
    }

    /**
     * Validates the input body, ensuring the amountInUsd is a valid number and recipientMaticAddress is a valid Polygon address.
     *
     * @param {object} body - the input object containing amountInUsd and recipientMaticAddress
     * @return {object} the validated amountInUsd and recipientMaticAddress
     */
    validateInput(body) {
        const { amountInUsd, recipientMaticAddress } = body;

        if (isNaN(amountInUsd) || amountInUsd <= 0) {
            throw new Error('Invalid amountInUsd');
        }

        if (!ethers.isAddress(recipientMaticAddress)) {
            throw new Error('Invalid recipientMaticAddress');
        }

        return { amountInUsd, recipientMaticAddress };
    }

    /**
     * Converts the given amount in USD to Matic using the Polyscan API.
     *
     * @param {number} amountInUsd - the amount in USD to convert to Matic
     * @return {object} an object containing the status and the amount in Matic, or an error object
     */
    async convertUsdToMatic(amountInUsd) {
        try {
            const response = await axios.get(`https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=${this.POLYSCAN_API_KEY}`);
            if (response.status != 200 || response.data.result.maticusd === undefined) {
                throw new Error(`${response.data.message} or Matic|Usd data not found`);
            };

            const usdValue = response.data.result.maticusd;

            return ({ status: 'success', amountInMatic: (amountInUsd / usdValue).toFixed(8) });

        } catch (error) {
            if (error.response && error.response.status === 429) {
                // Handle rate limit error
                logger.error('Rate limit exceeded. Please try again later.');
            } else {
                // Handle other errors
                logger.error('An error occurred:', error.message);
            }
            return ({ status: 'error', error });
        }
    }

    /**
     * Creates a transaction with the specified amount in Matic and recipient Polygon address.
     *
     * @param {number} amountInMatic - The amount in Matic to be transferred.
     * @param {string} recipientMaticAddress - The Polygon address of the recipient.
     * @return {Promise<string>} A promise that resolves to the signed transaction.
     */
    async createTransaction(amountInMatic, recipientMaticAddress) {
        // Get the current nonce for the sender's address
        try {
            const nonce = await this.signer.getNonce();

            // Create transaction
            const tx = {
                to: recipientMaticAddress,
                value: ethers.parseEther(amountInMatic),
                gasPrice: (await this.provider.getFeeData()).gasPrice,
                nonce: nonce
            };

            // Estimate the gas required for the transaction and update the limit
            const estimatedGas = await this.signer.estimateGas(tx);
            tx.gasLimit = estimatedGas + 500n; // Add 1000 gas to the limit

            return tx;
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Send a transaction and wait for its receipt.
     *
     * @param {Object} tx - The transaction object to be sent
     * @param {number} [maxRetries=3] - The maximum number of retries for waiting for the receipt
     * @return {Object} The receipt of the transaction
     */
    async sendAndWaitForReceipt(tx, maxRetries = 3) {
        // Send transaction
        const sent = await this.signer.sendTransaction(tx);

        // Wait for confirmations
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const receipt = await sent.wait(this.CONFIRMATIONS);
                return receipt;
            } catch (error) {
                if (error.code === "ProviderError" || error.message.includes("timeout")) {
                    const waitTime = 2 * Math.pow(2, attempt) * 1000; // Exponential backoff
                    logger.error(`ProviderError or Transaction timed out, retrying after ${waitTime / 1000} seconds...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));

                    // Increase gas price slightly
                    const increaseAmt = ethers.parseUnits("1.1", 18); // Increment gas price by 10%
                    tx.gasPrice = (tx.gasPrice * increaseAmt) / 1000000000000000000n; // divided by 10^18 created from the increaseAmt

                    continue; // Retry the transaction
                } else {
                    throw error;
                }
            }
        }

        throw new Error("Transaction confirmation failed after multiple retries");
    }

    /**
     * Check the status of a transaction receipt.
     *
     * @param {object} receipt - the transaction receipt to be checked
     * @return {object} the transaction receipt if status is 1, otherwise throw an error
     */
    checkTransactionStatus(receipt) {
        if (receipt.status === 1 || receipt.status === 0) {
            return receipt;
        } else {
            throw new Error('Transaction failed');
        }
    }
}


const payment_service_matic = new PaymentServiceMatic();
const payment_service_eth = new PaymentServiceEth();
const payment_service_bnb = new PaymentServiceBNB();

module.exports = {
    payment_service_eth,
    payment_service_bnb,
    payment_service_matic,
    PaymentServiceEth,
    PaymentServiceBNB,
    PaymentServiceMatic
};
