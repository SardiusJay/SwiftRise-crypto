const mongoose = require("mongoose");
const { userSchema } = require('../mongo_schemas/user');
const { InvestmentSchema } = require('../mongo_schemas/investment');
const { walletSchema } = require('../mongo_schemas/wallet');
const { transactionSchema } = require('../mongo_schemas/transaction');
const { paymentSchema } = require('../mongo_schemas/payment');
const { contractSchema } = require('../mongo_schemas/contract');
const { emailSchema } = require('../mongo_schemas/email')
const { Collections } = require('../../enum_ish');
const { logger } = require('../../logger');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const db_name = process.env.DB;
const db_user = process.env.DB_USER;
const db_pwd = process.env.DB_PWD;
const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;

class DbStorage {
  constructor() {
    try {
      this._page_size = 20;
      // initializes a new DbStorage instance
      this._conn = mongoose
        .createConnection(`mongodb://${db_user}:${db_pwd}@${db_host}:${db_port}/${db_name}`, {minPoolSize: 2});
      this._conn.once('open', () => {
        logger.info('Database connection successfull');
      });

      this._mongo_db = mongoose;
      this.mongo_repos = {};
      this._blacklist_file = path.join(__dirname, 'blacklist.json');
      this._reset_blacklist_file = path.join(__dirname, 'reset-blacklist.json');
    } catch (error) {
      logger.error('Database connection failed');
      throw error;
    }

  }

  get mongo_db() {
    return this._mongo_db;
  }

  get page_size() {
    return this._page_size;
  }

  set mongo_db(value) {
    this._mongo_db = value;
  }

  get conn() {
    return this._conn;
  }

  /**
   * Retrieves a repository based on the provided key.
   *
   * @param {string} key - The key used to identify the repository.
   * @return {any} The repository associated with the provided key.
   * @throws {mongoose.Error} If the repository with the provided key does not exist in the database.
   */
  get_a_repo (key) {
    if (key in this.mongo_repos) {
      return this.mongo_repos[key]; 
    }
    else {
      throw mongoose.Error(`${key} collection not in db`);
    }
  }

  /**
   * Closes the connection to the database.
   *
   * @return {Promise<void>} - A Promise that resolves when the connection is successfully closed.
   */
  async close_connection () {
    try {
      await this._conn.close()
      logger.info('Database connection closed', new Date().getTime());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reloads the models and collects the repositories for the current instance of the class.
   *
   * @throws {Error} - If there is an error while setting the models or collecting the repositories.
   */
  reload() {
    try {
      // set models
      const User = this._conn.model(Collections.User, userSchema);
      const Investment = this._conn.model(Collections.Investment, InvestmentSchema);
      const Payment = this._conn.model(Collections.Payment, paymentSchema);
      const Transaction = this._conn.model(Collections.Transaction, transactionSchema);
      const Wallet = this._conn.model(Collections.Wallet, walletSchema);
      const Contract = this._conn.model(Collections.Contract, contractSchema);
      const Email = this._conn.model(Collections.Email, emailSchema);
      

      // collect repos
      this.mongo_repos.User = User;
      this.mongo_repos.Investment = Investment;
      this.mongo_repos.Payment = Payment;
      this.mongo_repos.Transaction = Transaction;
      this.mongo_repos.Wallet = Wallet;
      this.mongo_repos.Contract = Contract;
      this.mongo_repos.Email = Email;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asynchronously adds a JWT object to the blacklist.
   *
   * @param {Object} jwtObj - The JWT object to be blacklisted.
   * @return {Promise<void>} - A promise that resolves when the JWT is successfully blacklisted.
   * @throws {Error} - If there is an error reading or writing the blacklist file.
   */
  async blacklist_jwt(jwtObj) {
    try {
      // Read data from blacklist.json
      const data = await fs.readFile(this._blacklist_file, 'utf8');
      let jsonData;
      if (!data) {
        jsonData = {
          jwts: [],
        };
      } else {
        jsonData = JSON.parse(data);
      }
  
      jsonData.jwts.push(jwtObj);
  
      const updatedData = JSON.stringify(jsonData, null, 2);

      await fs.writeFile(this._blacklist_file, updatedData, 'utf8');
  
      logger.info('jwt blacklisted');
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a JSON Web Token (JWT) from the given token.
   *
   * @param {string} token - The JWT token to retrieve.
   * @return {Object|null} The JWT object if found, or null if not found.
   */
  async get_jwt(token) {
    try {
      const jsonData = await fs.readFile(this._blacklist_file, 'utf8');
      if (!jsonData) {
        return null;
      }
      const jwt = JSON.parse(jsonData).jwts.find((j) => j.token === token);
      return jwt;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

/**
 * Resets a token in the blacklist.
 *
 * @param {Object} tokenObj - The token object to blacklist.
 * @return {Promise<void>} - A promise that resolves when the token is blacklisted.
 */
  async blacklist_reset_token(tokenObj) {
    try {
      // Read data from blacklist.json
      const data = await fs.readFile(this._reset_blacklist_file, 'utf8');
      let jsonData;
      if (!data) {
        jsonData = {
          reset_tokens: [],
        };
      } else {
        jsonData = JSON.parse(data);
      }
  
      jsonData.reset_tokens.push(tokenObj);
  
      const updatedData = JSON.stringify(jsonData, null, 2);
  
      await fs.writeFile(this._reset_blacklist_file, updatedData, 'utf8');
  
      logger.info('token blacklisted');
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the blacklisted reset token from the JSON file.
   *
   * @param {string} token - The reset token to retrieve.
   * @return {Object|null} The blacklisted token object if found, otherwise null.
   */
  async get_reset_token(token) {
    try {
      const jsonData = await fs.readFile(this._reset_blacklist_file, 'utf8');
      if (!jsonData) {
        return null;
      }
      const blacklisted_token = JSON.parse(jsonData).reset_tokens.find((black) => black === token);
      return blacklisted_token;
    } catch (error) {
      throw error;
    }
  }
}

const db_storage = new DbStorage();
db_storage.reload(); //load Collections

/**
 * Returns information about pagination for a given filter and collection.
 * @param {object} filter - The filter to apply to the collection.
 * @param {string|null} collection - The name of the collection to query. If null, the function returns null.
 * @param {number} page_size - The number of items per page.
 * @param {number} page - The current page number.
 * @returns {object} - An object containing pagination information, haveNextPage, currentPageExists, totalPages and null if collection does not exist.
 * @throws {Error} - If there is an error while retrieving the pagination information.
 */
const page_info = async (filter={}, collection=null, page_size=10, page=1) => {
  try {
    if(collection && Object.values(Collections).includes(collection)) {
      const totalCount = await db_storage.get_a_repo(collection)
      .countDocuments(filter)
      .exec();

      let totalPages = Math.floor(totalCount / page_size);
      if((totalCount % page_size) > 0) {
        totalPages = totalPages + 1;
      }

      return {
        haveNextPage: page < totalPages,
        currentPageExists: page <= totalPages,
        totalPages: totalPages
      };
    }
    return null;
  } catch (error) {
    throw error;
  }
}

const { User, Transaction, Payment, Wallet, Investment, Contract, Email } = db_storage.mongo_repos;

module.exports = { 
  storage: db_storage, 
  Connection: db_storage.conn, 
  User,
  Transaction,
  Payment,
  Wallet,
  Investment,
  Contract,
  Email,
  page_info,
};
