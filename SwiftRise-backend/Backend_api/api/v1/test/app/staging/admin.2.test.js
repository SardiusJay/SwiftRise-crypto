const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
require('dotenv').config();

/**
 * TEST SUITE FOR ADMIN ROUTES
 * - get wallets
 * - get payments
 * - register miner
 * - disable account
 * - get contract
 * - update contract
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

  describe("get wallets", async () => {
    let walletData;

    it('should fetch all the wallets when no value is passed', async () => {
      walletData = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("wallets", "haveNextPage", "totalPages");
      expect(res.body.wallets).to.have.length(4);
      expect(res.body).to.have.property("haveNextPage", false);
      expect(res.body).to.have.property("totalPages", 1);
    });

    it('should return the count of wallets present', async () => {
      walletData = {
        count: true,
        filter: {}
      }

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.count).to.be.a("number");
    });

    it('should fetch all the wallets providing the size', async () => {
      walletData = {
        size: 3,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("wallets", "haveNextPage", "totalPages");
      expect(res.body.wallets).to.have.length(3);
    });

    it('should fetch all the wallets providing the size and page', async () => {
      walletData = {
        size: 3,
        page: 2,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("wallets", "haveNextPage", "totalPages");
      expect(res.body.wallets).to.have.lengthOf(1);
    });

    it('should fetch all the wallets using coin with filter', async () => {
      walletData = {
        filter: {
          coin: "ETH"
        }
      }

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);
    });

    it('should fetch all the wallets using user id with filter', async () => {
      walletData = {
        filter: {
          user: process.env.TEST_userId
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(3);
    });

    it('should fetch all the wallets using address with filter', async () => {
      walletData = {
        filter: {
          address: process.env.TEST_RECIPIENT
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(3);
    });

    it("should fetch all the wallets using exact range from createdAt with filter", async () => {
      walletData = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-14", "2024-04-15"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(3);
    });

    it('should return no wallet when an exact range contain no created wallet', async () => {
      walletData = {
        filter: {
          createdAt: {
            exact_range: ["2023-03-19", "2023-03-21"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(0);
    });

    it('should fetch all the wallets created using hour and week from createdAt with filter', async () => {
      let res;
      let clock;

      // Use fakeTimer to set Time
      clock = sinon.useFakeTimers(new Date('2024-04-21T22:14:55.674+00:00').getTime());

      walletData = {
        filter: {
          createdAt: {
            range: {
              time_share: "week",  // wallets created in the last week
              times: 1
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(4);

      walletData = {
        filter: {
          createdAt: {
            range: {
              time_share: "hour",  // transactions created in the last one hour
              times: 1
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);

      // restore clock
      clock.restore();
    });

    it('should fail if both exact range and range are passed with createdAt', async () => {
      walletData = {
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
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("message", "Validation Error: You cannot set both range and exact_range");
    });

    it("should fetch wallets using multiple filter", async () => {
      let res;

      walletData = {
        filter: {
          coin: "ETH",
          user: process.env.TEST_userId,
          address: process.env.TEST_RECIPIENT,
          createdAt: {
            exact_range: ["2024-04-15", "2024-04-16"]
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);

      walletData = {
        filter: {
          coin: "BNB",
          address: process.env.TEST_RECIPIENT_2,
          createdAt: {
            exact_range: ["2024-04-21", "2024-04-21"]  // the same day
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/wallets')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(walletData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.lengthOf(1);
    });
  });

  describe("get payments", async () => {
    let paymentData;

    it('should fetch all the payments when no value is passed', async () => {
      paymentData = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("payments", "haveNextPage", "totalPages");
      expect(res.body.payments).to.have.length(20);
      expect(res.body).to.have.property("haveNextPage", true);
      expect(res.body).to.have.property("totalPages", 2);
    });

    it('should return the count of payments present', async () => {
      paymentData = {
        count: true,
        filter: {}
      }

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.count).to.be.a("number");
    });

    it('should fetch all the payments providing the size', async () => {
      paymentData = {
        size: 3,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("payments", "haveNextPage", "totalPages");
      expect(res.body.payments).to.have.length(3);
    });

    it('should fetch all the payments providing the size and page', async () => {
      paymentData = {
        size: 5,
        page: 3,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("payments", "haveNextPage", "totalPages");
      expect(res.body.payments).to.have.lengthOf(5);
    });

    it('should fetch all the payments using coin with filter', async () => {
      paymentData = {
        filter: {
          coin: "ETH"
        }
      }

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(8);
    });

    it('should fetch all the payments using user id with filter', async () => {
      paymentData = {
        filter: {
          user: process.env.TEST_userId
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(20);
      expect(res.body).to.have.property("haveNextPage", true);
      expect(res.body).to.have.property("totalPages", 2);
    });

    it('should fetch all the payments using status with filter', async () => {
      paymentData = {
        filter: {
          status: "ON QUEUE"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(20);
      expect(res.body).to.have.property("haveNextPage", true);
      expect(res.body).to.have.property("totalPages", 2);
    });

    it('should fetch all the payments using miner with filter', async () => {
      paymentData = {
        filter: {
          miner: "Antminer S19 Pro"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(8);
    });

    it("should fetch all the payments using exact range from createdAt with filter", async () => {
      paymentData = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-25", "2024-04-26"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(20);
      expect(res.body).to.have.property("haveNextPage", true);
      expect(res.body).to.have.property("totalPages", 2);
    });

    it('should return no payment when an exact range contain no created payment', async () => {
      paymentData = {
        filter: {
          createdAt: {
            exact_range: ["2023-03-19", "2023-03-21"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(0);
    });

    it('should fetch all the payments created using hour and week from createdAt with filter', async () => {
      let res;
      let clock;

      // Use fakeTimer to set Time
      clock = sinon.useFakeTimers(new Date('2024-04-25T18:50:20.990+00:00').getTime());

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
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(20);
      expect(res.body).to.have.property("haveNextPage", true);
      expect(res.body).to.have.property("totalPages", 2);

      paymentData = {
        filter: {
          createdAt: {
            range: {
              time_share: "hour",  // payments created in the last one hour
              times: 1
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(20);
      expect(res.body).to.have.property("haveNextPage", true);
      expect(res.body).to.have.property("totalPages", 2);

      // restore clock
      clock.restore();
    });

    it('should fail if both exact range and range are passed with createdAt', async () => {
      paymentData = {
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
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("message", "Validation Error: You cannot set both range and exact_range");
    });

    it("should fetch payments using multiple filter", async () => {
      let res;

      paymentData = {
        filter: {
          coin: "ETH",
          user: process.env.TEST_userId,
          status: "ON QUEUE",
          createdAt: {
            exact_range: ["2024-04-23", "2024-04-24"]
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(0);
      expect(res.body).to.have.property("haveNextPage", false);
      expect(res.body).to.have.property("totalPages", 0);

      paymentData = {
        filter: {
          coin: "BNB",
          user: process.env.TEST_userId,
          status: "ON QUEUE",
          createdAt: {
            exact_range: ["2024-04-25", "2024-04-25"]  // the same day
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/payments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(paymentData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.payments).to.have.lengthOf(16);
      expect(res.body).to.have.property("haveNextPage", false);
      expect(res.body).to.have.property("totalPages", 1);
    });
  });

  describe("register miner", async () => {
    let registerData;

    it("should fail when any required parameter is not passed", async () => {
      registerData = {
        name: "Miner Bot Booster"
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/miner/register")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(registerData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"capitals" is required');
    });

    it("should fail when a non super admin tries to register a new miner", async () => {
      registerData = {
        name: "Miner Bot Booster",
        capitals: [20, 30]
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/miner/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(registerData);

      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property("msg", "Forbidden, Invalid Credentials");
    });

    it.skip("should register a new miner", async () => {  // unskip to run. non idempotency
      registerData = {
        name: "Miner Bot Booster",
        capitals: [20, 30]
      }

      const res = await request(app)
        .post("/api/v1/auth/admin/miner/register")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send(registerData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("msg", "Miner Bot Booster Miner registered successfully");
    });
  });

  describe("disable account", async () => {
    let disableData;

    it("should fail when any required parameter isn't passed", async () => {
      disableData = {
        password: process.env.TEST_admin_password,
        user_id: process.env.TEST_disabledUser_id
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/disable/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(disableData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"reason" is required');
    });

    it("should fail when wrong admin password is passed", async () => {
      disableData = {
        password: "Wrongpassword123$",
        user_id: process.env.TEST_disabledUser_id,
        reason: "Fradulent Activity"
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/disable/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(disableData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", 'Invalid Request, incorrect password');
    });

    it("should return 404 when user isn't found", async () => {
      disableData = {
        password: process.env.TEST_admin_password,
        user_id: "661d4397e7b28fc1891cd334",
        reason: "Fradulent Activity"
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/disable/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(disableData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Invalid Request, user does not exist");
    });

    it.skip("should disable an account", async () => {  // unskip to run - skip due to non-idempotency
      disableData = {
        password: process.env.TEST_admin_password,
        user_id: process.env.TEST_disabledUser_id,
        reason: "Fradulent Activity"
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/disable/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(disableData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("msg", "User disabled successfully");
    });

    it.skip("should fail if a user is disabled already", async () => {  // unskip to run
      disableData = {
        password: process.env.TEST_admin_password,
        user_id: process.env.TEST_disabledUser_id,
        reason: "Fradulent Activity"
      };

      const res = await request(app)
        .post("/api/v1/auth/admin/disable/user")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(disableData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", 'Invalid Request, user already disabled');
    });
  });

  describe("get contract", async () => {
    let contractData;

    it("should return all the contracts when all is set to true", async () => {
      contractData = {
        all: true
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get-contract')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.contracts).to.have.lengthOf(3);
    });

    it("should fail when contract doesn't exist for the provided coin", async () => {
      contractData = {
        coin: "ARM"
      }

      const res = await request(app)
        .post('/api/v1/auth/admin/get-contract')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"coin" must be one of [ETH, BNB, MATIC]');
    });

    it("should return the contract for the provided coin", async () => {
      contractData = {
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get-contract')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.contract).to.have.any.keys("abi", "address");
    });
  });

  describe("update contract", async () => {
    let contractData;

    it("should fail when a non super admin tries to update a contract", async () => {
      contractData = {
        coin: "ETH",
        abi: "abi",
        address: "address"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/update-contract')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property("msg", "Forbidden, Invalid Credentials");
    });

    it("should fail when a required parameter isn't passed", async () => {
      contractData = {
        coin: "ETH",
        abi: "abi",
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/update-contract')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"address" is required');
    });

    it("should fail when contract doesn't exist for the provided coin", async () => {
      contractData = {
        coin: "ARM",
        abi: "abi",
        address: "address"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/update-contract')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"coin" must be one of [ETH, BNB, MATIC]');
    });

    it.skip("should update the contract for the provided coin", async () => {  // unskip to run
      contractData = {
        coin: "ETH",
        abi: "abi",
        address: "address"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/update-contract')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(contractData);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("msg", `${contractData.coin} Contract updated successfully`);
    });
  });
});

