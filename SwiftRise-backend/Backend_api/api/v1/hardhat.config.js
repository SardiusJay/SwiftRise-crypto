require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-ethers");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

const BNB_TESTNET_RPC_URL = process.env.BNB_TESTNET_RPC_URL;
const BNB_TESTNET_PRIVATE_KEY = process.env.BNB_TESTNET_PRIVATE_KEY;

const POLYGON_AMOY_TESTNET_RPC_URl = process.env.POLYGON_AMOY_TESTNET_RPC_URl;
const POLYGON_AMOY_PRIVATE_KEY = process.env.POLYGON_AMOY_PRIVATE_KEY;

// const MAIN_RPC_URL = process.env.MAIN_RPC_URL;
// const MAIN_PRIVATE_KEY = require("./encryption/decryptKey");
// const MAIN_CHAIN_ID = process.env.MAIN_CHAIN_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const BSCAN_API_KEY = process.env.BSCAN_API_KEY;
const POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 5,
    },
    bsc_testnet: {
      url: BNB_TESTNET_RPC_URL,
      accounts: [BNB_TESTNET_PRIVATE_KEY],
      chainId: 97,
      blockConfirmations: 5,
      gasPrice: 20000000000,
    },
    polygon: {
      url: POLYGON_AMOY_TESTNET_RPC_URl,
      accounts: [POLYGON_AMOY_PRIVATE_KEY],
      chainId: 80002,
      blockConfirmations: 5
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      // hardhat provides
      chainId: 31337,
    },
  },
  solidity: "0.8.20",
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      bscTestnet: BSCAN_API_KEY,
      polygon: POLYSCAN_API_KEY
    },
    customChains: [
      {
        network: "polygon",
        chainId: 80002,
        urls: {
          apiURL: "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygonAmoy",
          browserURL: "https://www.oklink.com/amoy"
        }
      }
    ]
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  }, 
  mocha: {
    timeout: 540000 // Timeout
  }
};
