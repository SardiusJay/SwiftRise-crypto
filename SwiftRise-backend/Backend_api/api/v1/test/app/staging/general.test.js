const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();


describe(("GENERAL ROUTES"), () => {
  describe(("Home"), () => {
    it('should get the welcome message', async () => {
      const res = await request(app)
        .get('/api/v1/general/');
  
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property("msg", "Welcome To SwiftRise Api!")
    });
  });

  describe(("Register User"), () => {
    let userData;

    it.skip("should successfully create a user", async () => {  // remove skip to run, but beware of non-idempotent behavior.
      userData = {
        fname: process.env.TEST_fname,
        lname: process.env.TEST_lname,
        gender: process.env.TEST_gender,
        email: process.env.TEST_email,
        phone: process.env.TEST_phone,
        password: process.env.TEST_password,
        q_and_a: {
          question: "What is the name of your favorite food",
          answer: "Bread"
        },
        dob: "1996-05-30"
      };

      const res = await request(app)
        .post('/api/v1/general/register')
        .send(userData);

      expect(res.statusCode).to.equal(201);
      expect(res.body.user).to.have.property('email', userData.email);
      expect(res.body.user).to.have.property('phone', userData.phone);
      expect(res.body.user).to.have.property('status', 'ACTIVE');
    });

    it("should fail if age is under limit (14 years)", async () => {
      userData = {
        fname: "Steve",
        lname: "Samson",
        gender: "MALE",
        email: "stevesamson@gmail.com",
        phone: "9099988876",
        password: "Stevesamson123#",
        q_and_a: {
          question: "What is the name of your favorite food",
          answer: "Beans"
        },
        dob: "2020-05-30"
      }

      const res = await request(app)
        .post('/api/v1/general/register')
        .send(userData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', "You are underage, go and play");
    });

    it("should validate integrity for phone number", async () => {
      userData = {
        fname: process.env.TEST_fname,
        lname: process.env.TEST_lname,
        gender: process.env.TEST_gender,
        email: 'daniel.eyang@swiftrise.com',
        phone: process.env.TEST_phone,
        password: process.env.TEST_password,
        q_and_a: {
          question: "What is the name of your favorite food",
          answer: "Bread"
        },
        dob: "1996-05-30"
      }

      const res = await request(app)
        .post('/api/v1/general/register')
        .send(userData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Phone exists");
    });

    it("should validate integrity for email", async () => {
      userData = {
        fname: process.env.TEST_fname,
        lname: process.env.TEST_lname,
        gender: process.env.TEST_gender,
        email: process.env.TEST_email,
        phone: "8088393462",
        password: process.env.TEST_password,
        q_and_a: {
          question: "What is the name of your favorite food",
          answer: "Bread"
        },
        dob: "1996-05-30"
      };

      const res = await request(app)
        .post('/api/v1/general/register')
        .send(userData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Email exists");
    });

    it("should validate TLD for email", async () => {
      userData = {
        fname: process.env.TEST_fname,
        lname: process.env.TEST_lname,
        gender: process.env.TEST_gender,
        email: 'daniel.eyang@swiftrise.edu',
        phone: process.env.TEST_phone,
        password: process.env.TEST_password,
        q_and_a: {
          question: "What is the name of your favorite food",
          answer: "Bread"
        },
        dob: "1996-05-30"
      };

      const res = await request(app)
        .post('/api/v1/general/register')
        .send(userData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "Invalid request body");
    });
  });

  describe("Login User", () => {
    let userLogin;

    it.skip("should successfully login a user with email", async () => { // remove skip to run, but beware of non-idempotent behavior.
      userLogin = {
        email_or_phone: process.env.TEST_email,
        password: process.env.TEST_password
      };

      const res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Login succesful");
      expect(res.body.user).to.have.all.keys('_id', 'role', 'name', 'email', 'phone');
      expect(res.body.tokens).to.have.all.keys('accessToken', 'refreshToken');
    });

    it.skip("should successfully login a user with phone", async () => { // // remove skip to run, but beware of non-idempotent behavior.
      userLogin = {
        email_or_phone: process.env.TEST_phone,
        password: process.env.TEST_password
      };

      const res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property("msg", "Login succesful");
      expect(res.body.user).to.have.all.keys('_id', 'role', 'name', 'email', 'phone');
      expect(res.body.tokens).to.have.all.keys('accessToken', 'refreshToken');
    });

    it("should fail to login with invalid email", async () => {
      userLogin = {
        email_or_phone: "daniel.eyang@swiftrise.com",
        password: process.env.TEST_password
      };

      const res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "email/phone or password or answer incorrect");
    });

    it("should fail to login with incorrect phone", async () => {
      userLogin = {
        email_or_phone: "8088393462",
        password: process.env.TEST_password
      };

      const res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "email/phone or password or answer incorrect");
    });

    it("should fail to login with incorrect password", async () => {
      userLogin = {
        email_or_phone: process.env.TEST_email,
        password: "password123"
      };

      const res = await request(app)
        .post('/api/v1/general/login')
        .send(userLogin);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property("msg", "email/phone or password incorrect");
    });
  });

  describe("Refresh Token", () => {
    let refreshData;

    before(() => {
      refreshData = {
        refresh_token: process.env.TEST_refreshToken,
        user_id: process.env.TEST_userId
      };
    });

    it("should successfully refresh token", async () => {
      const res = await request(app)
        .post('/api/v1/general/refresh-token')
        .send(refreshData);

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.all.keys('msg', 'user', 'new_token');
      expect(res.body).to.have.property('msg', 'Token refresh succesful');
      expect(res.body.user).to.have.property('_id', refreshData.user_id);
    });
    
    it("should fail when a wrong refreshToken is provided", async () => {
      refreshData = { user_id: refreshData.user_id, refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTE5MjE4MzAsImV4cCI6MTcxMjUyNjYzMH0.6609da952113d4564ed8dy609tc-fXOxsBWz2oidK0I" };

      const res = await request(app)
        .post('/api/v1/general/refresh-token')
        .send(refreshData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid Credential, Refresh token invalid');
    });
    
    it("should fail when a blacklisted refreshToken is provided", async () => {
      refreshData = { user_id: refreshData.user_id, refresh_token: process.env.TEST_refreshToken_blacklisted };

      const res = await request(app)
        .post('/api/v1/general/refresh-token')
        .send(refreshData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid Credential, Refresh token invalid');
    });

    it("should fail when a wrong userId is provided", async () => {
      refreshData = { user_id: "660c225370444fa45af2f26a", refresh_token: process.env.TEST_refreshToken };

      const res = await request(app)
        .post('/api/v1/general/refresh-token')
        .send(refreshData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property('msg', 'User does not exist');
    });

    it.skip("should fail when an expired refreshToken is provided", async () => {  // To run provide an expire token first for the user.
      const res = await request(app)
        .post('/api/v1/general/refresh-token')
        .send({ user_id: refreshData.user_id, refresh_token: process.env.TEST_expiredToken});

      expect(res.statusCode).to.equal(401);
      expect(res.body).to.have.property('msg', 'Refresh Token expired, user should login again');
      expect(res.body).to.have.property('second_chance', false);
    });

    it("should fail when an invalid data is provided", async () => {
      const res = await request(app)
        .post('/api/v1/general/refresh-token')
        .send({ user_id: refreshData.user_id, refresh_token: null});

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request body');
    });
  });

  describe("Forgot Password", () => {
    let forgetPassData;

    before(() => {
      forgetPassData = {
        email: process.env.TEST_email,
        front_url: "http://localhost:3000"
      };
    });

    it.skip("should successfully send forget password email", async () => { // remove skip to run
      const res = await request(app)
        .post('/api/v1/general/forget-password')
        .send({ ...forgetPassData, front_url: "http://localhost:3000" });

      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('msg', `Password reset link succesfully sent to ${forgetPassData.email}`);
    });

    it("should fail when an incorrect email is provided", async () => {
      forgetPassData = { ...forgetPassData, email: "swiftrise@gmail.com" };

      const res = await request(app)
        .post('/api/v1/general/forget-password')
        .send(forgetPassData);

      expect(res.statusCode).to.equal(404);
      expect(res.body).to.have.property('msg', 'Email does not exist');
    });

    it("should fail when no frontUrl is passed is provided", async () => {
      forgetPassData = { ...forgetPassData, front_url: null };

      const res = await request(app)
        .post('/api/v1/general/forget-password')
        .send(forgetPassData);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid request body');
    });
  
    it("should fail when an invalid data is provided", async () => {
      const res = await request(app)
        .post('/api/v1/general/forget-password')
        .send({ ...forgetPassData, email: null});

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid request body');
    });
  });

  describe('Validate Reset Token', () => {
    it('should fail if token is blacklisted', async () => {
      const blacklisted_token = process.env.TEST_resetToken_blacklisted;

      const res = await request(app)
        .get(`/api/v1/general/forget-password/validate-token/${blacklisted_token}`);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request, token is blacklisted');
      expect(res.body).to.have.property('valid', false);
    });

    it('should fail if token is invalid', async () => {
      const invalid_token = process.env.TEST_resetToken_invalid;

      const res = await request(app)
        .get(`/api/v1/general/forget-password/validate-token/${invalid_token}`);

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request, token has expired');
      expect(res.body).to.have.property('valid', false);
    });

    it.skip('should successfully validate token', async () => { // remove skip to run but provide a valid token
      const reset_token = process.env.TEST_resetToken;

      const res = await request(app)
        .get(`/api/v1/general/forget-password/validate-token/${reset_token}`);

      expect(res.statusCode).to.equal(200);
      expect(res.body).to.have.property('msg', 'Token is valid');
      expect(res.body).to.have.property('valid', true);
    });
  });

  describe('Reset password', async () => {
    it('should fail when password is not passed', async () => {
      const reset_token = process.env.TEST_resetToken;

      const res = await request(app)
        .post(`/api/v1/general/forget-password/update`)
        .send({ token: reset_token })

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request body');
    });

    it('should fail when token is not passed', async () => {
      const password = "SwiftRise123#";

      const res = await request(app)
        .post(`/api/v1/general/forget-password/update`)
        .send({ new_pwd: password })

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request body');
    });

    it('should fail when token is blacklisted', async () => {
      const blacklist = process.env.TEST_resetToken_blacklisted;
      const password = "SwiftRise123#";

      const res = await request(app)
        .post(`/api/v1/general/forget-password/update`)
        .send({ token: blacklist, new_pwd: password })

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request, token is blacklisted');
    });

    it('should fail when token is invalid', async () => {
      const invalid_token = process.env.TEST_resetToken_invalid;
      const password = "SwiftRise123#";

      const res = await request(app)
        .post(`/api/v1/general/forget-password/update`)
        .send({ token: invalid_token, new_pwd: password })

      expect(res.statusCode).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid request, token expired');
    });

    it.skip('should successfully reset password', async () => { // remove skip to run this.
      const reset_token = process.env.TEST_resetToken;
      const password = "SwiftRise123#";

      const res = await request(app)
        .post(`/api/v1/general/forget-password/update`)
        .send({ token: reset_token, new_pwd: password })
      
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('msg', 'Password successfully updated');
    });
  });
});
