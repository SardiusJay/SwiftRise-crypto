const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

/**
 * TEST SUITE FOR USER REGISTER - LOGIN - DEPOSIT
 */
describe(("USER REGISTER - LOGIN - DEPOSIT"), () => {
  it("should register, login user and deposit", async () => {
    let res;

    // Register user
    const registerData = {
      fname: "Toluwalopemi",
      lname: "Ayodele-Johnson",
      gender: "MALE",
      email: "tolulopedeborah@gmail.com",
      phone: "9162549811",
      password: "SwiftRise123#",
      q_and_a: {
        question: "What is the name of your favorite food",
        answer: "Eba"
      },
      dob: "2001-11-22"
    }

    res = await request(app)
      .post('/api/v1/general/register')
      .send(registerData);

    expect(res.statusCode).to.equal(201);
    expect(res.body.user).to.have.property('email', registerData.email);
    expect(res.body.user).to.have.property('phone', registerData.phone);
    expect(res.body.user).to.have.property('status', 'ACTIVE');

    // Login user
    res = await request(app)
      .post('/api/v1/general/login')
      .send({ email_or_phone: registerData.email, password: registerData.password });

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("msg", "Login succesful");
    expect(res.body.user).to.have.all.keys('_id', 'role', 'name', 'email', 'phone');
    expect(res.body.tokens).to.have.all.keys('accessToken', 'refreshToken');

    const accessToken = res.body.tokens.accessToken;

    // Deposit funds
    const depositData = {
      coin: "ETH",
      address: "0x61D8f4ac7D66c61562fACe4D44cd9fE10740FB2F",
      amount: 25,
      status: "SUCCESSFUL",
      transaction_id: "0x1925544498e6ee33b51e86dc4a03992853907d1d99f18655f6a708a93c8efd8c"
    };

    res = await request(app)
      .post('/api/v1/auth/user/deposit')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(depositData);

    console.log(res.body)
    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("msg", "Transaction SUCCESSFUL");

    // check if money was added to wallet
    res = await request(app)
      .post('/api/v1/auth/user/get/wallets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ all: false, coin: 'ETH' });

    expect(res.statusCode).to.equal(200);
    expect(res.body.wallets).to.have.lengthOf(1);
    expect(res.body.wallets[0].wallet_breakdown).to.have.property("available").greaterThan(0);
  });
});
