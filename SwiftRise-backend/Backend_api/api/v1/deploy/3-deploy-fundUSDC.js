const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utilsContract/verify");

/**
 * Deploys a FundMeUSDC contract using the provided USDC Address and verifies the contract on Etherscan if the network is not local.
 *
 * @param {Object} Object containing getNamedAccounts and deployments
 * @return {Promise<void>} Promise that resolves when the contract is deployed and verified
 */
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, get, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // use the mock if we are on a local network or use the USDCContractAddress when on test network
    let USDCContractAddress;
    if (developmentChains.includes(network.name)) {
        const USDCContract = await get("MockUSDC");
        USDCContractAddress = await USDCContract.address;
    } else if (network.name == "sepolia_usdc") {
        USDCContractAddress = networkConfig[chainId]["sepoliaUSDCContractAddress"];
    } else {
        return;
    }

    // deploying fundmeusdc
    const args = [USDCContractAddress];
    const fundMeUSDC = await deploy("FundMeUSDC", {
        from: deployer,
        args: args, // usdc contract address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    // if network isn't local then verify the Contract
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMeUSDC.address, args);
    }
    log("----------------------------------------------------");
};

module.exports.tags = ["all", "fundmeusdc"];
