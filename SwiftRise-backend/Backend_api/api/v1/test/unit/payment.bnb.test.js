const { expect } = require('chai');
const { PaymentServiceBNB } = require('../../services/payment_service');
const { developmentChains } = require("../../helper-hardhat-config");
const sinon = require('sinon');
const axios = require('axios');
const ethers = require("ethers");
require('dotenv').config();

/**
    @title Test Suite for PaymentServices.
    @author Eyang, Daniel Eyoh
    @notice Remove the skip from the describe before running the test.
    @dev This test suite is used to test the PaymentServiceBNB classes.
 */

!developmentChains.includes(network.name)
    ? describe.skip
    : describe('PaymentServiceBNB', () => {
        let paymentServiceBNB;
        let recipientTest;

        beforeEach(async () => {
            paymentServiceBNB = new PaymentServiceBNB();
            recipientTest = process.env.TEST_RECIPIENT;
            // Initialize the provider and wallet
            await paymentServiceBNB.init();

            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('#validateInput', () => {
            it('should throw an error if amountInUsd is not a number or is less than or equal to zero', () => {
                expect(() => paymentServiceBNB.validateInput({ amountInUsd: 'invalid', recipientBNBAddress: recipientTest })).to.throw(Error);
                expect(() => paymentServiceBNB.validateInput({ amountInUsd:  0, recipientBNBAddress: recipientTest })).to.throw(Error);
            });

            it('should throw an error if recipientBNBAddress is not a valid BNB address', () => {
                expect(() => paymentServiceBNB.validateInput({ amountInUsd:  1, recipientBNBAddress: 'invalid' })).to.throw(Error);
            });

            it('should return the validated input if it is correct', () => {
                const result = paymentServiceBNB.validateInput({ amountInUsd:  1, recipientBNBAddress: recipientTest });
                expect(result).to.deep.equal({ amountInUsd:  1, recipientBNBAddress: recipientTest });
            });
        });

        describe('#convertUsdToBNB', () => {
            it('should throw an error if the Bscan API fails to respond', async () => {
                sandbox.stub(axios, 'get').throws(new Error('Network error'));
                try {
                    await paymentServiceBNB.convertUsdToBNB(100);
                } catch (err) {
                    expect(err.message).to.equal('Network error');
                }
            });

            it('should throw an error if the Bscan API does not return a 200 status code', async () => {
                // Stub axios.get to return a non-200 status code
                const errorResponse = {
                    response: {
                        status:  500,
                        data: {
                            message: 'Internal Server Error'
                        }
                    }
                };
                sandbox.stub(axios, 'get').throws(errorResponse);

                try {
                    await paymentServiceBNB.convertUsdToBNB(100);
                } catch (err) {
                    expect(err.message).to.equal('Internal Server Error or Eth|Usd data not found');
                }
            });

            it('should log a rate limit error and return an error object if the Bscan API rate limit is exceeded', async () => {
                // Stub axios.get to return a  429 status code
                const errorResponse = {
                    response: {
                        status:  429
                    }
                };
                sandbox.stub(axios, 'get').throws(errorResponse);

                // Call the method and capture the logged message
                let loggedMessage = '';
                sandbox.stub(console, 'log').callsFake((msg) => {
                    loggedMessage = msg;
                });

                const result = await paymentServiceBNB.convertUsdToBNB(100);

                // Check that the correct message was logged
                expect(loggedMessage).to.equal('Rate limit exceeded. Please try again later.');

                // Check that the returned object has the correct error message
                expect(result).to.deep.equal({ status: 'error', error: { response: { status:  429 } } });
            });

            it('should return error if Eth|Usd data not found in Bscan response', async () => {
                const mockResponse = {
                    status: 200,
                    data: {
                        result: {} // remove ethusd property
                    }
                };
                sandbox.stub(axios, 'get').returns(mockResponse);
                const result = await paymentServiceBNB.convertUsdToBNB(100);
                expect(result.status).to.equal('error');
                expect(result.error.message).to.equal('undefined or Eth|Usd data not found');
            });

            it('should return converted amount if Bscan API succeeds', async () => {
                const mockResponse = {
                    status: 200,
                    data: {
                        result: {
                            ethusd: 2000
                        }
                    }
                };
                sandbox.stub(axios, 'get').returns(mockResponse);
                const result = await paymentServiceBNB.convertUsdToBNB(100);
                expect(result).to.deep.equal({ status: 'success', amountInBNB: '0.05' });
            });
        });

        describe('#createTransaction', () => {
            it('should create a transaction with the correct parameters', async () => {
                // Mock the necessary methods
                const mockNonce =  1;
                const mockGasPrice = ethers.parseUnits('10', 'gwei');
                const mockGasLimit =  21000n;
                const mockAmountInBNB =  ethers.parseUnits("0.01", 18);
                const mockRecipientBNBAddress = recipientTest;
        
                sandbox.stub(paymentServiceBNB.signer, 'getNonce').returns(mockNonce);
                sandbox.stub(paymentServiceBNB.signer, 'estimateGas').returns(mockGasLimit);
                sandbox.stub(paymentServiceBNB.provider, 'getFeeData').returns({ gasPrice: mockGasPrice });

                // Call the createTransaction method
                const transaction = await paymentServiceBNB.createTransaction(mockAmountInBNB.toString(), mockRecipientBNBAddress);

                // Verify the transaction details
                expect(transaction.to).to.equal(mockRecipientBNBAddress);
                expect(transaction.value).to.deep.equal(ethers.parseEther(mockAmountInBNB.toString()));
                expect(transaction.gasPrice).to.deep.equal(mockGasPrice);
                expect(transaction.nonce).to.equal(mockNonce);
                expect(transaction.gasLimit).to.be.equal(mockGasLimit +  500n);
            });
        });

        describe('#sendAndWaitForReceipt', () => {
            // create transaction
            const tx = {
                to: recipientTest,
                value: ethers.parseUnits('0.01', 18),
                gasPrice: ethers.parseUnits('10', 'gwei'),
                nonce:  1
            };

            it('should fail immediately if the transaction fails', async () => {
                // Mock the necessary methods
                const mockTx = {
                    wait: sandbox.stub().rejects(new Error('Transaction failed'))
                };
                sandbox.stub(paymentServiceBNB.signer, 'sendTransaction').resolves(mockTx);

                // Call the sendAndWaitForReceipt method
                try {
                    await paymentServiceBNB.sendAndWaitForReceipt({});
                } catch (error) {
                    // Verify the error
                    expect(error.message).to.equal('Transaction failed');
                    expect(paymentServiceBNB.signer.sendTransaction.calledOnce).to.be.true;
                    expect(mockTx.wait.calledOnce).to.be.true;
                }
            });

            it.skip('should retry sending a transaction if it times out', async () => {  // Remove 'skip' if you want to run this test
                // Mock the necessary methods
                const mockTx = {
                    wait: sandbox.stub()
                    .onFirstCall().rejects(new Error('timeout')) // Mock a timeout error
                    .onSecondCall().resolves({ status:  1 }) // Mock a successful receipt on the second attempt
                };
                sandbox.stub(paymentServiceBNB.signer, 'sendTransaction').resolves(mockTx);

                // Call the sendAndWaitForReceipt method
                const receipt = await paymentServiceBNB.sendAndWaitForReceipt(tx);

                // Verify the receipt
                expect(receipt.status).to.equal(1);
                expect(paymentServiceBNB.signer.sendTransaction.calledOnce).to.be.true;
                expect(mockTx.wait.calledTwice).to.be.true;
            });

            it.skip('should fail after several retries if the transaction keeps timing out', async () => {  // Remove 'skip' if you want to run this test
                // Mock the necessary methods
                const mockTx = {
                    wait: sandbox.stub()
                        .onFirstCall().rejects(new Error('timeout'))
                        .onSecondCall().rejects(new Error('timeout'))
                        .onThirdCall().rejects(new Error('timeout'))
                };
                sandbox.stub(paymentServiceBNB.signer, 'sendTransaction').resolves(mockTx);
        
                // Call the sendAndWaitForReceipt method
                try {
                    await paymentServiceBNB.sendAndWaitForReceipt(tx);
                } catch (error) {
                    // Verify the error
                    expect(error.message).to.equal('Transaction confirmation failed after multiple retries');
                    expect(paymentServiceBNB.signer.sendTransaction.callCount).to.equal(1);
                    expect(mockTx.wait.callCount).to.equal(3);
                }
            });

            it('should succeed on the first attempt if the transaction is successful', async () => {
                // Mock the necessary methods
                const mockTx = {
                    wait: sandbox.stub().resolves({ status:  1 }) // Mock a successful receipt
                };
                sandbox.stub(paymentServiceBNB.signer, 'sendTransaction').resolves(mockTx);

                // Call the sendAndWaitForReceipt method
                const receipt = await paymentServiceBNB.sendAndWaitForReceipt({});

                // Verify the receipt
                expect(receipt.status).to.equal(1);
                expect(paymentServiceBNB.signer.sendTransaction.calledOnce).to.be.true;
                expect(mockTx.wait.calledOnce).to.be.true;
            });
        });

        describe('#checkTransactionStatus', () => {
            it('should return the receipt if the transaction status is  1', () => {
                // Mock a successful transaction receipt
                const mockReceipt = { status:  1 };

                // Call the checkTransactionStatus method
                const result = paymentServiceBNB.checkTransactionStatus(mockReceipt);

                // Verify the result
                expect(result).to.equal(mockReceipt);
            });

            it('should throw an error if the transaction status is not  1', () => {
                // Mock a transaction receipt with a failed status
                const mockFailedReceipt = { status:  0 };

                // Call the checkTransactionStatus method and expect it to throw an error
                expect(() => paymentServiceBNB.checkTransactionStatus(mockFailedReceipt)).to.throw('Transaction failed');
            });
        });

        // Before running this test, comment the await this.init() in the transfer function of PaymentServiceBNB.
        describe.skip('#transfer', () => {
            it('should fail validation if amountInUsd is not a positive number', async () => {
                const body = {
                    amountInUsd: -100, // Negative amount
                    recipientBNBAddress: recipientTest
                };
            
                try {
                    await paymentServiceBNB.transfer(body);
                } catch (error) {
                    expect(error.message).to.equal('Invalid amountInUsd');
                }
            });

            it('should fail validation if recipientBNBAddress is not a valid BNB address', async () => {
                const body = {
                    amountInUsd:  100,
                    recipientBNBAddress: 'invalidEthAddress' // Invalid BNB address
                };
            
                try {
                    await paymentServiceBNB.transfer(body);
                } catch (error) {
                    expect(error.message).to.equal('Invalid recipientBNBAddress');
                }
            });

            it('should fail if the conversion from USD to BNB fails', async () => {
                const body = {
                    amountInUsd:  100,
                    recipientBNBAddress: recipientTest
                };
            
                // Stub the axios get request to the Bscan API to throw an error
                sandbox.stub(axios, 'get').returns(Promise.reject(new Error('Invalid Request')));

                try {
                    await paymentServiceBNB.transfer(body);
                } catch (error) {
                    expect(error.message).to.equal('Invalid Request');
                }
            });

            it('should fail if the transaction creation fails', async () => {
                const body = {
                    amountInUsd:  100,
                    recipientBNBAddress: recipientTest
                };

                // Stub the provider and signer methods to throw an error
                sandbox.stub(paymentServiceBNB.provider, 'getFeeData').throws(new Error('Transaction creation error'));

                try {
                    await paymentServiceBNB.transfer(body);
                } catch (error) {
                    expect(error.message).to.equal('Transaction creation error');
                }
            });

            it('should fail if the transaction confirmation fails after multiple retries', async () => {
                const body = {
                    amountInUsd:  100,
                    recipientBNBAddress: recipientTest
                };

                // Stub the provider and signer methods
                sandbox.stub(paymentServiceBNB.provider, 'getFeeData').returns(Promise.resolve({ gasPrice: ethers.parseUnits('1', 'gwei') }));
                sandbox.stub(paymentServiceBNB.signer, 'getNonce').returns(Promise.resolve(1));
                sandbox.stub(paymentServiceBNB.signer, 'estimateGas').returns(Promise.resolve(21000n));
                sandbox.stub(paymentServiceBNB.signer, 'sendTransaction').returns(Promise.resolve({
                    wait: sinon.stub().rejects(new Error('Transaction confirmation failed after multiple retries'))
                }));

                try {
                    await paymentServiceBNB.transfer(body);
                } catch (error) {
                    expect(error.message).to.equal('Transaction confirmation failed after multiple retries');
                }
            });

            it('should transfer funds successfully', async () => {
                // Stub the axios get request to the Bscan API
                sandbox.stub(axios, 'get').returns(Promise.resolve({
                    status:  200,
                    data: {
                        result: {
                            ethusd:  500 // Example value, replace with actual value
                        }
                    }
                }));

                // Stub the provider and signer methods from ethers
                sandbox.stub(paymentServiceBNB.provider, 'getFeeData').returns(Promise.resolve({ gasPrice: ethers.parseUnits('1', 18) }));
                sandbox.stub(paymentServiceBNB.signer, 'getNonce').returns(Promise.resolve(1));
                sandbox.stub(paymentServiceBNB.signer, 'estimateGas').returns(Promise.resolve(21000n));
                sandbox.stub(paymentServiceBNB.signer, 'sendTransaction').returns(Promise.resolve({
                    wait: sinon.stub().resolves({ status:  1 })
                }));

                const body = {
                    amountInUsd:  100, // Amount to transfer in USD
                    recipientBNBAddress: recipientTest // Recipient BNB address
                };

                const result = await paymentServiceBNB.transfer(body);

                expect(axios.get.calledOnce).to.be.true;
                expect(paymentServiceBNB.signer.sendTransaction.calledOnce).to.be.true;
                expect(result).to.have.property('status',  1);
            });
        });
    });
