const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

/**
 * TEST SUITE FOR ADMIN ROUTES
 * - settle funding dispute
 * - app withdraw
 * - settle app withdraw dispute
 */
describe(("ADMIN ROUTES"), () => {
  let superAdminId;
  let superAdminToken;
  let adminId;
  let adminToken;
  let hackerId;
  let hackerToken;

  before(() => {
    superAdminId = process.env.TEST_superAdmin_id;
    superAdminToken = process.env.TEST_superAdmin_accessToken;
    adminId = process.env.TEST_admin_id;
    adminToken = process.env.TEST_admin_accessToken;
    hackerId = process.env.TEST_hack_userId;
    hackerToken = process.env.TEST_hack_accessToken;
  });

  describe("settle fund dispute", async () => {
    let settleData;

    it("should fail when a required parameter isn't passed", async () => {
      settleData = {
        email: "Wrongpassword@gmail.com",
        coin: "MATIC"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/fund/dispute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settleData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"address" is required');
    });

    it("should fail when user email doesn't exist", async () => {
      settleData = {
        email: "Wrongpassword@gmail.com",
        address: "0x0000000000000000000000000000000000000000",
        coin: "MATIC"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/fund/dispute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settleData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", `User with Email: ${settleData.email} does not exist`);
    });

    it.skip("should fail when user hasn't made transaction to the blockchain", async () => {  // unskip to run
      settleData = {
        email: "daniel.eyang@gmail.com",
        address: process.env.TEST_RECIPIENT_2,
        coin: "BNB"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/fund/dispute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settleData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", `user does not have such transaction on ${settleData.coin} blockchain`);
    });

    it.skip("should resolve funding dispute", async () => {  // unskip to run
      let res;
      let walletData;

      // Get the current balance in user wallet
      walletData = {
        filter: {
          user: process.env.TEST_userId,
          coin: "MATIC"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      const prevBalance = res.body.wallets[0].wallet_breakdown.available;

      // settle dispute
      settleData = {
        email: process.env.TEST_email,
        address: process.env.TEST_RECIPIENT,
        coin: "MATIC"
      };

      res = await request(app)
        .post('/api/v1/auth/admin/settle/fund/dispute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settleData);
      
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");

      // Get current balance
      walletData = {
        filter: {
          user: process.env.TEST_userId,
          coin: "MATIC"
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      const curBalance = res.body.wallets[0].wallet_breakdown.available;

      expect(curBalance).to.be.greaterThan(prevBalance);
    });

    it.skip("should fail if transaction has already been settled", async () => {  // unskip to run
      settleData = {
        email: process.env.TEST_email,
        address: process.env.TEST_RECIPIENT,
        coin: "MATIC"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/fund/dispute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settleData);
      
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Transaction has already been settled");
    });
  });

  describe("app withdraw", async () => {
    it("should fail if a non super user sends this request", async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin/app/withdraw/ETH')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property("msg", "Forbidden, Invalid Credentials");
    });

    it("should fail if the right coin isn't passed", async () => {
      const res = await request(app)
      .get('/api/v1/auth/admin/app/withdraw/ARM')
      .set('Authorization', `Bearer ${superAdminToken}`);
      
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Invalid coin");
    });

    it.skip("should successfully withdraw funds", async () => {  // unskip to run
      const res = await request(app)
        .get('/api/v1/auth/admin/app/withdraw/ETH')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");
    });
  });

  describe("settle app withdrawal dispute", async () => {
    let disputeData;

    it("should fail if a non super user sends this request", async () => {
      disputeData = {
        coin: "ETH",
        event: 0
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/app/withdraw/dispute')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(disputeData);

      console.log(res.body);
      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property("msg", "Forbidden, Invalid Credentials");
    });

    it("should fail when a required parameter is not passed", async () => {
      disputeData = {
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/app/withdraw/dispute')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(disputeData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"coin" is required');
    });

    it.skip("should successfully settle dispute", async () => {  // unskip to run
      disputeData = {
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/settle/app/withdraw/dispute')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(disputeData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");
    });
  });
});
