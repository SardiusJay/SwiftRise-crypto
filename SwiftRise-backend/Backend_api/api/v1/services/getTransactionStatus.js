const ethers = require('ethers');
const { logger } = require('../logger');
const { Contract } = require('../models/engine/db_storage');
const axios = require('axios');
require('dotenv').config();

class GetTransactionStatus {
    /**
     * Constructor for initializing environment-specific variables and creating provider and wallet.
     */
    constructor() {
        this.provider;
    }

    /**
     * Initialize the provider and wallet
     *
     * @param {string} coin - the type of coin to initialize for
     * @return {Promise<void>}
     */
    async initialize(coin) {
        // Initialize the provider and wallet
        if (process.env.ENVIRONMENT === 'test') {
            if (coin === "ETH") {
                this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // connect to Eth blockchain
            } else if (coin === "BNB") {
                this.provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL); // connect to bnb blockchain
            } else {
                this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_TESTNET_RPC_URL); // connect to polygon blockchain
            };
        };

        if (process.env.ENVIRONMENT == 'production') {
            ;
        };
    }

    /**
     * Asynchronously gets the status of a successfully mined transaction.
     *
     * @param {string} coin - The type of coin for the transaction
     * @param {string} transactionHash - The hash of the transaction
     * @return {boolean} returns true of transaction was successyfully mined or false if not.
     */
    async getStatus(coin, transactionHash) {
        // Initiaize the constructor variables
        await this.initialize(coin);

        try {
            const tx = await this.provider.getTransactionReceipt(transactionHash);
            if (!tx) {
                return false;
            }

            return tx.status === 1;
        } catch (error) {
            logger.error('Error fetching transaction details:', error);
            throw error;
        }
    };

    /**
     * Asynchronously verify the deposit transaction.
     *
     * @param {string} coin - The type of coin for the transaction.
     * @param {string} transactionHash - The hash of the deposit transaction.
     * @param {string} [status="SUCCESSFUL"] - The status of the transaction being passed
     * @return {boolean} if valid return the amount, return false if not valid or return PENDING if not resolved
     */
    async getDepositStatus(coin, transactionHash, status="SUCCESSFUL") {
        // Initiaize the constructor variables
        await this.initialize(coin);
        let usdValue;
        let contractAddress;

        try {
            // Fetch usd value for blockchain
            if (coin === "ETH") {
                const response = await axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`);
                if (response.status != 200 || response.data.result.ethusd === undefined) {
                    throw new Error(`${response.data.message} or Eth|Usd data not found`);
                };

                contractAddress = (await Contract.findOne({ coin: coin })).address;
                usdValue = response.data.result.ethusd;
            } else if (coin === "BNB") {
                const response = await axios.get(`https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${process.env.BSCAN_API_KEY}`);
                if (response.status != 200 || response.data.result.ethusd === undefined) {
                    throw new Error(`${response.data.message} or Eth|Usd data not found`);
                };

                contractAddress = (await Contract.findOne({ coin: coin })).address;
                usdValue = response.data.result.ethusd;
            } else {
                const response = await axios.get(`https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=${process.env.POLYSCAN_API_KEY}`);
                if (response.status != 200 || response.data.result.maticusd === undefined) {
                    throw new Error(`${response.data.message} or Matic|Usd data not found`);
                };

                contractAddress = (await Contract.findOne({ coin: coin })).address;
                usdValue = response.data.result.maticusd;
            }

            // Fetch transaction
            // verify if transaction status was successful (status == 1)
            // verify the transaction was funded to the right contract address
            const txR = await this.provider.getTransactionReceipt(transactionHash);
            if (status === "PENDING") {  // Handle when status is pending
                if (!txR || (txR.status !== 1 && txR.status !== 0)) {
                    return "PENDING";
                };
            }

            if (!txR || txR.status !== 1 || txR.to !== contractAddress) {
                return false;
            }

            // Get the amount funded
            const tx = await this.provider.getTransaction(transactionHash);
            const amount = parseFloat(ethers.formatEther(tx.value.toString())).toFixed(3);

            return parseFloat((amount * usdValue).toFixed(2));

        } catch (error) {
            logger.error('Error fetching transaction details:', error);
            throw (error);
        }
    };
};

const get_transaction_status = new GetTransactionStatus();

module.exports = { GetTransactionStatus, get_transaction_status };
