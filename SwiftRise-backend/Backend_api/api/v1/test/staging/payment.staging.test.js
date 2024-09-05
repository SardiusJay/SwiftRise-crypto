const { expect } = require('chai');
const { PaymentServiceEth, PaymentServiceBNB, PaymentServiceMatic } = require('../../services/payment_service');
const { developmentChains } = require("../../helper-hardhat-config");
const { network } = require("hardhat");
require('dotenv').config();

/**
    @title Staging Test Suites for PaymentServices.
    @author Eyang, Daniel Eyoh
 */

developmentChains.includes(network.name)
    ? describe.skip
    :  network.name === "sepolia" ?
        describe('PaymentServiceEth', () => {
            let paymentServiceEth;
            let recipientTest;

            beforeEach(() => {
                paymentServiceEth = new PaymentServiceEth();
                recipientTest = process.env.TEST_RECIPIENT;
            });

            it("should fail if there's no money in the balance", async () => {
                const result = await paymentServiceEth.withdraw();
                expect(result.error.reason).to.be.equal("Contract has no balance to withdraw");
            });

            it('should transfer funds successfully', async () => {
                // Create object with amountInUsd and recipientEthAddress
                const body = {
                    amountInUsd:  20, // Amount to transfer in USD
                    recipientEthAddress: recipientTest // Recipient Ethereum address
                };

                const result = await paymentServiceEth.transfer(body);

                expect(result).to.have.property('status',  1);
                expect(result).to.have.property('hash');
            });

            it('should successfully withdraw the money from the contract', async () => {
                const result = await paymentServiceEth.withdraw();

                expect(result).to.have.property('status',  1);
                expect(result).to.have.property('hash');
            });
        })

    : network.name === "bsc_testnet" ?
        describe('PaymentServiceBNB', () => {
            let paymentServiceBNB;
            let recipientTest;

            beforeEach(() => {
                paymentServiceBNB = new PaymentServiceBNB();
                recipientTest = process.env.TEST_RECIPIENT;
            });

            it("should fail if there's no money in the balance", async () => {
                const result = await paymentServiceBNB.withdraw();
                expect(result.error.reason).to.be.equal("Contract has no balance to withdraw")
            });

            it('should transfer funds successfully', async () => {
                // Create object with amountInUsd and recipientBNBAddress
                const body = {
                    amountInUsd:  20, // Amount to transfer in USD
                    recipientBNBAddress: recipientTest // Recipient BNB address
                };

                const result = await paymentServiceBNB.transfer(body);

                expect(result).to.have.property('status',  1);
                expect(result).to.have.property('hash');
            });

            it('should successfully withdraw the money from the contract', async () => {
                const result = await paymentServiceBNB.withdraw();

                expect(result).to.have.property('status',  1);
                expect(result).to.have.property('hash');
            });
        })

    : network.name === "polygon" ?
        describe('PaymentServiceMatic', () => {
            let paymentServiceMatic;
            let recipientTest;

            beforeEach(() => {
                paymentServiceMatic = new PaymentServiceMatic();
                recipientTest = process.env.TEST_RECIPIENT;
            });

            it("should fail if there's no money in the balance", async () => {
                const result = await paymentServiceMatic.withdraw();
                expect(result.error.reason).to.be.equal("Contract has no balance to withdraw")
            });

            it('should transfer funds successfully', async () => {
                // Create object with amountInUsd and recipientBNBAddress
                const body = {
                    amountInUsd:  2, // Amount to transfer in USD
                    recipientMaticAddress: recipientTest // Recipient Matic address
                };

                const result = await paymentServiceMatic.transfer(body);

                expect(result).to.have.property('status',  1);
                expect(result).to.have.property('hash');
            });

            it('should successfully withdraw the money from the contract', async () => {
                const result = await paymentServiceMatic.withdraw();

                expect(result).to.have.property('status',  1);
                expect(result).to.have.property('hash');
            });
        })

    : describe.skip;
