const app = require('../../../server');
const request = require('supertest');
const { expect } = require('chai');
require('dotenv').config();

/**
 * TEST SUITE FOR USER REGISTER - LOGIN - DEPOSIT
 */
describe(("USER LOGIN - INVEST"), () => {
  it("should login and invest", async () => {
    let res;
    let investData;

    const loginData = {
      email_or_phone: "tolulopedeborah12@gmail.com",
      password: "Jessiemyluv123#"
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
      
    // Invest
    investData = {
      miner_name: "Antminer S19 Pro",
      coin: "ETH",
      capital: 10
    };

    res = await request(app)
      .post('/api/v1/auth/user/invest')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(investData);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("msg", `You have successfully invested ${investData.capital} on ${investData.miner_name}`);
    expect(res.body.investment).to.not.be.empty;

    investData = {
      miner_name: "Antminer S19 Pro",
      coin: "ETH",
      capital: 10
    };

    res = await request(app)
      .post('/api/v1/auth/user/invest')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(investData);

    expect(res.statusCode).to.equal(201);
    expect(res.body).to.have.property("msg", `You have successfully invested ${investData.capital} on ${investData.miner_name}`);
    expect(res.body.investment).to.not.be.empty;
  });
});
