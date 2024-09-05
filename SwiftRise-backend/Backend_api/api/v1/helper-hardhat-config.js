require("dotenv").config();

/** Import Network */
const NAME = process.env.NETWORK_NAME;
const ETHUSDPRICEFEED = process.env.ETHUSDPRICEFEED;

const NAME_2 = process.env.NETWORK_NAME_2;
const BNBUSDPRICEFEED = process.env.BNBUSDPRICEFEED;

const NAME_3 = process.env.NETWORK_NAME_3;
const POLYGONPRICEFEED = process.env.POLYGONPRICEFEED;

const networkConfig = {
  11155111: {
    name: NAME,
    ethUsdPriceFeed: ETHUSDPRICEFEED,
  },
  97: {
    name: NAME_2,
    bnbUsdPriceFeed: BNBUSDPRICEFEED,
  },
  80002: {
    name: NAME_3,
    maticUsdPriceFeed: POLYGONPRICEFEED
  },
};

const developmentChains = ["hardhat", "localhost"]; // if there is no feed for the network then run the default.
// Contructor param for the mock contract
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
