const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const { PaymentServiceBNB } = require('../../services/payment_service');
require('dotenv').config();

/**
 * TEST SUITE FOR USER ROUTES
 * - get payments / get payment by id
 * - withdraw
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

  describe("get payments", async () => {
    let paymentData;

    it("should fetch all payments when no filter is passed", async () => {
      paymentData = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("payments", "haveNextPage", "totalPages");
      expect(res.body.payments).to.have.length(24);
    });

    it("should fetch all the payments by count", async () => {
      paymentData = {
        count: true,
        filter: {}
      }

      const res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.count).to.be.a("number");
    });

    it("should fetch payments by coin", async () => {
      let res;

      paymentData = {
        count: false,
        filter: {
          coin: "ETH"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.length(8);

      paymentData = {
        count: false,
        filter: {
          coin: "BNB"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.length(16);
    });

    it("should get payments by miner", async () => {
      let res;

      paymentData = {
        count: false,
        filter: {
          miner: "Antminer S19 Pro"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.length(8);

      paymentData = {
        count: false,
        filter: {
          miner: "MicroBT Whatsminer M30S++"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.length(16);
    });

    it("should get payments by status", async () => {
      let res;

      paymentData = {
        count: false,
        filter: {
          status: "ON QUEUE"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.length(24);

      paymentData = {
        count: false,
        filter: {
          status: "PAID"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.length(0);
    });

    it("should fetch all the payments using exact range from createdAt with filter", async () => {
      paymentData = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-24", "2024-04-25"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(24);
    });

    it('should return no payments when an exact range contain no created payment', async () => {
      paymentData = {
        filter: {
          createdAt: {
            exact_range: ["2023-03-19", "2023-03-21"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(0);
    });

    it('should fetch all the payments created using hour and week from createdAt with filter', async () => {
      let res;
      let clock;

      // Use fakeTimer to set Time
      clock = sinon.useFakeTimers(new Date('2024-04-25T18:29:20.990+00:00').getTime());

      paymentData = {
        filter: {
          createdAt: {
            range: {
              time_share: "week",  // payments created in the last week
              times: 1
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(24);

      paymentData = {
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
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(24);
    })

    it('should fail if both exact range and range are passed with createdAt', async () => {
      paymentData = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-24", "2024-04-25"],
            range: {
              time_share: "hour",
              times: 1
            }
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("message", "Validation Error: You cannot set both range and exact_range");
    })

    it("should fetch payments using multiple filter", async () => {
      let res;

      paymentData = {
        filter: {
          coin: "ETH",
          status: "ON QUEUE",
          createdAt: {
            exact_range: ["2024-04-24", "2024-04-25"]
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(8);

      paymentData = {
        filter: {
          coin: "ETH",
          status: "ON QUEUE",
          createdAt: {
            exact_range: ["2024-04-25", "2024-04-25"]  // the same day
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/user/get/payments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(8);
    });

    it("should fail when wrong payment id is sent", async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/payment/662a9fd41f3816bb8e68647b')
        .set('Authorization', `Bearer ${userToken}`);
        
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Invalid Request, payment does not exist")
    });

    it("should fetch payment by id", async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/payment/${process.env.TEST_payment_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200)
      expect(res.body.payment).to.have.property("status", "ON QUEUE");
      expect(res.body.payment).to.have.property("miner", "Antminer S19 Pro");
    });
  });

  describe("withdraw available balance", async () => {
    let withdrawData;

    it("should fail if a required parameter isn't passed", async () => {
      withdrawData = {
        coin: "ETH",
        amount: 10
      };

      const res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"answer" is required');
    });

    it("should fail when answer to question is wrong", async () => {
      withdrawData = {
        coin: "ETH",
        amount: 10,
        answer: "Tomato"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", 'Incorrect answer for security question "What is the name of your favorite food?", try again');
    });

    it("should fail when user doesn't have a wallet for such coin", async () => {
      withdrawData = {
        coin: "ETH",
        amount: 10,
        answer: "Bread"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", `You dont have a ${withdrawData.coin} wallet`);
    });

    it("should fail if balance is insuffient", async () => {
      withdrawData = {
        coin: "ETH",
        amount: 40,
        answer: "Bread"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "You dont have enough in ETH Wallet to withdraw");
    });

    it("should fail if amount is below minimum or above maximum value", async () => {
      let res;

      // less than minimum amount
      withdrawData = {
        coin: "ETH",
        amount: 0,
        answer: "Bread"
      };

      res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "You cant withdraw less than $1");

      // greater than maximum amount
      withdrawData = {
        coin: "BNB",
        amount: 6000,
        answer: "Bread"
      };

      res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "You cant withdraw more than $5,000");
    });

    it.skip("should successful withdraw balance", async () => {  // unskip to run
      withdrawData = {
        coin: "ETH",
        amount: 20,
        answer: "Bread"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/withdraw')
        .set('Authorization', `Bearer ${userToken}`)
        .send(withdrawData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");
    });
  });
});
