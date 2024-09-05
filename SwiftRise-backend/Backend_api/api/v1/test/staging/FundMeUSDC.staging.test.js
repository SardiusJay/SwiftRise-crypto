// STAGING TEST
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { expect } = require("chai");
require('dotenv').config();

/**
    @title Staging Test Suite for FundMeUSDC Contract.
    @author Eyang, Daniel Eyoh
*/

network.name !== "sepolia_usdc"
    ? describe.skip
    : describe("FundMeUSDC Contract", async () => {
        let fundMeUSDC;
        let deployer;
        let connectedFundMeUSDC;
        let signer;
        const amount = ethers.parseUnits("10", 6);
        const USDCAddress = process.env.SEPOLIA_USDC_CONTRACT_ADDRESS;
        beforeEach(async () => {
            // Get deployer and get fundMeUSDC Contract
            deployer = (await getNamedAccounts()).deployer;
            const fundMeUSDCFactory = await ethers.getContractFactory("FundMeUSDC");
            fundMeUSDC = fundMeUSDCFactory.attach(
                (await deployments.get("FundMeUSDC")).address
            );

            // Initialize the provider and wallet for user
            const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // connect to blockchain
            signer = new ethers.Wallet(process.env.STAGING_USER_PRIVATE, provider); // create wallet

            // Get the connected contract instance
            connectedFundMeUSDC = fundMeUSDC.connect(signer);
        });

        describe("constructor", async () => {
            it("should set the USDCAddress correctly", async () => {
                expect(await fundMeUSDC.getUSDC()).to.equal(USDCAddress);
            });

            it("should set the owner correctly", async () => {
                expect(await fundMeUSDC.getOwner()).to.equal(deployer);
            });
        });

        describe("withdrawal failed", async () => {
            it("reverts if no balance", async () => {
                await expect(fundMeUSDC.withdraw()).to.be.revertedWith("Contract has no balance to withdraw");
            });

            it("reverts when a non-owner attempts to withdraw", async () => {
                expect(connectedFundMeUSDC.withdraw()).to.be.revertedWith("Not Contract Owner");
            });
        });

        // Before running this fund function test below, .
        describe("fund function", async () => {
            it("falls if user balance is less than funding amount", async () => {
                await expect(fundMeUSDC.fund(amount)).to.be.revertedWithCustomError(fundMeUSDC, "Not enough USDC to fund contract");
            });

            it("fails if not enough USD is sent", async () => {
                const lessAmount = 5;
                await expect(connectedFundMeUSDC.fund(lessAmount)).to.be.revertedWithCustomError(fundMeUSDC, "Not enough USDC to fund contract");
            });

            it("emits the UserFunded event", async function () {
                const txResponse = await connectedFundMeUSDC.fund(amount);
                await txResponse.wait(1);

                await expect(txResponse)
                    .to.emit(fundMeUSDC, "UserFunded")
                    .withArgs(signer.address, amount);
            });
        });

        describe("withdraw success", async () => {
            it("updates contract state and emits events after successful withdrawal", async () => {
                // Perform a withdrawal as the owner
                const txResponse = await fundMeUSDC.withdraw();
                await txResponse.wait(1);

                // Expect Contract balance
                const contractBalance = await fundMeUSDC.getBalance(fundMeUSDC.target);
                expect(contractBalance.toString()).to.equal("0");

                // Check for emitted event
                await expect(txResponse)
                    .to.emit(fundMeUSDC, "WithdrawalSuccessful")
            });
        });

        describe("view function", async () => {
            it("should get the fundState", async () => {
                expect(await fundMeUSDC.getFundState()).to.equal("0");
            });
        });
    });
