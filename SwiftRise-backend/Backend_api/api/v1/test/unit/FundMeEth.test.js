const { deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { expect } = require("chai");

/**
    @title Test Suite for FundMeEth
    @author Eyang, Daniel Eyoh
    @notice Remove the skip from some tests after test conditions are met.
    @dev This test suite is used to test the FundMeEth class
 */

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMeEth", () => {
        let fundMeEth;
        let deployer;
        let user;
        let mockV3Aggregator;
        let connectedFundMeEth;
        const sendValue = ethers.parseEther("0.1");
        beforeEach(async () => {
            // Get deployer and user
            [deployer, user] = await ethers.getSigners();
            // Deploy all contract
            await deployments.fixture(["all"]);

            // Get the contract factory
            const fundMeEthFactory = await ethers.getContractFactory("FundMeEth");
            // Attach the deployed contract instance
            fundMeEth = fundMeEthFactory.attach(
                (await deployments.get("FundMeEth")).address
            );

            // Get the connected contract instance
            connectedFundMeEth = fundMeEth.connect(user);

            // Get the contract factory for MockV3Aggregator
            const mockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
            // Attach the deployed MockV3Aggregator contract instance
            mockV3Aggregator = mockV3AggregatorFactory.attach(
                (await deployments.get("MockV3Aggregator")).address
            );
        });

        describe("constructor", async () => {
            it("should set the aggregator address correctly", async () => {
                expect(await fundMeEth.getPriceFeed()).to.equal(mockV3Aggregator.target);
            });

            it("should set the owner correctly", async () => {
                expect(await fundMeEth.getOwner()).to.equal(deployer);
            });

            it("initializes the contract state to OPEN", async () => {
                const fundState = await fundMeEth.getFundState();
                expect(fundState.toString()).to.equal("0");
            });
        });

        describe("receive function", async () => {
            it("updates contract balance and emits UserFunded", async () => {
                // Fund the Contract
                const transactionResponse = await user.sendTransaction({
                    to: fundMeEth.target,  // Contract address
                    value: sendValue,
                });
                await transactionResponse.wait(1); 

                const contractBalance = await ethers.provider.getBalance(fundMeEth.target);
                expect(contractBalance.toString()).to.equal(sendValue.toString());

                // Check the 'UserFunded' event was emitted and verify its arguments
                await expect(transactionResponse)
                    .to.emit(fundMeEth, "UserFunded")
                    .withArgs(user.address, sendValue);
            });
        });

        describe("fallback function", async () => {
            it("fallback function updates contract balance", async () => {
                // Similar to 'receive' test, just sending some arbitrary calldata
                const transactionResponse = await user.sendTransaction({
                    to: fundMeEth.target,  // Contract address
                    value: sendValue,
                    data: "0x0066778900e988",
                });
                await transactionResponse.wait(1);

                const contractBalance = await ethers.provider.getBalance(fundMeEth.target);
                expect(contractBalance.toString()).to.equal(sendValue.toString());

                // Check the 'UserFunded' event was emitted and verify its arguments
                await expect(transactionResponse)
                    .to.emit(fundMeEth, "UserFunded")
                    .withArgs(user.address, sendValue);
            });
        });

        describe("fund function", async () => {
            it("fails if not enough ETH is sent", async () => {
                await expect(connectedFundMeEth.fund()).to.be.revertedWith("Not enough Eth to fund contract");
            });

            it.skip("reverts if the contract state is not OPEN", async () => {
                // Set the contract state to PENDING
                await fundMeEth.setFundState();

                // Attempt to call the fund function
                await expect(connectedFundMeEth.fund({ value: sendValue })).to.be.revertedWith("Contract is not open for funding");
            });

            it("emits the UserFunded event", async function () {
                await expect(connectedFundMeEth.fund({ value: sendValue }))
                    .to.emit(fundMeEth, "UserFunded")
                    .withArgs(user.address, sendValue);
            });
        });

        // Before running this test. Change the state of the doWithdraw function to external
        describe.skip("doWithdraw function", async () => {
            describe("success", async () => {
                beforeEach(async () => {
                    // Fund Contract
                    await connectedFundMeEth.fund({ value: sendValue });
                });

                it("withdraws funds when there is a balance", async function () {
                    // Get initial balances
                    const initialDeployerBalance = await ethers.provider.getBalance(deployer.address);
                    const initialContractBalance = await ethers.provider.getBalance(fundMeEth.target);

                    // Perform the withdrawal
                    const transactionResponse = await fundMeEth.doWithdraw();
                    const transactionReceipt = await transactionResponse.wait(1);
                    const { gasUsed, gasPrice } = transactionReceipt;
                    const gasCost = gasUsed * gasPrice;

                    // Get ending balances
                    const endingDeployerBalance = await ethers.provider.getBalance(deployer.address);
                    const endingContractBalance = await ethers.provider.getBalance(fundMeEth.target);

                    // Balances change correctly
                    expect(endingContractBalance).to.equal(0);
                    expect((initialContractBalance + initialDeployerBalance).toString()).to.equal((
                        endingDeployerBalance + gasCost).toString()
                    );
                });

                it("emits the WithdrawalSuccessful event", async () => {
                    // Initial balance before withdrawal
                    const initialContractBalance = await ethers.provider.getBalance(fundMeEth.target);

                    // Make Withdrawal
                    const transactionResponse = await fundMeEth.doWithdraw();
                    await transactionResponse.wait(1);

                    // Get balance after withdrawal
                    const finalContractBalance = await ethers.provider.getBalance(fundMeEth.target);

                    await expect(transactionResponse)
                        .to.emit(fundMeEth, "WithdrawalSuccessful")
                        .withArgs(deployer.address, initialContractBalance, finalContractBalance);
                });

                it("should return true (a truthy value)", async () => {
                    // Withdraw from the Contract
                    const result = await fundMeEth.doWithdraw();
                    expect(result).to.be.ok;
                });
            });

            describe("failure", async () => {
                it("reverts if no balance", async () => {
                    await expect(fundMeEth.doWithdraw()).to.be.revertedWith("Contract has no balance to withdraw");
                });

                it("reverts if the sender is not the owner", async () => {
                    // Call withdraw with user
                    await expect(connectedFundMeEth.doWithdraw()).to.be.revertedWith("Not Contract Owner");
                });

                it.skip("reverts if reentrancy occurs", async () => {
                    // trigger reentrancy
                    await fundMeEth.setLock();

                    // Call withdraw
                    await expect(fundMeEth.doWithdraw()).to.be.revertedWith("Contract is locked for withdrawal");
                });
            });
        });

        describe("withdraw function", async () => {
            beforeEach(async () => {
                // Fund Contract
                await connectedFundMeEth.fund({ value: sendValue });
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

            it("reverts when a non-owner attempts to withdraw", async () => {
                expect(connectedFundMeEth.withdraw()).to.be.revertedWith("Not Contract Owner");
            });

            // Note: This test only works on certain condition, setup the conditions before uncommenting.
            // 1. Comment the codes after the withdraw function third line in FundMeEth contract
            it.skip("set fundState to PENDING", async () => {
                const initial_FundState = await fundMeEth.getFundState();

                // Call the withdraw function
                await fundMeEth.withdraw();

                expect(initial_FundState).to.not.equal(await fundMeEth.getFundState())
            });

            it.skip("changes fundState to OPEN after withdrawal", async () => {
                // Set fundState to PENDING.
                await fundMeEth.setFundState();
                const pendingState = await fundMeEth.getFundState();

                // Call the withdraw function
                const txResponse = await fundMeEth.withdraw();
                await txResponse.wait(1);

                const recentState = await fundMeEth.getFundState();
                // Expect fundState to not PENDING
                expect(recentState).to.not.equal(pendingState);
            });
        });

        describe("view functions", async () => {
            it("returns the correct owner address", async () => {
                const owner = await fundMeEth.getOwner();
                expect(owner).to.equal(deployer);
            });

            it("should get PriceFeed", async () => {
                expect(await fundMeEth.getPriceFeed()).to.equal(mockV3Aggregator.target);
            });

            it("should convert usd to eth", async () => {
                const usdAmount = ethers.parseEther("10"); // 10 USD

                // We'll need some expected ETH result based on the current mock price feed data.
                // To keep the test meaningful, I set a hypothetical price as returned by the price feed mock:
                const expectedEthAmount = ethers.parseEther("0.005");  // (1 ETH = 200 USD)

                const ethAmount = await fundMeEth.getUsdToEth(usdAmount);

                // We use some approximation in comparing ETH values due to potential rounding and precision.
                expect(ethAmount.toString()).to.equal(expectedEthAmount.toString()); 
            });

            it("should get the fundState", async () => {
                expect(await fundMeEth.getFundState()).to.equal("0");
            });
        });
    });
