require('dotenv').config();
const { Express } = require('express');
const { logger } = require('../logger');
const cron = require('node-cron');
const mail_service = require('../services/mail_service')
// const { redisClient } = require('../redis');

/**
 * Starts server
 * @param {Express} app
 */

const startServer = (app) => {
  const port = process.env.APP_PORT || 5000;
  // ping redis server
  // const ping = (async () => {
  //   // ping redis server
  //   if(redisClient.check_power()) {
  //     redisClient.isAlive()
  //     .then((res) => {
  //       if(res) {
  //         logger.info(`CACHING ON`);
  //       }
  //     });
  //   } else {
  //       logger.info(`CACHING OFF`);
  //   }
  // })();
  app.listen(port, () => {
    logger.info(`Server listening on PORT ${port}`);

    // Setup cron jobs
    if (process.env.MAIL_USER) {
      cron.schedule("*/120 * * * * *", async () => { await mail_service.handleEmailCron() });
    }
  });

  // ping
  //   .catch((err) => {
  //     logger.error('Redis error: ', err);
  //   });
};

module.exports = { startServer };
