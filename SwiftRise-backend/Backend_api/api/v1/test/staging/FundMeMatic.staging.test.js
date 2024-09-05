// STAGING TEST
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

/**
    @title Staging Test Suite for FundMeMatic Contract.
    @author Eyang, Daniel Eyoh
*/

network.name !== "polygon"
    ? describe.skip
    : describe("FundMeMatic Contract", async () => {
        let fundMeMatic;
        let deployer;
        let connectedFundMeMatic;
        let signer;
        const sendValue = ethers.parseUnits("10", 18);
        beforeEach(async () => {
            // Get deployer and get fundMeMatic Contract
            deployer = (await getNamedAccounts()).deployer;
            const fundMeMaticFactory = await ethers.getContractFactory("FundMeMatic");
            fundMeMatic = fundMeMaticFactory.attach(
                (await deployments.get("FundMeMatic")).address
            );

            // Initialize the provider and wallet for user
            const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_TESTNET_RPC_URL); // connect to blockchain
            signer = new ethers.Wallet(process.env.STAGING_USER_PRIVATE, provider); // create wallet

            // Get the connected contract instance
            connectedFundMeMatic = fundMeMatic.connect(signer);
        });

        it("reverts if no balance", async () => {
            await expect(fundMeMatic.withdraw()).to.be.revertedWith("Contract has no balance to withdraw");
        });

        it("reverts when a non-owner attempts to withdraw", async () => {
            expect(connectedFundMeMatic.withdraw()).to.be.revertedWith("Not Contract Owner");
        });

        it("fails if not enough Matic is sent", async () => {
            const notEnoughValue = ethers.parseUnits("5", 18);
            await expect(connectedFundMeMatic.fund({ value: notEnoughValue })).to.be.revertedWith("Not enough Matic to fund contract");
        });

        it("allows to fund the Contract", async () => {
            const txResponse = await connectedFundMeMatic.fund({ value: sendValue });
            await txResponse.wait(1);

            await expect(txResponse)
            .to.emit(fundMeMatic, "UserFunded")
            .withArgs(signer.address, sendValue);
        });

        it("updates contract state and emits events after successful withdrawal", async () => {
            // Similar to dowithdraw function test
            // Perform a withdrawal as the owner
            const txResponse = await fundMeMatic.withdraw();
            await txResponse.wait(1);

            // Expect Contract balance
            const contractBalance = await ethers.provider.getBalance(fundMeMatic.target);
            expect(contractBalance.toString()).to.equal("0");

            // Check for emitted event
            await expect(txResponse)
                .to.emit(fundMeMatic, "WithdrawalSuccessful")
        });
    });
