const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("Local Network Detected! Deploying mocks...");
        // Deploy the MockV3Aggregator
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });

        // Deploy the MockUSDC contract
        await deploy("MockUSDC", {
            contract: "MockUSDC",
            from: deployer,
            log: true
        });
        log("Mocks Deployed!");
        log("-------------------------");
    };
};

module.exports.tags = ["all", "mocks"];
