const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
require('dotenv').config();

/**
 * TEST SUITE FOR USER REGISTER - LOGIN - DEPOSIT
 */
describe(("USER LOGIN - PAYMENTS"), () => {
  it("should login and check investment status for complete payments", async () => {  //unskip to run test, but set jwt token exp to never expire
    let res;
    let clock;
    // let investData;

    const loginData = {
      email_or_phone: "tolulopedeborah@gmail.com",
      password: "SwiftRise123#"
    };

    // Login
    res = await request(app)
      .post('/api/v1/general/login')
      .send(loginData);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("msg", "Login succesful");
    expect(res.body.user).to.have.all.keys('_id', 'role', 'name', 'email', 'phone');
    expect(res.body.tokens).to.have.all.keys('accessToken', 'refreshToken');

    const accessToken = res.body.tokens.accessToken;

    // get wallet before balance
    const data = {
      all: false,
      coin: 'ETH'
    }

    res = await request(app)
      .post('/api/v1/auth/user/get/wallets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data);

    expect(res.statusCode).to.equal(200);
    expect(res.body.wallets[0]).to.have.property('coin', 'ETH');

    const beforeAmount = res.body.wallets[0].wallet_breakdown.available;

    // // fetch investment after maturity date
    // const investData = {
    //   count: false,
    //   filter: {
    //     coin: "ETH"
    //   }
    // };

    // res = await request(app)
    //   .post('/api/v1/auth/user/get/investments')
    //   .set('Authorization', `Bearer ${accessToken}`)
    //   .send(investData);

    // expect(res.statusCode).to.equal(200);

    // const investment1 = res.body.investments[0];
    // investment2 = res.body.investments[0];

    const investment_id = process.env.TEST_investment_id;

    // await setTimeout(() => {
    //   console.log("waiting for 5 seconds")
    // }, 5000);

    // Use fakeTimer to set Time
    clock = sinon.useFakeTimers(new Date("2024-05-15T19:47:39.339+00:00").getTime() + 6000);

    // get investment by id
    res = await request(app)
      .get(`/api/v1/auth/user/investment/${investment_id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.statusCode).to.equal(200)
    expect(res.body.investment).to.have.property("status", "ACTIVE");
    expect(res.body.investment.payments).to.have.lengthOf(8);

    // get wallet after balance
    res = await request(app)
      .post('/api/v1/auth/user/get/wallets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(data);

    expect(res.statusCode).to.equal(200);
    expect(res.body.wallets[0]).to.have.property('coin', 'ETH');

    const afterAmount = res.body.wallets[0].wallet_breakdown.available;
    expect(afterAmount).to.be.greaterThan(beforeAmount);

    // restore clock
    clock.restore();
  });
});
