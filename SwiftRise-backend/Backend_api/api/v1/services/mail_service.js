const nodemailer = require('nodemailer');
const COMPANY = require('../services/views/constants');
const mail_templates = require('../services/views/handle.template');
const { emailStatus, emailType } = require('../enum_ish');
const { Email } = require('../models/engine/db_storage');
const { logger } = require('../logger');
require('dotenv').config();

/**
 * Handles all mail operations
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang Daniel Eyoh <https://github.com/Tediyang>
 */

class MailService {
  /**
   * Initializes a new instance of the class.
   *
   * @constructor
   */
  constructor() {
    this.sender = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PWD
      },
    });
  };

  /**
   * Sends a Mail to the user upon registration.
   *
   * @property {string} email - Email data that contains user name and reset link.
   * @return status
   */
  async sendUserCreationMail (email) {
    const welcomeTemplate = await mail_templates.renderWelcomeTemplate(email.content);

    const receiver = {
      to: email.email,
      subject: `Welcome to ${COMPANY.productName}`,
      html: welcomeTemplate
    };

    try {
      const info = await this.sender.sendMail(receiver);
      email.status = emailStatus.sent;
      await email.save();
      logger.info(`Email sent for user creation: ${info.response}`);
    } catch (error) {
      email.status = emailStatus.failed;
      await email.save();
      logger.error(`Error sending email for user creation: ${error.message}`);
    }
  };

  /**
   * Sends a disabled mail to the user.
   *
   * @property {string} email - Email data that contains user name and reason.
   * @return {Promise} - A Promise that resolves with the information about the sent email.
   */
  async sendUserDeactivationMail (email) {
    const deactivatedTemplate = await mail_templates.renderDeactivatedTemplate(email.content, email.content.reason);

    const receiver = {
      to: email.email,
      subject: `Account Disabled - ${COMPANY.productName}`,
      html: deactivatedTemplate
    };

    try {
      const info = await this.sender.sendMail(receiver);
      email.status = emailStatus.sent;
      await email.save();
      logger.info(`Disable Account Email sent to user : ${info.response}`);
    } catch (error) {
      email.status = emailStatus.failed;
      await email.save();
      logger.error(`Error sending disabled account email to user: ${error.message}`);
    }
  };

  /**
   * Sends a termination mail to the user.
   *
   * @property {string} email - Email data that contains user name.
   * @return {Promise} - A Promise that resolves with the information about the sent email.
   */
  async sendUserTerminationMail (email) {
    const goodbyeTemplate = await mail_templates.renderGoodbyeTemplate(email.content);

    const receiver = {
      to: email.email,
      subject: `Account Deletion - ${COMPANY.productName}`,
      html: goodbyeTemplate
    };

    try {
      const info = await this.sender.sendMail(receiver);
      email.status = emailStatus.sent;
      await email.save();
      logger.info(`Email sent for user termination: ${info.response}`);
    } catch (error) {
      email.status = emailStatus.failed;
      await email.save();
      logger.error(`Error sending email for user termination: ${error.message}`);
    }
  };

  /**
   * Sends a forget password mail to the user.
   * @property {string} email - Email data that contains user name and reset link.
   * @return {Promise} - A Promise that resolves with the information about the sent email.
   */
  async sendUserForgetPassMail (email) {
    const forgetPass = await mail_templates.renderForgetTemplate(email.content, email.content.resetLink);

    const receiver = {
      to: email.email,
      subject: 'Password Reset',
      html: forgetPass
    };

    try {
      const info = await this.sender.sendMail(receiver);
      logger.info('Password reset link sent.');
      email.status = emailStatus.sent;
      await email.save();
    } catch (error) {
      email.status = emailStatus.failed;
      await email.save();
      logger.error(`Failed to send reset link email: ${error.message}`);
    }
  };

  /**
   * Handle Cron job for Email Sending.
   */
  async handleEmailCron() {
    try {
      const emails = await Email
        .find({
          status: emailStatus.pending})
        .limit(process.env.LIMIT)
        .exec();

      if (emails.length === 0) {
        return
      }

      for (const email of emails ) {
        if (email.email_type === emailType.forget) {
          await this.sendUserForgetPassMail(email);
        } else if (email.email_type === emailType.delete) {
          await this.sendUserTerminationMail(email);
        } else if (email.email_type === emailType.welcome) {
          await this.sendUserCreationMail(email);
        } else {
          await this.sendUserDeactivationMail(email);
        }
      }
    } catch (error) {
      logger.error(error);
    }
  };
};

// Instantiate the MailService class
const mail_service = new MailService();

module.exports = mail_service;
