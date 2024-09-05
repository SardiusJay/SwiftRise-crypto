const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
require('dotenv').config();

/**
 * TEST SUITE FOR ADMIN ROUTES
 * - switch role
 * - find user
 * - search user
 * - fetch users
 * - get investments
 * - get transactions
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

  describe("switch role", async () => {
    let changeRole;

    it("should fail if the request isn't made by super admin", async () => {
      const res = await request(app)
        .post('/api/v1/auth/admin/role/switcheroo')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).to.equal(403);
      expect(res.body).to.have.property("msg", "Forbidden, Invalid Credentials");
    });

    it("shoud fail if request is made without email passed", async () => {
      changeRole = {
        role: "ADMIN"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/role/switcheroo')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(changeRole);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"email" is required');
    });

    it("shoud fail if request is made without role passed", async () => {
      changeRole = {
        email: "daniel.eyang@gmail.com"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/role/switcheroo')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(changeRole);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"role" is required');
    });

    it("should fail if user email doesn't exist", async () => {
      changeRole = {
        email: "teletubies@gmaill.com",
        role: "ADMIN"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/role/switcheroo')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(changeRole);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "User does not exist");
    });

    it("should return role already exist when the email has already been assigned", async () => {
      changeRole = {
        email: "emmanueleyang@gmail.com",
        role: "ADMIN"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/role/switcheroo')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(changeRole);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("message", `${changeRole.email} has the Role: ${changeRole.role} already`);
    });

    it.skip("should successfully update role and verify the user was notified", async () => { //uncomment to run
      let res;
      changeRole = {
        email: "daniel.eyang@gmail.com",
        role: "ADMIN"
      };

      res = await request(app)
        .post('/api/v1/auth/admin/role/switcheroo')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(changeRole);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Role succesfully updated");

      // fetch the user and confirm notification was added
      res = await request(app)
        .post('/api/v1/auth/admin/find/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ email: changeRole.email });

      expect(res.statusCode).to.equal(200);
      expect(res.body.user.notifications).to.have.length.greaterThan(0);
      expect(res.body.user.notifications[0]).to.have.property("comment");
      expect(res.body.user.notifications[0]).to.have.property("subject");
    });
  });

  describe("find user", async () => {
    let user;

    it("should fail if no value is passed", async () => {
      const res = await request(app)
        .post('/api/v1/auth/admin/find/user')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Invalid request, email or phone required");
    });

    it("should fail if incorrect email is passed", async () => {
      user = {
        email: "swiftrisemail@gmail.com"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/find/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(user);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "User not found");
    });

    it("should fail if incorrect phone is passed", async () => {
      user = {
        phone: "7017849600"
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/find/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(user);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "User not found");
    });

    it("should succesfully fetch the user by email", async () => {
      user = {
        email: process.env.TEST_email
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/find/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(user);

      expect(res.statusCode).to.equal(200)
      expect(res.body).to.have.property("user");
    });

    it("should succesfully fetch the user by email", async () => {
      user = {
        phone: process.env.TEST_phone
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/find/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(user);

      expect(res.statusCode).to.equal(200)
      expect(res.body).to.have.property("user");
    });
  });

  describe("search user", async () => {
    let searchData;

    it("should fail if no search value is passed", async () => {
      const res = await request(app)
        .post('/api/v1/auth/admin/search/user')
        .set('Authorization', `Bearer ${superAdminToken}`)

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"search" is required');
    });

    it("should return all the users with name or email equal to the search value", async () => {
      searchData = {
        search: process.env.TEST_fname
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/search/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(searchData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });

    it("should return all the users with phone equal to the search value", async () => {
      searchData = {
        search: process.env.TEST_phone
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/search/user')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(searchData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });
  });

  describe("fetch users", async () => {
    let users;

    it('should fetch all the users when no value is passed', async () => {
      users = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200)
      expect(res.body).to.have.keys("users", "have_next_page", "total_pages");
    });

    it('should return the count of users present', async () => {
      users = {
        count: true,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.count).to.be.a("number");
    });

    it('should fetch all the users providing the size', async () => {
      users = {
        size: 10,
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("users", "have_next_page", "total_pages");
      expect(res.body.users).to.have.length(10);
    });

    it('should fetch all the users providing size and page', async () => {
      users = {
        size: 10,
        page: 2,
        filter: {}
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("users", "have_next_page", "total_pages");
      expect(res.body.users).to.have.length.greaterThan(0);
      expect(res.body).to.have.property("have_next_page", false);

      users = {
        size: 10,
        filter: {}
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("users", "have_next_page", "total_pages");
      expect(res.body.users).to.have.lengthOf(10);
      expect(res.body).to.have.property("have_next_page", true);
      expect(res.body).to.have.property("total_pages", 2);
    });

    it('should fetch all the users using first name with filter', async () => {
      users = {
        filter: {
          name: {
            fname: process.env.TEST_fname
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });

    it('should fetch all the users using last name with filter', async () => {
      users = {
        filter: {
          name: {
            lname: process.env.TEST_lname
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });

    it('should fetch all the users using both last name and first name with filter', async () => {
      users = {
        filter: {
          name: {
            lname: process.env.TEST_lname,
            fname: process.env.TEST_fname
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });

    it("should fetch an empty data when the user data isn't registered", async () => {
      users = {
        filter: {
          name: {
            lname: "michael",
            fname: "jordan"
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.lengthOf(0);
    });

    it('should fetch all the users using dob with filter', async () => {
      users = {
        filter: {
          dob: "1996-05-30"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length(1);
    });

    it('should fetch all the users using role with filter', async () => {
      users = {
        filter: {
          role: "USER"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);

      users = {
        filter: {
          role: "ADMIN"
        }
      };

      const res2 = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res2.statusCode).to.equal(200);
      expect(res2.body.users).to.have.length.greaterThan(0);
    });

    it('should fetch all the users using status with filter', async () => {
      users = {
        filter: {
          status: "ACTIVE"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });

    it('should fetch all the users using gender with filter', async () => {
      users = {
        filter: {
          gender: "MALE"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length.greaterThan(0);
    });

    it("should fail if both range and exact range are used in createdAt filter", async () => {
      users = {
        filter: {
          createdAt: {
            range: {
              time_share: "week",
              times: 1
            },
            exact_range: ["2020-01-01", "2020-01-02"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("message", "Validation Error: You cannot set both range and exact_range")
    });

    it("should fetch users using hour and week from create_at with filter", async () => {
      let res;
      let clock;

      // Use fakeTimer to set Time
      clock = sinon.useFakeTimers(new Date('2024-04-21T22:06:29.845+00:00').getTime());

      users = {
        filter: {
          createdAt: {
            range: {
              time_share: "week",
              times: 1 // 1 week ago form current time
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length(11);

      // hour test
      users = {
        filter: {
          createdAt: {
            range: {
              time_share: "hour",
              times: 4 // 4 hours ago from current time
            }
          }
        }
      };

      res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.length(0);

      // restore time
      clock.restore();
    });

    it("should fetch users using exact range from create_at with filter", async () => {
      users = {
        filter: {
          createdAt: {
            exact_range: ["2024-04-09", "2024-04-13"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.lengthOf(2);
    });

    it('should return no user when an exact range contain no registered user', async () => {
      users = {
        filter: {
          createdAt: {
            exact_range: ["2023-04-09", "2023-04-13"]
          }
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.lengthOf(0);
    });

    it("should fetch users using various filter", async () => {
      let res;

      users = {
        filter: {
          name: {
            fname: "Daniella"
          },
          dob: "1996-05-30",
          status: "ACTIVE",
          createdAt: {
            exact_range: ["2024-04-15", "2024-04-16"]
          }
        }
      }

      res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.lengthOf(1);

      users = {
        filter: {
          name: {
            fname: "Daniella"
          },
          dob: "1996-05-30",
          status: "ACTIVE",
          createdAt: {
            exact_range: ["2024-04-15", "2024-04-15"]  // For the same day
          }
        }
      }

      res = await request(app)
        .post('/api/v1/auth/admin/get/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(users);

      expect(res.statusCode).to.equal(200);
      expect(res.body.users).to.have.lengthOf(1);
    });
  });

  describe("get investments", async () => {
    it("should fetch all investments when no filter is passed", async () => {
      investData = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(0);
    });

    it("should get investments using wallet id", async () => {
      investData = {
        count: false,
        filter: {
          wallet: process.env.TEST_wallet_id  // MATIC wallet
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(0);
    });

    it("should get investments using investor id (user id)", async () => {
      investData = {
        count: false,
        filter: {
          investor: process.env.TEST_user_id
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(3);
    });

    it("should fetch wallet using multiple filter", async () => {
      investData = {
        count: false,
        filter: {
          coin: "ETH",
          miner: "Antminer S19 Pro",
          status: "ACTIVE",
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/investments')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(investData);

      expect(res.statusCode).to.equal(200);
      expect(res.body.investments).to.have.length(1);
    })
  });

  describe("get transactions", async () => {
    let transactions;

    it('should fetch all the transactions when no value is passed', async () => {
      transactions = {
        filter: {}
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.keys("transactions", "haveNextPage", "totalPages");
      expect(res.body.transactions).to.have.length(7);
      expect(res.body).to.have.property("haveNextPage", false);
      expect(res.body).to.have.property("totalPages", 1);
    });

    it('should return the count of transaction present', async () => {
      transactions = {
        count: true,
        filter: {}
      }

      const res = await request(app)
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(3);
    });

    it('should fetch all the transactions using type with filter', async () => {
      transactions = {
        filter: {
          type: "DEBIT"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(7);
    });

    it('should fetch all the transaction using status with filter', async () => {
      transactions = {
        filter: {
          status: "FAILED"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(4);
    });

    it("should fetch all the transaction using status with filter", async () => {
      transactions = {
        filter: {
          credit_wallet: "APP"
        }
      };

      const res = await request(app)
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(7);
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(7);
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(7);

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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(7);

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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("message", "Validation Error: You cannot set both range and exact_range");
    })

    it("should fetch transactions using multiple filter", async () => {
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
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
        .post('/api/v1/auth/admin/get/transactions')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(transactions);

      expect(res.statusCode).to.equal(200);
      expect(res.body.transactions).to.have.lengthOf(2);
    });
  });
});
