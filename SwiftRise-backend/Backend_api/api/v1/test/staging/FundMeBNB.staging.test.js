// STAGING TEST
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

/**
    @title Staging Test Suite for FundMeBNB Contract.
    @author Eyang, Daniel Eyoh
 */

network.name !== "bsc_testnet"
    ? describe.skip
    : describe("FundMeBNB Contract", async () => {
        let fundMeBNB;
        let deployer;
        let connectedFundMeBNB;
        let signer;
        const sendValue = ethers.parseUnits("0.09", 18);
        beforeEach(async () => {
            // Get deployer and get fundMeBNB Contract
            deployer = (await getNamedAccounts()).deployer;
            const fundMeBNBFactory = await ethers.getContractFactory("FundMeBNB");
            fundMeBNB = fundMeBNBFactory.attach(
                (await deployments.get("FundMeBNB")).address
            );

            // Initialize the provider and wallet for user
            const provider = new ethers.JsonRpcProvider(process.env.BNB_TESTNET_RPC_URL); // connect to blockchain
            signer = new ethers.Wallet(process.env.STAGING_USER_PRIVATE, provider); // create wallet

            // Get the connected contract instance
            connectedFundMeBNB = fundMeBNB.connect(signer);
        });

        it("reverts if no balance", async () => {
            await expect(fundMeBNB.withdraw()).to.be.revertedWith("Contract has no balance to withdraw");
        });

        it("reverts when a non-owner attempts to withdraw", async () => {
            expect(connectedFundMeBNB.withdraw()).to.be.revertedWith("Not Contract Owner");
        });

        it("fails if not enough BNB is sent", async () => {
            const notEnoughValue = ethers.parseUnits("0.005", 18);
            await expect(connectedFundMeBNB.fund({ value: notEnoughValue })).to.be.revertedWith("Not enough BNB to fund contract");
        });

        it("allows to fund the Contract", async () => {
            const txResponse = await connectedFundMeBNB.fund({ value: sendValue });
            await txResponse.wait(1);
            
            await expect(txResponse)
            .to.emit(fundMeBNB, "UserFunded")
            .withArgs(signer.address, sendValue);
        });

        it("updates contract state and emits events after successful withdrawal", async () => {
            // Similar to dowithdraw function test
            // Perform a withdrawal as the owner
            const txResponse = await fundMeBNB.withdraw();
            await txResponse.wait(1);

            // Expect Contract balance
            const contractBalance = await ethers.provider.getBalance(fundMeBNB.target);
            expect(contractBalance.toString()).to.equal("0");

            // Check for emitted event
            await expect(txResponse)
                .to.emit(fundMeBNB, "WithdrawalSuccessful")
        });
    });
