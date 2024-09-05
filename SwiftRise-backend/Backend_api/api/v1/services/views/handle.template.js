const ejs = require('ejs');
const util = require('util');
const COMPANY = require('../../services/views/constants');
const { logger } = require('../../logger');

// Get current year
const year = new Date().getFullYear();
// Convert ejs.renderFile into a function that returns a Promise
const renderFile = util.promisify(ejs.renderFile);


class MailTemplates {
  /**
   * A description of the entire function.
   *
   * @param {type} user - user object
   * @property {string} fname - The user's first name.
   * @property {string} lname - The user's last name.
   * @return {type} returns the html template.
   */
  async renderWelcomeTemplate(user) {
    // Define the welcome data
    const welcome = {
      username: `${user.name.lname} ${user.name.fname}`,
      companyName: COMPANY.companyName,
      productName: COMPANY.productName,
      productUrl: COMPANY.productUrl,
      forgetPasswordUrl: COMPANY.forgetPasswordUrl,
      supportEmail: COMPANY.supportEmail,
      helpUrl: COMPANY.helpUrl,
      year: year,
      loginUrl: COMPANY.loginUrl,
    };

    try {
      const result = await renderFile('./services/views/welcome.ejs', welcome);
      return result;
    } catch(error) {
      logger.error(error);
      throw error;
    }
  };

  /**
   * Renders the disabled template.
   *
   * @param {type} user - user object
   ** @property {string} fname - The user's first name.
   ** @property {string} lname - The user's last name.
   * @param {string} reason - The reason for disabling the account.
   * @return {type} returns the html template.
   */
  async renderDeactivatedTemplate(user, reason) {
    // Define the goodbye data
    const goodbye = {
      username: `${user.name.lname} ${user.name.fname}`,
      companyName: COMPANY.companyName,
      productName: COMPANY.productName,
      productUrl: COMPANY.productUrl,
      supportEmail: COMPANY.supportEmail,
      reason: reason,
      year: year
    };

    try {
      const result = await renderFile('./services/views/disabled.ejs', goodbye);
      return result;
    } catch(error) {
      logger.error(error);
      throw error;
    }
  };

  /**
   * Renders the goodbye template.
   *
   * @param {type} user - user object
   ** @property {string} fname - The user's first name.
   ** @property {string} lname - The user's last name.
   * @return {type} returns the html template.
   */
  async renderGoodbyeTemplate(user) {
    // Define the goodbye data
    const goodbye = {
      username: `${user.name.lname} ${user.name.fname}`,
      companyName: COMPANY.companyName,
      productName: COMPANY.productName,
      productUrl: COMPANY.productUrl,
      supportEmail: COMPANY.supportEmail,
      year: year
    };

    try {
      const result = await renderFile('./services/views/goodbye.ejs', goodbye);
      return result;
    } catch(error) {
      logger.error(error);
      throw error;
    }
  };

  /**
   * Renders the forget template.
   *
   * @param {Object} user - The user object.
   ** @property {string} fname - The user's first name.
   ** @property {string} lname - The user's last name.
   * @param {string} resetLink - The reset link.
   * @return {type} returns the html template.
   */
  async renderForgetTemplate(user, resetLink) {
    // Define the forgetPass data
    const forgetPass = {
      username: `${user.name.lname} ${user.name.fname}`,
      companyName: COMPANY.companyName,
      productUrl: COMPANY.productUrl,
      productName: COMPANY.productName,
      supportEmail: COMPANY.supportEmail,
      resetLink: resetLink,
      year: year,
    };

    try {
      const result = await renderFile('./services/views/forgetPass.ejs', forgetPass);
      return result;
    } catch(error) {
      logger.error(error);
      throw error;
    }
  };
}

// Instantiate the MailTemplates class
const mail_templates = new MailTemplates();

module.exports = mail_templates;
