const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
require('dotenv').config();

/**
 * TEST SUITE FOR USER ROUTES
 * - make deposit
 * - get transactions / get transaction by id
 * - resolve pending transaction
 * - invest
 * - get investments / get investment by id
 */
describe("USER ROUTES", async () => {
  let userId;
  let userToken;
  let hackerId;
  let hackerToken;
  let dummyUserToken;
  
  before(() => {
    userId = process.env.TEST_userId;
    userToken = process.env.TEST_accessToken;
    hackerId = process.env.TEST_hack_userId;
    hackerToken = process.env.TEST_hack_accessToken;
    dummyUserToken = process.env.TEST_dummy_accessToken;
  });

  describe.skip("make deposit", async () => {  // unskip to run
    let depositData;
    let transactionData;

    it("should fail if any of the required data is not passed", async () => {
      depositData = {
        coin: "ETH",
        address: process.env.TEST_RECIPIENT,
        amount: 20,
        status: "SUCCESSFUL"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"transaction_id" is required');
    });

    it("should fail and don't create a transaction for a failed deposit when user doesn't have a wallet for that coin", async () => {
      let res;

      depositData = {
        coin: "ETH",
        address: process.env.TEST_RECIPIENT_2,
        amount: 10,
        status: "FAILED",
        transaction_id: "0xf09d92d24b515ff4e6b863f203ecf8bb6de8f98fb5f2bb20c83a39cea5dbab89"
      };

      transactionData = {
        filter: {
          coin: "ETH",
          status: "FAILED"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Transaction failed");

      // check if transaction was created
      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(transactionData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(0);
    });

    it("should create a wallet for the coin and a pending transaction when a user deposit is pending and no coin wallet is present", async () => {
      let res;

      depositData = {
        coin: "BNB",
        address: process.env.TEST_RECIPIENT_2,
        amount: 10,
        status: "PENDING",
        transaction_id: "0x49d0330fd075ce73e0bcd118751e24356a74ed98b209afbb1d4139d7e3e1c117"
      };

      transactionData = {
        filter: {
          coin: "BNB",
          status: "PENDING"
        }
      }

      // Verify BNB wallet isn't created
      res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send({ all: false, coin: 'BNB' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(0);

      // Make deposit
      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction PENDING");
      expect(res.body.transaction_id).to.not.be.undefined;

      // verify BNB wallet was created and transaction was created
      res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send({ all: false, coin: 'BNB' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);

      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(transactionData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(1);
    });

    it('should fail if user is sending a deposit already present (repeated transaction_id)', async () => {
      depositData = {
        coin: "BNB",
        address: process.env.TEST_RECIPIENT_2,
        amount: 10,
        status: "PENDING",
        transaction_id: "0x49d0330fd075ce73e0bcd118751e24356a74ed98b209afbb1d4139d7e3e1c117"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(500);
      expect(res.body.msg).to.contain('E11000 duplicate key error collection');
    });

    it('should create a failed transaction when coin wallet is present', async () => {
      depositData = {
        coin: "BNB",
        address: process.env.TEST_RECIPIENT_2,
        amount: 10,
        status: "FAILED",
        transaction_id: "0x49d0330fd075ce73e0bcd118751e24356a74ed98b209afbb1d4139d7e3e1c227"
      };

      transactionData = {
        filter: {
          coin: "BNB",
          status: "FAILED"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction FAILED");

      // check if transaction was created
      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(transactionData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(1);
    });

    it("should fail if a user sends a successful transaction that wasn't made to the App Contract", async () => {
      depositData = {
        coin: "BNB",
        address: process.env.TEST_RECIPIENT,
        amount: 112,
        status: "SUCCESSFUL",
        transaction_id: process.env.TEST_BNB_transaction_other
      };

      const res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction FAILED");
    });

    it('should fail when a user send a successful status with a wrong transaction_id', async () => {
      depositData = {
        coin: "BNB",
        address: process.env.TEST_RECIPIENT,
        amount: 10,
        status: "SUCCESSFUL",
        transaction_id: "0x49866b6ac283f28e040caa4e01f763a06c1f3045dc7566a8b57a755abc2391ff"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction FAILED");
    });

    it('should create a failed transaction when a failed transaction id is passed with successful status', async () => {
      let res;

      depositData = {
        coin: "ETH",
        address: process.env.TEST_RECIPIENT,
        amount: 10,
        status: "SUCCESSFUL",
        transaction_id: process.env.TEST_ETH_transaction_failed
      };

      transactionData = {
        filter: {
          coin: "ETH",
          status: "FAILED"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction FAILED");

      // check if transaction was created
      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactionData);

        expect(res.statusCode).to.equal(200);
        expect(res.body.transactions).to.have.lengthOf(1);
    });

    it('should successfully deposit into wallet', async () => {
      let res;

      depositData = {
        coin: "ETH",
        address: process.env.TEST_RECIPIENT,
        amount: 10,
        status: "SUCCESSFUL",
        transaction_id: process.env.TEST_ETH_transaction_success
      };

      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");

      // check if money was added to wallet
      res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ all: false, coin: 'ETH' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);
      expect(res.body.wallets[0].wallet_breakdown).to.have.property("available").greaterThan(0);

      // deposit another to check if the wallet balance is updated
      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...depositData, amount: 15, transaction_id: process.env.TEST_ETH_transaction_success_2});

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");

      // check if money was added to wallet
      res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ all: false, coin: 'ETH' });

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);
      expect(res.body.wallets[0].wallet_breakdown).to.have.property("available").greaterThan(20);
    });
  });

  describe("get transactions", async () => {
    let transactions;

    it('should fetch all the transactions when no value is passed', async () => {
      transactions = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("transactions", "haveNextPage", "totalPages");
      expect(res.body.transactions).to.have.length(5);
      expect(res.body).to.have.property("haveNextPage", false);
      expect(res.body).to.have.property("totalPages", 1);
    });

    it('should return the count of transaction present', async () => {
      transactions = {
        count: true,
        filter: {}
      }

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.count).to.be.a("number");
    });

    it('should fetch all the transaction providing the size', async () => {
      transactions = {
        size: 3,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("transactions", "haveNextPage", "totalPages");
      expect(res.body.transactions).to.have.length(3);
    });

    it('should fetch all the transactions providing the size and page', async () => {
      transactions = {
        size: 3,
        page: 2,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("transactions", "haveNextPage", "totalPages");
      expect(res.body.transactions).to.have.length.greaterThan(0);
    });

    it('should fetch all the transactions using coin with filter', async () => {
      transactions = {
        filter: {
          coin: "ETH"
        }
      }

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(4);
    });

    it('should fetch all the transactions using type with filter', async () => {
      transactions = {
        filter: {
          type: "DEBIT"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(5);
    });

    it('should fetch all the transaction using status with filter', async () => {
      transactions = {
        filter: {
          status: "FAILED"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(3);
    });

    it("should fetch all the transaction using status with filter", async () => {
      transactions = {
        filter: {
          credit_wallet: "APP"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(5);
    });

    it("should fetch all the transaction using exact range from createdAt with filter", async () => {
      transactions = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-19", "2024-04-22"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(5);
    });

    it('should return no transaction when an exact range contain no created transaction', async () => {
      transactions = {
        filter: {
          createdAt: {
            exact_range: ["2023-03-19", "2023-03-21"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(0);
    });

    it('should fetch all the transactions created using hour and week from createdAt with filter', async () => {
      let res;
      let clock;

      // Use fakeTimer to set Time
      clock = sinon.useFakeTimers(new Date('2024-04-21T22:22:29.845+00:00').getTime());

      transactions = {
        filter: {
          createdAt: {
            range: {
              time_share: "week",  // transactions created in the last week
              times: 1
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(5);

      transactions = {
        filter: {
          createdAt: {
            range: {
              time_share: "hour",  // transactions created in the last week
              times: 4
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(5);

      // restore clock
      clock.restore();
    })

    it('should fail if both exact range and range are passed with createdAt', async () => {
      transactions = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-19", "2024-04-21"],
            range: {
              time_share: "hour",
              times: 1
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("message", "Validation Error: You cannot set both range and exact_range");
    })

    it("should fetch transaction using multiple filter", async () => {
      let res;

      transactions = {
        filter: {
          coin: "ETH",
          status: "SUCCESSFUL",
          type: "DEBIT",
          createdAt: {
            exact_range: ["2024-04-19", "2024-04-21"]
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(2);

      transactions = {
        filter: {
          coin: "ETH",
          status: "SUCCESSFUL",
          type: "DEBIT",
          createdAt: {
            exact_range: ["2024-04-21", "2024-04-21"]  // the same day
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/transactions')
        .set('Authorization', `Bearer ${userToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(2);
    });

    it("should fail if wrong transaction id is passed", async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/transaction/66258ef6e03d399c9ebd362c')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Invalid Request, transaction does not exist");
    });

    it("should fail when another user (not admin) is trying to fetch a transaction not attach to his account", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/transaction/${process.env.TEST_transaction_id}`)
        .set('Authorization', `Bearer ${dummyUserToken}`);
      
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Bad request, Invalid credentials");
    });

    it("should successfully fetch transaction by id", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/transaction/${process.env.TEST_transaction_id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).to.equal(200);
      expect(res.body.transaction).to.not.be.empty;
    });
  });

  describe("resolve pending transaction", async () => {
    let depositData;

    it("should fail if transaction_id doesn't exist on the database", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/resolve-pending-transaction/66258ef6e03d399c9ebd362c`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "User have no transaction matching the provided id");
    });

    it("should fail when a diffent user passed an id not belonging to his account", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/resolve-pending-transaction/${process.env.TEST_transaction_id}`)
        .set('Authorization', `Bearer ${dummyUserToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "User have no transaction matching the provided id");
    });

    it("should fail when a user sends a transaction already resolved", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/resolve-pending-transaction/${process.env.TEST_transaction_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Transaction already resolved. Status: SUCCESSFUL");
    });

    it.skip("should resolve a pending transaction to failed", async () => {  // unskip to run
      let res;

      // make deposit with a pending transaction
      depositData = {
        coin: "ETH",
        address: process.env.TEST_RECIPIENT,
        amount: 10,
        status: "PENDING",
        transaction_id: process.env.TEST_ETH_transaction_failed_2
      };

      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction PENDING");
      expect(res.body.transaction_id).to.not.be.empty;

      // verify transaction was created as pending
      const transaction_id = res.body.transaction_id;
      res = await request(app)
        .get(`/api/v1/auth/user/transaction/${transaction_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transaction).to.have.property("status", "PENDING");

      // resolve the transaction
      res = await request(app)
        .get(`/api/v1/auth/user/resolve-pending-transaction/${transaction_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction FAILED");
      expect(res.body.transactionId).to.equal(transaction_id);
    });

    it.skip("should resolve a pending transaction to successful", async () => {  // unskip to run
      let res;

      // make deposit with a pending transaction
      depositData = {
        coin: "BNB",
        address: process.env.TEST_RECIPIENT,
        amount: 10,
        status: "PENDING",
        transaction_id: process.env.TEST_BNB_transaction_success
      };

      res = await request(app)
        .post('/api/v1/auth/user/deposit')
        .set('Authorization', `Bearer ${userToken}`)
        .send(depositData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction PENDING");
      expect(res.body.transaction_id).to.not.be.empty;

      // verify transaction was created as pending
      const transaction_id = res.body.transaction_id;

      res = await request(app)
        .get(`/api/v1/auth/user/transaction/${transaction_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transaction).to.have.property("status", "PENDING");

      // get the current balance of the user wallet
      const data = {
        all: false,
        coin: 'BNB'
      }

      res =await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets[0]).to.have.property('coin', 'BNB');

      // get the current balance
      const available = res.body.wallets[0].wallet_breakdown.available;

      // resolve the transaction
      res = await request(app)
        .get(`/api/v1/auth/user/resolve-pending-transaction/${transaction_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");
      expect(res.body.transactionId).to.equal(transaction_id);

      // verify the money was added to user wallet
      res =await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets[0]).to.have.property('coin', 'BNB');
      expect(res.body.wallets[0].wallet_breakdown.available).to.be.greaterThan(available);
    });
  });

  describe("invest", async () => {
    let investData;

    it("should fail when capital isn't passed", async() => {
      investData = {
        miner_name: "Antminer S19 Pro",
        coin: "ETH",
      }

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(400)
      expect(res.body).to.have.property("msg", '"capital" is required');
    });

    it("should fail when coin isn't passed", async() => {
      investData = {
        miner_name: "Antminer S19 Pro",
        capital: 10
      }

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(400)
      expect(res.body).to.have.property("msg", '"coin" is required');
    });

    it("should fail when a wrong miner is passed", async () => {
      investData = {
        miner_name: "Black Collector",
        coin: "ETH",
        capital: 10
      }

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Bad Request: Black Collector Miner not found");
    });

    it("should fail when a user is trying to invest without a wallet for the coin", async () => {
      investData = {
        miner_name: "Antminer S19 Pro",
        coin: "MATIC",
        capital: 10
      };

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Bad Request: MATIC Wallet not found");
    });

    it("should fail when the money to invest is greater than the available balance", async () => {
      investData = {
        miner_name: "Antminer S19 Pro",
        coin: "ETH",
        capital: 1000
      };

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Insufficient funds");
    });

    it("should fail when the money to invest is not the amount required by the miner", async () => {
      investData = {
        miner_name: "Antminer S19 Pro",
        coin: "ETH",
        capital: 20
      };

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", `Miner only accepts $10 capital`);
    });

    it("should fail when the money to invest is not the amount required by the miner (Another miner)", async () => {
      investData = {
        miner_name: "MicroBT Whatsminer M30S++",
        coin: "ETH",
        capital: 20
      };

      const res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(400);
      console.log(res.body);
      expect(res.body).to.have.property("msg", `Miner only accepts $50 and $100 capital`);
    });

    it.skip("should invest successfully", async () => {  // unskip to run test but money must be available in the wallet for success.
      let res;

      investData = {
        miner_name: "Antminer S19 Pro",
        coin: "ETH",
        capital: 10
      };

      res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", `You have successfully invested ${investData.capital} on ${investData.miner_name}`);
      expect(res.body.investment).to.not.be.empty;

      // check if the payments were created for the transaction
      const investment_id = res.body.investment;
      res = await request(app)
        .get(`/api/v1/auth/user/investment/${investment_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investment.investment_breakdown).to.have.property("capital", investData.capital);
      expect(res.body.investment).to.have.property("status", "ACTIVE");
      expect(res.body.investment.payments).to.have.lengthOf(8);
    });

    it.skip("should pass when user invest more than one", async () => {  // unskip to run test but money must be available in the wallet for success.
      let res;

      investData = {
        miner_name: "MicroBT Whatsminer M30S++",
        coin: "BNB",
        capital: 100
      };

      // First deposit
      res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", `You have successfully invested ${investData.capital} on ${investData.miner_name}`);
      expect(res.body.investment).to.not.be.empty;

      // second deposit
      res = await request(app)
        .post('/api/v1/auth/user/invest')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", `You have successfully invested ${investData.capital} on ${investData.miner_name}`);
      expect(res.body.investment).to.not.be.empty;

      // Get the wallet and confirm the holdings to be 24.4 for the minimum investment
      const data = {
        all: false,
        coin: 'BNB'
      }

      res =await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets[0]).to.have.property('coin', 'BNB');
      expect(res.body.wallets[0]).to.have.property('address');
      expect(res.body.wallets[0].wallet_breakdown.holdings).to.equal(244);
      expect(res.body.wallets[0].investments).to.have.lengthOf(2);
    });
  });

  describe("get investments", async () => {
    let investData;

    it("should fetch all investments when no filter is passed", async () => {
      investData = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("investments", "haveNextPage", "totalPages");
      expect(res.body.investments).to.have.length(3);
    });

    it("should fetch all the investments by count", async () => {
      investData = {
        count: true,
        filter: {}
      }

      const res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.count).to.be.a("number");
    });

    it("should fetch investments by coin", async () => {
      let res;

      investData = {
        count: false,
        filter: {
          coin: "ETH"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(1);

      investData = {
        count: false,
        filter: {
          coin: "BNB"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(2);
    });

    it("should get investments by miner", async () => {
      let res;

      investData = {
        count: false,
        filter: {
          miner: "Antminer S19 Pro"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(1);

      investData = {
        count: false,
        filter: {
          miner: "MicroBT Whatsminer M30S++"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(2);
    });

    it("should get investments by status", async () => {
      let res;

      investData = {
        count: false,
        filter: {
          status: "ACTIVE"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(3);

      investData = {
        count: false,
        filter: {
          status: "CANCELLED"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/investments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(0);
    });

    it("should fail when wrong investment id is sent", async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/investment/662a9fd41f3816bb8e685455')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Invalid Request, investment does not exist")
    });

    it("should fetch investment by id", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/investment/${process.env.TEST_investment_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      console.log(res.body.investment);
      expect(res.statusCode).to.equal(200)
      expect(res.body.investment).to.have.property("status", "ACTIVE");
      expect(res.body.investment.payments).to.have.lengthOf(8);
      expect(res.body.investment.payments[0]).to.have.any.keys("status", "user", "wallet", "miner", "coin")
    });
  });
});
