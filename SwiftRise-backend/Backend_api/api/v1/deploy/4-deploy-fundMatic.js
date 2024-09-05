const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utilsContract/verify");

/**
 * Deploys a FundMematic contract using the provided price feed address and verifies the contract on maticerscan if the network is not local.
 *
 * @param {Object} Object containing getNamedAccounts and deployments
 * @return {Promise<void>} Promise that resolves when the contract is deployed and verified
 */
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // use the mock if we are on a local network or use the maticUsdPriceFeed when on test network
    let maticUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const maticUsdAggregator = await get("MockV3Aggregator");
        maticUsdPriceFeedAddress = await maticUsdAggregator.address;
    } else if (network.name == "polygon") {
        maticUsdPriceFeedAddress = networkConfig[chainId]["maticUsdPriceFeed"];
    } else {
        return;
    }

    // deploying fundme
    const args = [maticUsdPriceFeedAddress];
    const fundMe = await deploy("FundMeMatic", {
        from: deployer,
        args: args, // priceFeed Address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // if network isn't local then verify the Contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.POLYSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
    log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundmematic"];
