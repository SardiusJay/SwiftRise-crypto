const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utilsContract/verify");

/**
 * Deploys a FundMeEth contract using the provided price feed address and verifies the contract on Etherscan if the network is not local.
 *
 * @param {Object} Object containing getNamedAccounts and deployments
 * @return {Promise<void>} Promise that resolves when the contract is deployed and verified
 */
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // use the mock if we are on a local network or use the ethUsdPriceFeed when on test network
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = await ethUsdAggregator.address;
    } else if (network.name == "sepolia") {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    } else {
        return;
    }

    // deploying fundme
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMeEth", {
        from: deployer,
        args: args, // priceFeed Address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // if network isn't local then verify the Contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
    log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
