// STAGING TEST FOR GETCONTRACTEVENTS
const { GetEvents } = require('../../services/getContractEvents');
const { developmentChains } = require("../../helper-hardhat-config");
const { network } = require("hardhat");
const { expect } = require('chai');
require('dotenv').config();

/**
    @title Staging Test Suites for ContractEvents.
    @author Eyang, Daniel Eyoh <https://github.com/Tediyang>
 */

developmentChains.includes(network.name)
    ? describe.skip
    : network.name === "sepolia" ?
        describe("GetEventsSepolia", () => {
            let getEvents;
            let address;

            beforeEach(() => {
                getEvents = new GetEvents();
            });

            it("Fund: should throw an error when a userAddress doesn't exist or have an event", async () => {
                address = "0x39CFb2235b3dF8089A9a8bBA9faC2833574a667g";
                try {
                    await getEvents.getUserFundedEvent("Eth", address, 0);
                } catch (error) {
                    expect(error.message).to.include("User address not found or has no events");
                }
            });

            it("Fund: should return null when the specified event doesn't exist", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getUserFundedEvent("Eth", address, 10000);

                // Assert values
                expect(event).to.equal(null);
            });

            it("Fund: should return the event fetched", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getUserFundedEvent("Eth", address);

                // Assert values
                expect(event).to.have.property("coin", 'Eth');
                expect(event).to.have.property("blockNumber");
                expect(event).to.have.property("amount");
                expect(event).to.have.property("transactionHash");
            });

            it("Withdraw: should return null when the specified event doesn't exist", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getWithdrawalEvent("Eth", 10000);

                // Assert values
                expect(event).to.equal(null);
            });

            it("Withdraw: should return the event fetched", async () => {;
                const event = await getEvents.getUserFundedEvent("Eth");

                // Assert values
                expect(event).to.have.property("coin", 'Eth');
                expect(event).to.have.property("blockNumber");
                expect(event).to.have.property("amount");
                expect(event).to.have.property("transactionHash");
            });
        })

    : network.name === "bsc_testnet" ?
        describe("GetEventsBNB", () => {
            let getEvents;
            let address;

            beforeEach(() => {
                getEvents = new GetEvents();
            });

            it("Fund: should throw an error when a userAddress doesn't exist or have an event", async () => {
                address = "0x39CFb2235b3dF8089A9a8bBA9faC2833574a667g";
                try {
                    await getEvents.getUserFundedEvent("BNB", address, 0);
                } catch (error) {
                    expect(error.message).to.include("User address not found or has no events");
                }
            });

            it("Fund: should return null when the specified event doesn't exist", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getUserFundedEvent("BNB", address, 10000);

                // Assert values
                expect(event).to.equal(null);
            });

            it("Fund: should return the event fetched", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getUserFundedEvent("BNB", address);

                // Assert values
                expect(event).to.have.property("coin", 'BNB');
                expect(event).to.have.property("blockNumber");
                expect(event).to.have.property("amount");
                expect(event).to.have.property("transactionHash");
            });

            it("Withdraw: should return null when the specified event doesn't exist", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getWithdrawalEvent("BNB", 10000);

                // Assert values
                expect(event).to.equal(null);
            });

            it("Withdraw: should return the event fetched", async () => {;
                const event = await getEvents.getUserFundedEvent("BNB");

                // Assert values
                expect(event).to.have.property("coin", 'BNB');
                expect(event).to.have.property("blockNumber");
                expect(event).to.have.property("amount");
                expect(event).to.have.property("transactionHash");
            });
        })

    : network.name === "polygon" ?
        describe("GetEventsMatic", () => {
            let getEvents;
            let address;

            beforeEach(() => {
                getEvents = new GetEvents();
            });

            it("Fund: should throw an error when a userAddress doesn't exist or have an event", async () => {
                address = "0x39CFb2235b3dF8089A9a8bBA9faC2833574a667g";
                try {
                    await getEvents.getUserFundedEvent("Matic", address, 0);
                } catch (error) {
                    expect(error.message).to.include("User address not found or has no events");
                }
            });

            it("Fund: should return null when the specified event doesn't exist", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getUserFundedEvent("Matic", address, 10000);

                // Assert values
                expect(event).to.equal(null);
            });

            it("Fund: should return the event fetched", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getUserFundedEvent("Matic", address);

                // Assert values
                expect(event).to.have.property("coin", 'Matic');
                expect(event).to.have.property("blockNumber");
                expect(event).to.have.property("amount");
                expect(event).to.have.property("transactionHash");
            });

            it("Withdraw: should return null when the specified event doesn't exist", async () => {
                address = process.env.TEST_RECIPIENT;

                const event = await getEvents.getWithdrawalEvent("Matic", 10000);

                // Assert values
                expect(event).to.equal(null);
            });

            it("Withdraw: should return the event fetched", async () => {;
                const event = await getEvents.getUserFundedEvent("Matic");

                // Assert values
                expect(event).to.have.property("coin", 'Matic');
                expect(event).to.have.property("blockNumber");
                expect(event).to.have.property("amount");
                expect(event).to.have.property("transactionHash");
            });
        })

    : describe.skip;
