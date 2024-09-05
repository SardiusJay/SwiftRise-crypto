// STAGING TEST FOR GETCONTRACTEVENTS
const { GetTransactionStatus } = require('../../services/getTransactionStatus');
const { expect } = require('chai');

/**
    @title Staging Test Suites for ContractEvents.
    @author Eyang, Daniel Eyoh <https://github.com/Tediyang>
 */

describe("GetTransaction", () => {
    let getTransaction;
    let transactionHash;

    beforeEach(() => {
        getTransaction = new GetTransactionStatus();
    });

    it("Eth: should return null when a transaction hash doesn't exist", async () => {
        transactionHash = "0x4390801df9be5b4f8f5f7136348b0328ab3f93df3474a76cf8ee9c0b7c2da6d1";
        const result = await getTransaction.getStatus("Eth", transactionHash);

        expect(result).to.equal(false);
    });

    it("Eth: should return true on a successful transaction hash", async () => {
        transactionHash = "0x6e09c995a3d869224e02ebc3d14e6b954304f7446e7e37d9192e31bbdb9f5938";
        const result = await getTransaction.getStatus("Eth", transactionHash);

        expect(result).to.equal(true);
    });

    it("BNB: should return null when a transaction hash doesn't exist", async () => {
        transactionHash = "0x4390801df9be5b4f8f5f7136348b0328ab3f93df3474a76cf8ee9c0b7c2da6d1";
        const result = await getTransaction.getStatus("BNB", transactionHash);

        expect(result).to.equal(false);
    });

    it("BNB: should return true on a successful transaction hash", async () => {
        transactionHash = "0x2db47b7a49bdb909606dfec66d461844dc72291a1d59fd75a81f349d2ab9db57";
        const result = await getTransaction.getStatus("BNB", transactionHash);

        expect(result).to.equal(true);
    });

    it("Matic: should return false when a transaction hash doesn't exist", async () => {
        transactionHash = "0x2db47b7a49bdb909606dfec66d461844dc72291a1d59fd75a81f349d2ab9db57";
        const result = await getTransaction.getStatus("Matic", transactionHash);

        expect(result).to.equal(false);
    });

    it("Matic: should return true on a successful transaction hash", async () => {
        transactionHash = "0x4390801df9be5b4f8f5f7136348b0328ab3f93df3474a76cf8ee9c0b7c2da6d1";
        const result = await getTransaction.getStatus("Matic", transactionHash);

        expect(result).to.equal(true);
    });

    it("BNB: should return the amountInUsd for a successful deposit with valid transaction hash", async () => {
        transactionHash = "0x1d665860334a3b2f22929d359ad9d1f4f26be8bb265f1f01ae641dfb864b2ace";
        const result = await getTransaction.getDepositStatus("BNB", transactionHash);

        expect(result).to.be.a.string;
    });

    it("ETH: should return the amountInUsd for a successful deposit with valid transaction hash", async () => {
        transactionHash = "0xfcabe20c79fda00b72201ae7a08b91df89d456599f36ccb5e0cf6b484022ec66";
        const result = await getTransaction.getDepositStatus("ETH", transactionHash);

        expect(result).to.be.a.string;
    });

    it("ETH: should return false when the deposit wasn't made to the valid contract", async () => {
        transactionHash = "0x6e09c995a3d869224e02ebc3d14e6b954304f7446e7e37d9192e31bbdb9f5938";
        const result = await getTransaction.getDepositStatus("ETH", transactionHash);

        expect(result).to.equal(false);
    });
});
