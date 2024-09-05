// STAGING TEST
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

/**
    @title Staging Test Suite for FundMeEth Contract.
    @author Eyang, Daniel Eyoh
*/

network.name !== "sepolia"
    ? describe.skip
    : describe("FundMeEth Contract", async () => {
        let fundMeEth;
        let deployer;
        let connectedFundMeEth;
        let signer;
        const sendValue = ethers.parseEther("0.009");
        beforeEach(async () => {
            // Get deployer and get fundMeEth Contract
            deployer = (await getNamedAccounts()).deployer;
            const fundMeEthFactory = await ethers.getContractFactory("FundMeEth");
            fundMeEth = fundMeEthFactory.attach(
                (await deployments.get("FundMeEth")).address
            );

            // Initialize the provider and wallet for user
            const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // connect to blockchain
            signer = new ethers.Wallet(process.env.STAGING_USER_PRIVATE, provider); // create wallet

            // Get the connected contract instance
            connectedFundMeEth = fundMeEth.connect(signer);
        });

        it("reverts if no balance", async () => {
            await expect(fundMeEth.withdraw()).to.be.revertedWith("Contract has no balance to withdraw");
        });

        it("reverts when a non-owner attempts to withdraw", async () => {
            expect(connectedFundMeEth.withdraw()).to.be.revertedWith("Not Contract Owner");
        });

        it("fails if not enough Eth is sent", async () => {
            const notEnoughValue = ethers.parseUnits("0.0005", 18);
            await expect(connectedFundMeEth.fund({ value: notEnoughValue })).to.be.revertedWith("Not enough Eth to fund contract");
        });

        it("allows to fund the Contract", async () => {
            const txResponse = await connectedFundMeEth.fund({ value: sendValue });
            await txResponse.wait(1);

            await expect(txResponse)
            .to.emit(fundMeEth, "UserFunded")
            .withArgs(signer.address, sendValue);
        });

        it("updates contract state and emits events after successful withdrawal", async () => {
            // Similar to dowithdraw function test
            // Perform a withdrawal as the owner
            const txResponse = await fundMeEth.withdraw();
            await txResponse.wait(1);

            // Expect Contract balance
            const contractBalance = await ethers.provider.getBalance(fundMeEth.target);
            expect(contractBalance.toString()).to.equal("0");

            // Check for emitted event
            await expect(txResponse)
                .to.emit(fundMeEth, "WithdrawalSuccessful")
        });
    });
