const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

/**
 * TEST SUITE FOR USER ROUTES
 * - user id
 * - update user
 * - delete or deactivate user
 * - get abi and contract address
 * - create wallet
 * - update wallet
 * - get wallets / get wallet by id
 * - get miners
 */
describe(("USER ROUTES"), () => {
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

  describe(("user Id"), () => {
    it('should return error when a wrong userId is passed', async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/get/${hackerId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Bad request, Invalid Credentials");
    });

    it('should fail when the user uses a wrong token and correct Id', async () => {
      const res  = await request(app)
        .get(`/api/v1/auth/user/get/${userId}`)
        .set('Authorization', `Bearer ${hackerToken}`)

      expect(res.statusCode).to.equal(401);
      expect(res.body).to.have.property("msg", "Token expired, get a new access token at /api/v1/general/refresh-token or login again");
    });

    it('should get the user details', async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/get/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("user");
    });
  });

  describe('update user', () => { // Still working on
    let updateData;

    before(() => {
      updateData = {
        lname: "Eyanga",
        fname: "Daniella",
        aka: "Reaper",
        sensitive: {
          phone: "8088393462",
          email: "daniel.eyang@swiftrise.com",
          new_password: "SwiftRise123#"
        },
        password: process.env.TEST_password
      };
    });

    it('should fail when the user uses a wrong token', async () => {
      const res  = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${hackerToken}`)
        .send({ lname: updateData.lname });

        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property("msg", "Token expired, get a new access token at /api/v1/general/refresh-token or login again");
    });

    it('should return fail when updating sensitive data: phone without providing password', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { phone: updateData.sensitive.phone }});
      
      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("type", "Validation Error: Password is required for updating sensitive fields(email, phone, password)");
    });

    it('should return fail when updating sensitive data: email without providing password', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { email: updateData.sensitive.email }});
      
      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("type", "Validation Error: Password is required for updating sensitive fields(email, phone, password)");
    });

    it('should return fail when updating sensitive data: new-password without providing password', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { new_password: updateData.sensitive.new_password }});

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property("type", "Validation Error: Password is required for updating sensitive fields(email, phone, password)");
    });

    it('should update user firstname successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ fname: updateData.fname });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "User succesfully updated");
      expect(res.body.user.name.fname).to.equal(updateData.fname);
    });

    it('should update user lastname successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ lname: updateData.lname });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "User succesfully updated");
      expect(res.body.user.name.lname).to.equal(updateData.lname);
    });

    it('should update user aka successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ aka: updateData.aka });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "User succesfully updated");
      expect(res.body.user.name.aka).to.equal(updateData.aka);
    });

    it('should fail if wrong password is passed during phone update', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { phone: updateData.sensitive.phone }, password: "BadPassword123#" });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Bad Request: Invalid Credentials");
    });

    it('should fail if wrong password is passed during email update', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { email: updateData.sensitive.email }, password: "BadPassword123#" });
      
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Bad Request: Invalid Credentials");
    });

    it('should fail if wrong password is passed during new-password update', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { new_password: updateData.sensitive.new_password }, password: "BadPassword123#" });
      
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Bad Request: Invalid Credentials");
    });

    it.skip('should update user phone successfully', async () => { // remove skip to run
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { phone: updateData.sensitive.phone }, password: process.env.TEST_password });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "User succesfully updated");
      expect(res.body.user.phone).to.equal(updateData.sensitive.phone);
    });

    it.skip('should update user email successfully', async () => { // remove skip to run
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { email: updateData.sensitive.email }, password: process.env.TEST_password });
      
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "User succesfully updated");
      expect(res.body.user.email).to.equal(updateData.sensitive.email);
    });

    it('should update user password successfully', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/update`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ sensitive: { new_password: updateData.sensitive.new_password }, password: process.env.TEST_password });
      
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "User succesfully updated");
    });
  });

  describe("delete_or_deactivate", async () => {
    let data;

    before(() => {
      data = {
        password: process.env.TEST_password,
        ans: "Bread",
        want: "DEACTIVATED"
      };
    });

    it("should fail when password isn't provided", async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ans: data.ans, want: data.want });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"password" is required');
    });

    it("should fail when answer to question isn't provided", async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: data.password, want: data.want });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"ans" is required');
    });

    it("should fail when want isn't provided", async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: data.password,  ans: data.ans });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"want" is required');
    });

    it("should fail when incorrect password is provided", async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: "BadPassword123#", ans: data.ans, want: data.want });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", 'password/ans incorrect');
    });

    it("should fail when incorrect answer is provided", async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: data.password, ans: "Beans", want: data.want });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", 'password/ans incorrect');
    });

    it("should fail when incorrect want is provided", async () => {
      const res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ password: data.password, ans: data.ans, want: "CANCEL" });

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", '"want" must be one of [DELETED, DEACTIVATED]');
    });

    // remove skip to run, but running this will prevent tests after this from passing because the test user will be deactivated.
    it.skip("should successfully deactivate user account and validate deactivation", async () => { 
      let res;

      res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("msg", `User ${data.want} successfully`);

      // Check if user is deactivated successfully by making requests with deactivated account.
      // Check if user is logged out after deactivation
      res = await request(app)
        .get(`/api/v1/auth/user/get/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(401);
      expect(res.body).to.have.property("msg", "Token logged out, get a new access token at /api/v1/general/refresh-token or login again");

      // Try logging in
      const userLogin = {
        email_or_phone: process.env.TEST_email,
        password: process.env.TEST_password
      };

      res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Account DEACTIVATED');
      expect(res.body).to.have.property('resolve', '/api/v1/auth/user/reactivate');
    });

    // remove skip to run, but running this will prevent tests after this from passing because the test user will be deleted.
    it.skip("Should successfully delete user account and validate deletion", async () => {
      let res;

      res = await request(app)
        .post(`/api/v1/auth/user/delete_or_deactivate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...data, want: 'DELETED'});

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("msg", `User DELETED successfully`);

      // Check if user is deleted successfully by making requests with the deleted account.
      // Try logging in
      const userLogin = {
        email_or_phone: process.env.TEST_email,
        password: process.env.TEST_password
      };

      res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Account DELETED');
      expect(res.body).to.have.property('resolve', false);
    });
  });

  describe("get abi and contract address", async () => {
    let coin;
  
    it("should fail if coin isn't provided", async () => {
      const res = await request(app)
        .post('/api/v1/auth/user/get/ABI')
        .set('Authorization', `Bearer ${userToken}`)
        .send();
      
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"coin" is required');
    });

    it('should fail when you pass in a wrong coin', async () => {
      coin = {
        coin: "AMT"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/ABI')
        .set('Authorization', `Bearer ${userToken}`)
        .send(coin);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"coin" must be one of [ETH, BNB, MATIC]');
    });

    it('should successfully return the abi and contract address of Eth', async () => {
      coin = {
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/ABI')
        .set('Authorization', `Bearer ${userToken}`)
        .send(coin);
      
      expect(res.statusCode).to.equal(200);
      expect(res.body.contract).to.have.any.keys("abi", "address");
    });

    it('should successfully return the abi and contract address of BNB', async () => {
      coin = {
        coin: "BNB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/ABI')
        .set('Authorization', `Bearer ${userToken}`)
        .send(coin);
      
      expect(res.statusCode).to.equal(200);
      expect(res.body.contract).to.have.any.keys("abi", "address");
    });

    it('should successfully return the abi and contract address of Matic', async () => {
      coin = {
        coin: "MATIC"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/ABI')
        .set('Authorization', `Bearer ${userToken}`)
        .send(coin);
      
      expect(res.statusCode).to.equal(200);
      expect(res.body.contract).to.have.any.keys("abi", "address");
    });
  });

  describe('create wallet', async () => {
    let createData;

    it("should fail when address isn't provided", async () => {
      createData = {
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"address" is required');
    });

    it("should fail when coin isn't provided", async () => {
      createData = {
        address: process.env.TEST_RECIPIENT
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"coin" is required');
    });

    it("should fail when wrong coin is passed", async () => {
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "ARB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"coin" must be one of [ETH, BNB, MATIC]');
    });

    it.skip("should create Eth wallet successfully", async () => { // remove skip to run, (added skip due to non-idempotency)
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('wallet');
    });

    it.skip("should create BNB wallet successfully", async () => { // remove skip to run, (added skip due to non-idempotency)
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "BNB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('wallet');
    });

    it.skip("should create MATIC wallet successfully", async () => { // remove skip to run, (added skip due to non-idempotency)
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "MATIC"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('wallet');
    });

    it('should fail if another Eth wallet is present before creation', async () => {
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', `User already have a ${createData.coin} wallet`);
    });

    it('should fail if another MATIC wallet is present before creation', async () => {
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "MATIC"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', `User already have a ${createData.coin} wallet`);
    });

    it('should fail if another BNB wallet is present before creation', async () => {
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "BNB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', `User already have a ${createData.coin} wallet`);
    });

    it('should fail if the address is already in use by another user', async () => {
      createData = {
        address: process.env.TEST_RECIPIENT,
        coin: "BNB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/create/wallet')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(createData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Address already in use');
    });
  });

  describe('update wallet', async () => {
    let updateData;

    it("should fail when address isn't provided", async () => {
      updateData = {
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/update/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"address" is required');
    });

    it("should fail when coin isn't provided", async () => {
      updateData = {
        address: process.env.TEST_RECIPIENT
      };

      const res = await request(app)
        .post('/api/v1/auth/user/update/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"coin" is required');
    });

    it("should fail when wrong coin is passed", async () => {
      updateData = {
        address: process.env.TEST_RECIPIENT,
        coin: "ARB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/update/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', '"coin" must be one of [ETH, BNB, MATIC]');
    });

    it('should fail if the wallet to update does not exist before updating', async () => {
      updateData = {
        address: process.env.TEST_dummy_receipient,
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/update/wallet')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(updateData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", `User does not have a ${updateData.coin} wallet`);
    });
    
    it("should fail if the address is used by another user", async () => {
      updateData = {
        address: process.env.TEST_RECIPIENT,
        coin: "ETH"
      };
  
      const res = await request(app)
        .post('/api/v1/auth/user/update/wallet')
        .set('Authorization', `Bearer ${dummyUserToken}`)
        .send(updateData);
  
      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Address already in use");
    });

    it("should update address succesfully", async () => {
      updateData = {
        address: process.env.TEST_RECIPIENT,
        coin: "ETH"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/update/wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('msg', `You have successfully updated your ${updateData.coin} wallet address`);
    });
  });

  describe('get wallets', async () => {
    let data;

    it('should fail if a false coin is passed', async () => {
      data = {
        all: false,
        coin: "ARB"
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(400);
      expect(res.body.errors).to.have.property('message', '"coin" must be one of [ETH, BNB, MATIC]');
    });

    it('should fetch all the wallet available for a user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.have.length.greaterThan(1);
    });

    it('should fetch one wallet', async () => {
      data = {
        all: false,
        coin: 'ETH'
      }

      const res =await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets[0]).to.have.property('coin', 'ETH');
      expect(res.body.wallets[0]).to.have.property('address');
    });

    it('should return an empty array when all is set to false and coin isnt provided', async () => {
      data = {
        all: false
      };

      const res = await request(app)
        .post('/api/v1/auth/user/get/wallets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(data);

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallets).to.be.empty;
    });

    it('should fail if invalid wallet id is passed', async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/wallet/66155403334a5da0ef5e701g')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(500);
    });
    
    it('should fail if a non-existing wallet id is passed', async () => {
      const res = await request(app)
      .get(`/api/v1/auth/user/wallet/${process.env.TEST_userId}`)
      .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", 'Invalid Request, wallet does not exist');
    });

    it('should fail if user passed in a wallet not linked to his/her account', async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/wallet/${process.env.TEST_wallet_id}`)
        .set('Authorization', `Bearer ${dummyUserToken}`);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", 'Bad request, Invalid credentials');
    });

    it('should get wallet by id', async () => {
      const res = await request(app)
        .get(`/api/v1/auth/user/wallet/${process.env.TEST_wallet_id}`)
        .set('Authorization', `Bearer ${userToken}`)

      expect(res.statusCode).to.equal(200);
      expect(res.body.wallet).to.not.be.empty;
    });
  });

  describe("get miners", async () => {
    it("should return all the miners created", async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/miners')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.miners).to.not.be.empty;
    });

    it("should return miner specified by name", async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/get/miner/Antminer S19 Pro')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body.miner).to.not.be.empty;
    });

    it("should return 404 error for invalide miner", async () => {
      const res = await request(app)
        .get('/api/v1/auth/user/get/miner/Miner 2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property("msg", "Miner not found");
    });
  });
});
