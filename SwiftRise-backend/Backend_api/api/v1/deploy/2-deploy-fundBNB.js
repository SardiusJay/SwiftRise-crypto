const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utilsContract/verify");

/**
 * Deploys a FundMeBNB contract using the provided price feed address and verifies the contract on Etherscan if the network is not local.
 *
 * @param {Object} Object containing getNamedAccounts and deployments
 * @return {Promise<void>} Promise that resolves when the contract is deployed and verified
 */
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // use the mock if we are on a local network or use the BNBUsdPriceFeed when on test network
    let BNBUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const BNBUsdAggregator = await get("MockV3Aggregator");
        BNBUsdPriceFeedAddress = await BNBUsdAggregator.address;
    } else if (network.name == "bsc_testnet") {
        BNBUsdPriceFeedAddress = networkConfig[chainId]["bnbUsdPriceFeed"];
    } else {
        return;
    }

    // deploying fundmebnb
    const args = [BNBUsdPriceFeedAddress];
    const fundMeBNB = await deploy("FundMeBNB", {
        from: deployer,
        args: args, // priceFeed Address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // if network isn't local then verify the Contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.BSCAN_API_KEY
    ) {
        await verify(fundMeBNB.address, args);
    }
    log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundmebnb"];
