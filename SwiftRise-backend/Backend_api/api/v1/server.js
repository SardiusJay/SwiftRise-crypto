process.traceProcessWarnings = true;
const { injectRoutes } = require('./routes');
const { injectMalwares } = require('../v1/index');
const { startServer } = require('./libs/boot');
const express = require('express');
const gracefulShutdown = require('express-graceful-shutdown');
const { Role, Gender, Qs, userStatus, Coin } = require('./enum_ish.js');
const { User, Contract } = require('./models/engine/db_storage.js');
const Contracts = require('./models/engine/contract_storage.js');
const util = require('./util.js');
const { serve, setup } = require('swagger-ui-express');
const { swaggerSpec, PATH_PREFIX } = require('./swagger-docs.js');
const { logger, appLogger } = require('./logger');
require('dotenv').config();

const app = express();

// App creates the God User of this app if it does not exist
const God = (async () => {
  try {
    const [bnb, eth, matic, user] = await Promise.all([
      Contract.exists({ coin: Coin.bnb }),
      Contract.exists({ coin: Coin.eth }),
      Contract.exists({ coin: Coin.matic }),
      User.exists({ email: process.env.APP_EMAIL })
    ]);

    if(bnb && eth && matic && user) {
      logger.info(`${Coin.bnb}, ${Coin.eth}, ${Coin.matic} contracts are all setup and live`);
      logger.info(`${process.env.APP_EMAIL}: We are open for business`);
      return null;
    }
    let prs = [
      Contract.create(Contracts[0]),
      Contract.create(Contracts[1]),
      Contract.create(Contracts[2])
    ]
    !user && prs.push(User.create({
      email: process.env.APP_EMAIL,
      password: await util.encrypt(process.env.APP_PWD),
      role:Role.super_admin,
      phone: process.env.APP_PHONE,
      name: {
        fname: 'SwiftRise',
        lname: 'Api',
        aka: 'God'
      },
      gender: Gender.other,
      q_and_a: {
        question: Qs.pet,
        answer: 'ruby'
      },
      status: userStatus.active
    }));
    await Promise.all(prs);
    
    logger.info(`${Coin.bnb}, ${Coin.eth}, ${Coin.matic} contracts are all setup and live`);
    logger.info(`${process.env.APP_EMAIL}: We are open for business`);
  } catch (error) {
    logger.error('Error creating or checking for God user', error);
  }
})();

// Setup logger
app.use(appLogger);

// inject middlewares
injectMalwares(app);

// Use Swagger UI
app.use(PATH_PREFIX + '/documentation', serve, setup(swaggerSpec));

// maps all routes to our express app
injectRoutes(app);

// handles God.
God
  .then((resolved) => {
    logger.info(`${process.env.APP_EMAIL}: God is set`);
  })
  .catch((err) => {
    logger.error('Something is wrong....', err);
  });

// start server
startServer(app);

// Graceful shutdown configuration
const shutdown = gracefulShutdown(app, {
  signals: 'SIGINT SIGTERM',
  timeout: 30000,
});

// Handle shutdown signals
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    shutdown()
      .then(() => {
        logger.info('Server gracefully shut down.');
        process.exit(0);
      })
      .catch((err) => {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
      });
  });
});

module.exports = app;
