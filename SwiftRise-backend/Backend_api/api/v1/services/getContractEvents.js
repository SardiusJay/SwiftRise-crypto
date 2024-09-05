/**
 * Contains the Events for All the CyptoCoins
 * handles all funding payment and Owner withdrawal verifications
 * @author Eyang Daniel Eyoh <https://github.com/Tediyang>
*/

const ethers = require('ethers');
const wallet = require('../encryption/decryptKey');
const { Contract } = require('../models/engine/db_storage');
const { logger } = require('../logger');
require('dotenv').config();
const axios = require('axios');


class GetEvents {
    /**
     * Constructor for initializing environment-specific variables and creating provider and wallet.
     */
    constructor() {
        this.provider;
        this.signer;
        this.contract;
        this.usdValue;
    }

    // Initialize constructor variables
    async initialize(coin) {
        // Initialize the provider and wallet
        if (process.env.ENVIRONMENT === 'test') {
            if (coin === "ETH") {
                this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // connect to Eth blockchain
                this.signer = new ethers.Wallet((await wallet()).privateKey, this.provider); // create Eth wallet
                const contractData = await Contract.findOne({ coin: coin });
                // Get ETHUSD value
                const response = await axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`);
                if (response.status != 200 || response.data.result.ethusd === undefined) {
                    throw new Error(`${response.data.message} or Eth|Usd data not found`);
                };

                this.usdValue = response.data.result.ethusd;

                this.contract = new ethers.Contract(  // Initialize the ethereum contract
                    contractData.address,
                    contractData.abi,
                    this.signer
                );
            } else if (coin === "BNB") {
                this.provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL); // connect to bnb blockchain
                this.signer = new ethers.Wallet((await wallet()).privateKey, this.provider); // create bnb wallet
                const contractData = await Contract.findOne({ coin: coin });
                // Get BNBUSD value
                const response = await axios.get(`https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${process.env.BSCAN_API_KEY}`);
                if (response.status != 200 || response.data.result.ethusd === undefined) {
                    throw new Error(`${response.data.message} or Eth|Usd data not found`);
                };

                this.usdValue = response.data.result.ethusd;

                this.contract = new ethers.Contract(  // Initialize the bnb contract
                    contractData.address,
                    contractData.abi,
                    this.signer
                );
            } else {
                this.provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_TESTNET_RPC_URL); // connect to polygon blockchain
                this.signer = new ethers.Wallet((await wallet()).privateKey, this.provider); // create matic wallet
                const contractData = await Contract.findOne({ coin: coin });
                const response = await axios.get(`https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=${process.env.POLYSCAN_API_KEY}`);
                // MATICUSD
                if (response.status != 200 || response.data.result.maticusd === undefined) {
                    throw new Error(`${response.data.message} or Matic|Usd data not found`);
                };

                this.usdValue = response.data.result.maticusd;

                this.contract = new ethers.Contract(  // Initialize the polygon contract
                    contractData.address,
                    contractData.abi,
                    this.signer
                );
            };
        };

        if (process.env.ENVIRONMENT == 'production') {
            ;
        };
    }

    /**
     * Get the UserFunded Event.
     *
     * @param {String} coin - the blockchain coin
     * @param {String} funderAddress - The user wallet Address
     * @param {number} [event=0] - The Event to return, 0 - meaning last by default
     * @return {Object} The Event for the specified wallet address or return null if there isn't.
     */
    async getUserFundedEvent(coin, funderAddress, event = 0) {
        // Initiaize the constructor variables
        await this.initialize(coin);

        // Define the event filter
        const userFundedFilter = this.contract.filters.UserFunded(funderAddress);

        try {
            // Fetch UserFunded event logs for the specific funder
            const events = await this.contract.queryFilter(userFundedFilter, 0, 'latest');

            // Sort events by block number in descending order
            events.sort((a, b) => b.blockNumber - a.blockNumber);

            // Return the specified event
            const eventData = events[event];
            if (!eventData) {
                return null;
            }

            const amount = parseFloat(ethers.formatUnits(eventData.args.amount, 18)).toFixed(3);
            return {
                coin: coin,
                blockNumber: eventData.blockNumber,
                amount: parseFloat((amount * this.usdValue).toFixed(2)),
                transactionHash: eventData.transactionHash
            }

        } catch (error) {
            if (error.message.includes("UNCONFIGURED_NAME")) {
                logger.error(`No Event for ${funderAddress} found`)
                throw new Error("User address not found or has no events");
            };

            logger.error(`Error fetching UserFunded events for ${funderAddress}, ${error}`);
            return null;
        };
    };

    /**
     * Get the withdrawal Event.
     *
     * @param {String} coin - the blockchain coin.
     * @param {number} [event=0] - The Event to return, 0 - meaning last by default.
     * @return {Object} The Event for the specified or return null if there isn't.
     */
    async getWithdrawalEvent(coin, event = 0) {
        // Initialize the constructor variables
        await this.initialize(coin);

        // Define the Event
        const Withdrawals = this.contract.filters.WithdrawalSuccessful(this.signer.address);

        try {
            // Fetch UserFunded event logs for the specific funder
            const events = await this.contract.queryFilter(Withdrawals, 0, 'latest');
    
            // Sort events by block number in descending order
            events.sort((a, b) => b.blockNumber - a.blockNumber);

            // Return the specified event 
            const eventData = events[event];
            if (!eventData) {
                return null;
            };

            const befAmount = parseFloat(ethers.formatUnits(eventData.args.beforeAmount, 18)).toFixed(3);
            const aftAmount = parseFloat(ethers.formatUnits(eventData.args.afterAmount, 18)).toFixed(3);
            return {
                coin: coin,
                blockNumber: eventData.blockNumber,
                beforeAmount: parseFloat((befAmount * this.usdValue).toFixed(2)),
                afterAmount: parseFloat((aftAmount * this.usdValue).toFixed(2)),
                transactionHash: eventData.transactionHash
            }

        } catch (error) {
            logger.error(`Error fetching UserFunded events ${funderAddress}:`, error);
            return null;
        }
    };
}
const getEvents = new GetEvents();
module.exports = { GetEvents, getEvents };
