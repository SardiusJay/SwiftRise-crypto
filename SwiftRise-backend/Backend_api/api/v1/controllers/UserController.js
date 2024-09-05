const util = require('../util');
const { 
  Transaction, 
  User, 
  page_info, 
  Payment, 
  Wallet, 
  Investment, 
  storage, 
  Connection,
  Contract,
  Email
} = require('../models/engine/db_storage')
const { miner_service } = require('../services/miner/miner_service');
const { 
  payment_service_eth, 
  payment_service_bnb, 
  payment_service_matic 
} = require('../services/payment_service');
const { get_transaction_status} = require('../services/getTransactionStatus');
const MongooseError = require('mongoose').Error;
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;
const Joi = require('joi');
const { logger } = require('../logger');
const { Types } = require('mongoose');
const { 
  Collections, 
  Transaction_Status, 
  Role, 
  Time_share,
  Note_Status,
  Coin,
  Time_Directory,
  Transaction_type,
  userStatus,
  Investment_Status,
  Payment_status,
  emailType
 } = require('../enum_ish');
const mail_service = require('../services/mail_service');
const axios = require('axios');
require('dotenv').config();
/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang Daniel <https://github.com/Tediyang>
 */

class UserController {
  /**
   * Retrieves a user by their ID from the database.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Object} The user information.
   */
  static async get_user(req, res) {
    // serves both user and admin
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      // if not user or admin
      if((req.user.id !== req.params.id) && (![Role.admin, Role.super_admin].includes(req.user.role))) {
        return res
          .status(400)
          .json({ msg: 'Bad request, Invalid Credentials'});
      }

      const query = User.findById(req.params.id);

      const user = await query
        .exec();
      // if user does not exist
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }
      user.password = "";

      return res
        .status(200)
        .json({ user: user});
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Asynchronously deletes or deactivates the user account based on the provided request and response.
   *
   * @param {Object} req - the request object containing the user information
   * @param {Object} res - the response object for sending the result
   * @return {Object} the result of the delete or deactivate operation
   */
  static async delete_or_deactivate_account(req, res) {
    try {
      const schema = Joi.object({
        password: Joi
          .string()
          .required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
        ans: Joi
          .string()
          .required(),
        want: Joi
          .string()
          .valid(...[userStatus.deleted, userStatus.deactivated])
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { password, ans, want } = value;

      const user = await User.findById(req.user.id);

      // if user does not exist
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }

      const [is_pwd, is_ans] = await Promise.all([
        util.validate_encryption(password, user.password),
        util.validate_encryption(ans, user.q_and_a.answer)
      ]);

      // validate password
      if (is_pwd === false) {
        return res
          .status(400)
          .json({
          msg: 'password/ans incorrect',
        });
      }
      // validate ans
      if (is_ans === false) {
        console.log("in ans")
        return res
          .status(400)
          .json({
          msg: 'password/ans incorrect',
        });
      }

      user.status = want;

      // log user out
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Extract the token part
      const timestamp = new Date().toISOString();
      const jwt = {
        token: token,
        user: user._id.toString(),
        created_on: timestamp,
      };
      const refreshJwt = {
        token: user.jwt_refresh_token,
        user: user._id.toString(),
        created_on: timestamp,
      };

      // blacklist jwt
      await storage.blacklist_jwt(jwt);
      await storage.blacklist_jwt(refreshJwt);
      user.jwt_refresh_token = '';

      if(user.status === userStatus.deleted) {
        Connection.transaction(async () => {
          const mail = Email.create({
            email: user.email,
            email_type: emailType.delete,
            content: {
              name: {
                fname: user.name.fname,
                lname: user.name.lname,
              },
            }
          });

          await Promise.all([
            user.save(),
            mail
          ]);
        })
      } else {
        // save
        await user.save();
      }

      return res
        .status(200)
        .json({ 
          msg: `User ${want} successfully`,
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves a notification based on the provided ID.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} the retrieved notification
   */
  static async get_notification(req, res) {
    try {
      if (!req.params.id) { 
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'}); 
      }
      const user = await User
        .findById(req.user.id)
        .exec();

      if (!user) {
        return res
          .status(404)
          .json({
            msg: 'Bad request, cant find jwt user',
          });
      }

      const note = user.notifications.id(Types.ObjectId(req.params.id));

      if(!note) {
        return res
          .status(404)
          .json({ msg: 'Notification does not exist'});
      }

      return res
        .status(200)
        .json({
          note,
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Handles the logic for updating user information.
   *
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @return {Object} JSON response with status and message
   */
  static async update_user(req, res) {
    try {
      const schema = Joi.object({
        fname: Joi
          .string(),
        lname: Joi
          .string(),
        aka: Joi
          .string(),
        dob: Joi
          .date(),  // YYYY-MM-DD
        sensitive: Joi.object({
            phone: Joi
              .string()
              .pattern(/^[8792][01]\d{8}$/),
            email: Joi
              .string()
              .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            new_password: Joi
              .string()
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
          }),
        password: Joi
          .string()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
      })
      .custom((value, helpers) => {
        if(Object.values(value).length === 0) {
          return helpers.error('Validation Error: no values found');
        }
        const { sensitive, password } = value;
        if(sensitive && !password) {
          return helpers.error('Validation Error: Password is required for updating sensitive fields(email, phone, password)');
        }
        return value;
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      // if no value is set
      if(!value) {
        return res
          .status(400)
          .json({ msg: 'No data provided'});
      }

      const minDOB = new Date();
      minDOB.setFullYear(minDOB.getFullYear() - 14);
      if (value.dob > minDOB) {
        return res
          .status(400)
          .json({ msg: 'Minimum registration age is 14' });
      }

      const { fname, lname, aka, dob, sensitive, password } = value;
      
      const user = await User.findById({ _id: req.user.id }).exec();
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }

      // validates password for updating sensitive data
      if (sensitive) {
        const { phone, email, new_password } = sensitive;
        const is_pwd = await util.validate_encryption(password, user.password);
        // validate password
        if(!is_pwd) {
          return res
              .status(400)
              .json({ msg: 'Bad Request: Invalid Credentials'})
        }

        if (email) {
          user.email = email;
        }
        if (phone) {
          user.phone = phone;
        }
        if (new_password) {
          user.password = await util.encrypt(new_password);
        }
      }

      if(fname) { user.name.fname = fname; }
      if(lname) { user.name.lname = lname; }
      if(dob) { user.dob = dob; }
      if(aka) { user.name.aka = aka; }

      await user.save();
      user.password = "";
      user.notifications = [];
      return res
        .status(201)
        .json({ 
          msg: 'User succesfully updated',
          user: user,
        });

    } catch (error) {
      
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            errors: error.details[0],
          });
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves notifications based on the provided criteria.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} the response with the retrieved notifications
   */
  static async get_notifications(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        status: Joi
          .string()
          .valid(...Object.values(Note_Status))
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { count, status, page, size } = value;

      const user = await User.findById(req.user.id).exec();
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (count) {
        let count = 0;

        if(user.notifications.length > 0) {
          if(status) {
            count = user.notifications
            .filter((note) => {
              return note.status === status
            })
            .length;
          } else {
            count = user.notifications.length;
          }
        }

        return res
          .status(200)
          .json({
            count: count,
          });
      }
  
      let notes = [];
      if(user.notifications.length > 0) {
        if(status) {
          notes = user.notifications
            .map((note) => {
              if(note.status === status) {
                if(note.status === Note_Status.sent) {
                  note.status = Note_Status.received;
                }
                return note;
              }
            });
        } else {
          notes = user.notifications
            .map((note) => {
              if(note.status === Note_Status.sent) {
                note.status = Note_Status.received;
                return note;
              }
            });
        }
      }

      // update user
      await user.save();

      return res
        .status(200)
        .json({
          notes
        });
    } catch (error) {
      
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        logger.error(error)
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Updates the status of a notification for a user.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} the updated notification status
   */
  static async read_notification(req, res) {
    try {
      if (!req.params.id) {
        return res
        .status(400)
        .json({ msg: 'Invalid request, id is required'});
      }

      const user = await User
        .findById(req.user.id)
        .exec();
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }

      const note = user.notifications.id(Types.ObjectId(req.params.id));

      if(!note) {
        return res
          .status(404)
          .json({ msg: 'Notification does not exist'});
      }

      if(note.status === Note_Status.read) {
        return res
          .status(400)
          .json({ msg: 'Notification already read'});
      }

      user.notifications.map((note) => {
        if(note._id === Types.ObjectId(req.params.id)) {
          note.status = Note_Status.read;
        }
      });

      await user.save();

      return res
        .status(201)
        .json({ msg: "Notifications update successful"});

    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves a transaction by ID.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Object} The transaction object.
   */
  static async get_transaction(req, res) {
    // serves both user and admin
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      const transaction = await Transaction.findById(req.params.id);

      // validates transaction
      if(!transaction) {
        return res
          .status(404)
          .json({ msg: 'Invalid Request, transaction does not exist'});
      }

      // if not user or admin
      if((req.user.id !== transaction.user.toString()) && (![Role.admin, Role.super_admin].includes(req.user.role))) {
        return res
          .status(400)
          .json({ msg: 'Bad request, Invalid credentials'});
      }

      return res
        .status(200)
        .json({ transaction });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves a payment from the database.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} the payment object
   */
  static async get_payment(req, res) {
    // serves both user and admin
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      const payment = await Payment.findById(req.params.id);

      // validates payment
      if(!payment) {
        return res
          .status(404)
          .json({ msg: 'Invalid Request, payment does not exist'});
      }

      // if not user or admin
      if((req.user.id !== payment.user.toString()) && (![Role.admin, Role.super_admin].includes(req.user.role))) {
        return res
          .status(400)
          .json({ msg: 'Bad request, Invalid credentials'});
      }

      const result = await miner_service.make_payment(payment);

      return res
        .status(200)
        .json({ payment: result ? result.payment : payment });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves a wallet from the database.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a promise that resolves to the retrieved wallet
   */
  static async get_wallet(req, res) {
    // serves both user and admin
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      let wallet = await Wallet.findById(req.params.id);

      // validates wallet
      if(!wallet) {
        return res
          .status(404)
          .json({ msg: 'Invalid Request, wallet does not exist'});
      }

      // if not user or admin
      if((req.user.id !== wallet.user.toString()) && (![Role.admin, Role.super_admin].includes(req.user.role))) {
        return res
          .status(400)
          .json({ msg: 'Bad request, Invalid credentials'});
      }

      // update portfolio
      if(wallet.investments.length > 0) {
        if(wallet.investments.length === 1) {
          const result = await miner_service.pay_biWeekly_intrest(wallet.investments[0]);
          wallet = result ? result.wallet : wallet
        }
        if(wallet.investments.length > 1) {
          wallet.investments.map(async (investment) => {
            const result = await miner_service.pay_biWeekly_intrest(investment);
            wallet = result ? result.wallet : wallet
          })
        }
      }

      return res
        .status(200)
        .json({ wallet });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves an investment by ID and returns it as a JSON response.
   * This function serves both user and admin.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Object} The investment as a JSON response.
   */
  static async get_investment(req, res) {
    // serves both user and admin
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      const investment = await Investment.findById(req.params.id).populate('wallet payments');

      // validates investment
      if(!investment) {
        return res
          .status(404)
          .json({ msg: 'Invalid Request, investment does not exist'});
      }

      // if not user or admin
      if((req.user.id !== investment.investor.toString()) && (![Role.admin, Role.super_admin].includes(req.user.role))) {
        return res
          .status(400)
          .json({ msg: 'Bad request, Invalid credentials'});
      }

      let result;
      // make sure investment is up to date
      if (investment.status === Investment_Status.active) {
        result = await miner_service.pay_biWeekly_payments(investment);
      }

      return res
        .status(200)
        .json({ investment: result ? result.investment : investment });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves investments based on the provided filters.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a promise that resolves to the response object
   */
  static async get_my_investments(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            coin: Joi
              .string()
              .valid(...Object.values(Coin)),
            miner: Joi
              .string(),
            status: Joi
              .string()
              .valid(...Object.values(Investment_Status)),
            createdAt: Joi
              .object({
                range: Joi
                  .object({
                    time_share: Joi
                      .string()
                      .valid(...Object.keys(Time_share))
                      .default(Object.keys(Time_share)[0]),
                    times: Joi
                      .number()
                      .integer()
                      .default(1),
                  }),
                exact_range: Joi
                  .array()
                  .items(Joi.date())
                  .custom((value, helpers) => {
                    if(value && value.length > 2) {
                      return helpers.error('exact_range.invalid_length');
                    }
                    return value;
                  }),
              })
              .custom((value, helpers) => {
                const { range, exact_range } = value;
                if(exact_range && range) {
                  return helpers.error('range_and_exact_range.conflict');
                }
                return value;
              })
              .messages({
                'exact_range.invalid_length': 'Validation Error: you must provide not more than two dates for exact_range',
                'range_and_exact_range.conflict': 'Validation Error: You cannot set both range and exact_range',
              }), 
          }),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(20),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { count, filter, page, size } = value;

      // build query
      let query = {};
      const { 
        coin, 
        miner, 
        status, 
        createdAt,
      } = filter;

      // set current user
      query.investor = new Types.ObjectId(req.user.id);

      if(coin) {
        query.coin = coin;
      }

      if(miner) {
        query.miner = miner;
      }

      if(status) {
        query.status = status;
      }

      if(createdAt) {
        const { range, exact_range } = createdAt;
        if(range) {
          const { times, time_share } = range;
          // between now and the stipulated time
          query.createdAt = { 
            $lte: new Date(), 
            $gte: util.last_times(Time_share[time_share], times, Time_Directory.past)
          };
        }

        if(exact_range) {
          if(exact_range.length === 2) {
            // making sure it covers the entire day
            exact_range[1].setHours(exact_range[1].getHours() + 24);
            query.createdAt = { 
              $lte: exact_range[1],
              $gte: exact_range[0]
            };
          }

          if(exact_range.length === 1) {
            const ends = new Date(exact_range[0]);
            ends.setHours(ends.getHours() + 24);
            query.createdAt = { 
              $lte: ends, 
              $gte: exact_range[0]
            };
          }
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (count) {
        const result = await Investment
            .countDocuments(query);

        return res
          .status(200)
          .json({
            count: result,
          });
      }

      const { 
        haveNextPage, 
        currentPageExists, 
        totalPages
       } = await page_info(query, Collections.Investment, size, page);

      let data = null;

      if(currentPageExists) {
        // update users portfolio
        await miner_service.update_user_investment_payments(req.user.id);

        // get investments
        data = await Investment
          .find(query)
          .skip((page - 1) * size)
          .limit(size)
          .sort({ createdAt: -1 }); //get investments
      }
      
      return res
        .status(200)
        .json({
          investments: data ? data : [],
          haveNextPage,
          totalPages
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            errors: error.details[0],
          });
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves the wallets based on the provided filters.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} the wallets and related information
   */
  static async get_my_wallets(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        all: Joi
          .boolean()
          .default(true),
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .custom((value, helpers, options) => {
            const { all } = options.parent;
            if(!all && !value) {
              return helpers.error({ message: 'Validation Error: coin is required if all is false' });
            }
            return value;
          }),
      });

      // validate body
      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { coin, all } = value;

      let query = {};
      const user = new Types.ObjectId(req.user.id);
      query.user = user;
      if(!all) {
        query.coin = coin;
      }

      // update users portfolio and get wallets
      const [wallets, fromMineService] = await Promise.all([
        Wallet.find(query),
        miner_service.update_user_investment_payments(req.user.id)
      ]);

      return res
        .status(200)
        .json({
          wallets: wallets
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            errors: error.details[0],
          });
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves the transactions for the current user based on the specified filters.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise} A promise that resolves to the response object.
   */
  static async get_my_transactions(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            coin: Joi
              .string()
              .valid(...Object.values(Coin)),
            type: Joi
              .string()
              .valid(...Object.values(Transaction_type)),
            status: Joi
              .string()
              .valid(...Object.values(Transaction_Status)),
            credit_wallet: Joi
              .string(),
            debit_wallet: Joi
              .string(),
            createdAt: Joi
              .object({
                range: Joi
                  .object({
                    time_share: Joi
                      .string()
                      .valid(...Object.keys(Time_share))
                      .default(Object.keys(Time_share)[0]),
                    times: Joi
                      .number()
                      .integer()
                      .default(1),
                  }),
                exact_range: Joi
                  .array()
                  .items(Joi.date())
                  .custom((value, helpers) => {
                    if(value && value.length > 2) {
                      return helpers.error('exact_range.invalid_length');
                    }
                    return value;
                  }),
              })
              .custom((value, helpers) => {
                const { range, exact_range } = value;
                if(exact_range && range) {
                  return helpers.error('range_and_exact_range.conflict');
                }
                return value;
              })
              .messages({
                'exact_range.invalid_length': 'Validation Error: you must provide not more than two dates for exact_range',
                'range_and_exact_range.conflict': 'Validation Error: You cannot set both range and exact_range',
              }),
          }),
        page: Joi
          .number()
          .integer()
          .default(1),
        size: Joi
          .number()
          .integer()
          .default(20),
      });

      // validate body
      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { count, filter, page, size } = value;

      // build query
      let query = {};
      const {
        coin,
        type,
        status,
        credit_wallet,
        debit_wallet,
        createdAt,
      } = filter;

      // set current user
      query.user = new Types.ObjectId(req.user.id);

      if(coin) {
        query.coin = coin;
      }

      if(type) {
        query.type = type;
      }

      if(status) {
        query.status = status;
      }

      if(credit_wallet) {
        query.credit_wallet = credit_wallet;
      }

      if(debit_wallet) {
        query.debit_wallet = debit_wallet;
      }

      if(createdAt) {
        const { range, exact_range } = createdAt;
        if(range) {
          const { times, time_share } = range;
          // between now and the stipulated time
          query.createdAt = { 
            $lte: new Date(), 
            $gte: util.last_times(Time_share[time_share], times, Time_Directory.past)
          };
        }

        if(exact_range) {
          if(exact_range.length === 2) {
            // making sure it covers the entire day
            exact_range[1].setHours(exact_range[1].getHours() + 24);
            query.createdAt = { 
              $lte: exact_range[1],
              $gte: exact_range[0]
            };
          }

          if(exact_range.length === 1) {
            const ends = new Date(exact_range[0]);
            ends.setHours(ends.getHours() + 24);
            query.createdAt = { 
              $lte: ends, 
              $gte: exact_range[0]
            };
          }
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (count) {
        const result = await Transaction
            .countDocuments(query);

        return res
          .status(200)
          .json({
            count: result,
          });
      }

      const { 
        haveNextPage, 
        currentPageExists, 
        totalPages
       } = await page_info(query, Collections.Transaction, size, page);

      let data = [];

      if(currentPageExists) {
        data = await Transaction
          .find(query)
          .skip((page - 1) * size)
          .limit(size)
          .sort({ createdAt: -1 })
          .exec(); //get transactions
      }

      return res
        .status(200)
        .json({
          transactions: data,
          haveNextPage,
          totalPages
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            errors: error.details[0],
          });
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves the payments based on the provided filters.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} - the payments and pagination information
   */
  static async get_my_payments(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            coin: Joi
              .string()
              .valid(...Object.values(Coin)),
            status: Joi
              .string()
              .valid(...Object.values(Payment_status)),
            miner: Joi
              .string(),
            createdAt: Joi
              .object({
                range: Joi
                  .object({
                    time_share: Joi
                      .string()
                      .valid(...Object.keys(Time_share))
                      .default(Object.keys(Time_share)[0]),
                    times: Joi
                      .number()
                      .integer()
                      .default(1),
                  }),
                exact_range: Joi
                  .array()
                  .items(Joi.date())
                  .custom((value, helpers) => {
                    if(value && value.length > 2) {
                      return helpers.error('exact_range.invalid_length');
                    }
                    return value;
                  }),
              })
              .custom((value, helpers) => {
                const { range, exact_range } = value;
                if(exact_range && range) {
                  return helpers.error('range_and_exact_range.conflict');
                }
                return value;
              })
              .messages({
                'exact_range.invalid_length': 'Validation Error: you must provide not more than two dates for exact_range',
                'range_and_exact_range.conflict': 'Validation Error: You cannot set both range and exact_range',
              })
            }),
        page: Joi
          .number()
          .integer()
          .default(1),
      });

      // validate body
      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { count, filter, page, size } = value;

      // build query
      let query = {};
      const {
        miner,
        createdAt,
        coin,
        status
      } = filter;

      // set current user
      query.user = new Types.ObjectId(req.user.id);
    
      if(coin) {
        query.coin = coin;
      }

      if(status) {
        query.status = status;
      }

      if(miner) {
        query.miner = miner;
      }

      if(createdAt) {
        const { range, exact_range } = createdAt;
        if(range) {
          const { times, time_share } = range;
          // between now and the stipulated time
          query.createdAt = { 
            $lte: new Date(), 
            $gte: util.last_times(Time_share[time_share], times, Time_Directory.past)
          };
        }

        if(exact_range) {
          if(exact_range.length === 2) {
            // making sure it covers the entire day
            exact_range[1].setHours(exact_range[1].getHours() + 24);
            query.createdAt = { 
              $lte: exact_range[1],
              $gte: exact_range[0]
            };
          }

          if(exact_range.length === 1) {
            const ends = new Date(exact_range[0]);
            ends.setHours(ends.getHours() + 24);
            query.createdAt = { 
              $lte: ends, 
              $gte: exact_range[0]
            };
          }
        }
      }

      // if count is true, consumer just wants a count of the filtered documents
      if (count) {
        const result = await Payment
            .countDocuments(query);

        return res
          .status(200)
          .json({
            count: result,
          });
      }

      const { 
        haveNextPage, 
        currentPageExists, 
        totalPages
       } = await page_info(query, Collections.Payment, size, page);

      let data = null;

      if(currentPageExists) {
        // update users portfolio
        await miner_service.update_user_investment_payments(req.user.id);
  
        // get payments
        data = await Payment
          .find(query)
          .skip((page - 1) * size)
          .limit(size)
          .sort({ createdAt: -1 }); //get payments
      }

      return res
        .status(200)
        .json({
          payments: data || [],
          haveNextPage,
          totalPages
        });
    
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }

      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            errors: error.details[0],
          });
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves a miner based on the provided name.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Object} The miner object.
   */
  static async get_miner(req, res) {
    try {
      if(!req.params.name) {
        return res
          .status(400)
          .json({ msg: 'Bad request, name is required'});
      }

     const miner = await miner_service.get_miner({ name: req.params.name });

     if(!miner) {
       return res
         .status(404)
         .json({ msg: 'Miner not found'});
     }
      
      return res
        .status(200)
        .json({
          miner,
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Retrieves all miners from the database.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @return {Promise<object>} - The response object containing the list of miners.
   */
  static async get_all_miners(req, res) {
    try {
      const miners = await miner_service.get_all_miners();

      if(!miners) {
        return res
          .status(404)
          .json({ msg: 'no miner found'});
      }
      
      return res
        .status(200)
        .json({
          miners,
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Handles the investment request.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a promise that resolves to the investment result
   */
  static async invest(req, res) {
    try {
      const schema = Joi.object({
        miner_name: Joi
          .string()
          .required(),
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
        capital: Joi
          .number()
          .integer()
          .precision(2)
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { miner_name, coin, capital } = value;

      const wallet_Pr = Wallet
        .findOne({ user: new Types.ObjectId(req.user.id), coin });

      const miner_pr = miner_service.get_miner({ name: miner_name });

      const [wallet, miner] = await Promise.all([wallet_Pr, miner_pr]);
      // validate miner and wallet
      if(!miner || !wallet) {
        return res
          .status(404)
          .json({ msg: `Bad Request: ${!miner ? miner_name + ' Miner' : coin + ' Wallet'} not found`});
      }

      const { available } = wallet.wallet_breakdown;

      // validate wallet available balance
      if(available < capital) {
        return res
          .status(400)
          .json({ msg: 'Insufficient funds'});
      }

      // invest
      const { data, msg } = await miner_service.invest({ wallet, miner, capital });

      // if there is a problem
      if(!data) {
        return res
          .status(400)
          .json({ msg });
      }
      
      return res
        .status(201)
        .json({
          msg: `You have successfully invested ${capital} on ${miner_name}`,
          investment: data._id
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      };

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Create a wallet for a user.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a promise that resolves to the response object
   */
  static async create_wallet(req, res) {
    try {
      const schema = Joi.object({
        address: Joi
          .string()
          .required(),
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const user = new Types.ObjectId(req.user.id);
      const { address, coin } = value;
      const byAddressPr = Wallet.findOne({ address: address, user: { $ne: user } });
      const walletPr =  Wallet
        .findOne({ user: user, coin });

      const [ byAddress, wallet ] = await Promise.all([ byAddressPr, walletPr ]);
  
      if(byAddress) {
        return res
          .status(400)
          .json({
            msg: "Address already in use"
          });
      }


      if(wallet) {
        return res
          .status(400)
          .json({
            msg: `User already have a ${coin} wallet`, 
            wallet: wallet
          });
      }

      const new_wallet = await Wallet
        .create({
          user: new Types.ObjectId(req.user.id),
          address,
          coin,
          wallet_breakdown: {
            holdings: 0,
            available: 0,
            total: 0,
          },
        });
      return res
        .status(201)
        .json({
          msg: `You have successfully created an ${coin} wallet`,
          wallet: new_wallet
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async update_wallet(req, res) {
    try {
      const schema = Joi.object({
        address: Joi
          .string()
          .required(),
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { address, coin } = value;

      const user = new Types.ObjectId(req.user.id);
      const byAddressPr = Wallet.findOne({ address: address, user: { $ne: user } });
      const walletPr =  Wallet
        .findOne({ user: user, coin });

      const [ byAddress, wallet ] = await Promise.all([ byAddressPr, walletPr ]);
  
      if(byAddress) {
        return res
          .status(400)
          .json({
            msg: "Address already in use"
          });
      }


      if(!wallet) {
        return res
          .status(404)
          .json({
            msg: `User does not have a ${coin} wallet`
          });
      }

      wallet.address = address;
      await wallet.save();

      return res
        .status(201)
        .json({
          msg: `You have successfully updated your ${coin} wallet address`,
          wallet: wallet
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Handles the deposit endpoint.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise} A Promise that resolves to the response object.
   */
  static async deposit(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
        address: Joi
          .string()
          .required(),
        amount: Joi
          .number()
          .precision(2)
          .required(),
        status: Joi
          .string()
          .valid(...Object.values(Transaction_Status))
          .required(),
        transaction_id: Joi
          .string()
          .required()
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { transaction_id, coin, amount, status, address } = value;
      const user = new Types.ObjectId(req.user.id);

      let promises = [Wallet.findOne({ user: user, coin: coin }).exec()];
      if (status === Transaction_Status.successful) {
        promises.push(get_transaction_status.getDepositStatus(coin, transaction_id));
      }
      let [wallet, actualAmount] = await Promise.all(promises);
      if (!wallet) {
        if (Transaction_Status.successful === status || Transaction_Status.pending === status) {
          wallet = await Wallet.create({
            user: user,
            address: address,
            coin: coin,
            wallet_breakdown: {
              holdings: 0,
              available: actualAmount ? actualAmount : 0,
              total: actualAmount ? actualAmount : 0,
            },
          });

          const transaction = await Transaction.create({
            user: user,
            transaction_breakdown: {
              total_amount: actualAmount ? actualAmount : amount,
              amount: actualAmount ? actualAmount : amount,
              charges: 0
            },
            coin: coin,
            status: ( actualAmount || Transaction_Status.pending === status ) ? status : 'FAILED',  // handles when a failed transaction is sent as successful
            data_from_payment_service: transaction_id,
            credit_wallet: "APP",
            debit_wallet: address,
            wallet: wallet._id,
            type: Transaction_type.debit
          });
          
          return res
            .status(201)
            .json({
              msg: `Transaction ${ ( actualAmount || Transaction_Status.pending === status ) ? status : 'FAILED' }`,  // handles when a failed transaction is sent as successful
              transaction_id: transaction._id
            });
        }

        return res
          .status(400)
          .json({
            msg: `Transaction failed`
          });
      }

      const transaction = await Transaction.create({
        user: user,
        transaction_breakdown: {
          total_amount: actualAmount ? actualAmount : amount,
          amount: actualAmount ? actualAmount : amount,
          charges: 0
        },
        coin: coin,
        status: ( actualAmount || Transaction_Status.pending === status ) ? status : Transaction_Status.failed,  // handles when a failed transaction is sent as successful
        data_from_payment_service: transaction_id,
        credit_wallet: "APP",
        debit_wallet: address,
        type: Transaction_type.debit
      });

      wallet.wallet_breakdown.available += actualAmount ? actualAmount : 0;
      wallet.wallet_breakdown.total += actualAmount ? actualAmount : 0;
      await wallet.save();

      return res
        .status(201)
        .json({
          msg: `Transaction ${ ( actualAmount || Transaction_Status.pending === status ) ? status : 'FAILED' }`,  // handles when a failed transaction is sent as successful
          transaction_id: transaction._id
        });

    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async withdraw(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
        address: Joi
          .string(),
        amount: Joi
          .number()
          .precision(2)
          .required(),
        answer: Joi
          .string()
          .required()
      });

      // validate body
      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { coin, amount, address, answer } = value;

      const user_id = new Types.ObjectId(req.user.id);
      const user = await User.findOne({ _id: user_id });
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }

      const is_ans = await util.validate_encryption(answer, user.q_and_a.answer);
      if(!is_ans) {
        return res
          .status(400)
          .json({
            msg: `Incorrect answer for security question "${user.q_and_a.question}?", try again`
          });
      }

      let wallet = await Wallet
        .findOne({ user: user, coin: coin });

      if(!wallet) {
        return res
          .status(404)
          .json({
            msg: `You dont have a ${coin} wallet`
          });
      }

      if(wallet.wallet_breakdown.available < amount) {
        return res
          .status(400)
          .json({
            msg: `You dont have enough in ${coin} Wallet to withdraw`
          });
      }

      if((amount < 5) || (amount > 5000)) {
        if(amount < 5) {
          return res
            .status(400)
            .json({
              msg: "You cant withdraw less than $5"
            })
        } else {
          return res
            .status(400)
            .json({
              msg: "You cant withdraw more than $5,000"
            })
        }
      }

      // get charges, 12% of the amount
      const charges = (9.8 * amount) / 100;

      let receipt = null;
      try {
        if(coin === Coin.eth) {
          receipt = await payment_service_eth.transfer({ amountInUsd: amount - charges, recipientEthAddress: address ? address : wallet.address });
        }
        if(coin === Coin.bnb) {
          receipt = await payment_service_bnb.transfer({ amountInUsd: amount, recipientBNBAddress: address ? address : wallet.address });
        }
        if(coin === Coin.matic) {
          receipt = await payment_service_matic.transfer({ amountInUsd: amount, recipientMaticAddress: address ? address : wallet.address });
        }
      } catch (error) {
        logger.error('Transaction failed', receipt.error);
        throw new Error('Transaction failed');
      }

      if (receipt.status !== 1 && receipt.status !== 0) {
        
        logger.error('Transaction failed', receipt.error);
        throw new Error('Transaction failed');
      }
  
      const { hash, to, status } = receipt;

      const transaction = await Transaction.create({
        user: user,
        transaction_breakdown: {
          total_amount: amount,
          amount: amount - charges,
          charges: charges
        },
        coin: coin,
        debit_wallet: "APP",
        credit_wallet: address ? address : wallet.address,
        type: Transaction_type.credit
      });

      transaction.data_from_payment_service = hash;
      transaction.credit_wallet = to ? to : address;

      if(status === 1) {
        transaction.status = Transaction_Status.successful;
        wallet.wallet_breakdown.available -= amount;
        wallet.wallet_breakdown.total -= amount;
        await wallet.save();
      } else {
        transaction.status = Transaction_Status.failed;
      }

      await transaction.save();
      return res
        .status(201)
        .json({
          msg: `Transaction ${transaction.status}`,
          transaction_id: transaction._id
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async getFundingPayload(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string() 
          .valid(...Object.values(Coin))
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { coin } = value;

      const contract = await Contract.findOne({ coin: coin });

      if(!contract) {
        return res
          .status(404)
          .json({
            msg: `We dont have a ${coin} contract`
          });
      }
      
      return res
        .status(200)
        .json({
          contract: contract
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async resolveTransaction(req, res) {
    try {
      if(!req.params.id) {
        return res
          .status(400)
          .json({ msg: 'Bad request, id is required'});
      }

      const transaction = await Transaction.findOne({ _id: req.params.id, user: new Types.ObjectId(req.user.id) });
      if(!transaction) {
        return res
          .status(404)
          .json({
            msg: "User have no transaction matching the provided id"
          });
      }
      const { coin, data_from_payment_service } = transaction;

      const wallet = await Wallet.findOne({ user: new Types.ObjectId(req.user.id), coin: coin });
      if(!wallet) {
        return res
          .status(404)
          .json({
            msg: `User have no ${coin} wallet on our platform`
          });
      }

      if(transaction.status === Transaction_Status.successful || transaction.status === Transaction_Status.failed) {
        return res
          .status(400)
          .json({
            msg: `Transaction already resolved. Status: ${transaction.status}`
          });
      }

      if(transaction.status === Transaction_Status.pending) {
        const statusAmount = await get_transaction_status.getDepositStatus(coin, data_from_payment_service, "PENDING");
        transaction.status = statusAmount ? ( statusAmount === "PENDING" ? "PENDING": Transaction_Status.successful ) : Transaction_Status.failed;
        let prs = [transaction.save()];
        if(statusAmount && statusAmount !== "PENDING") {
          // update wallet
          wallet.wallet_breakdown.available += statusAmount;
          wallet.wallet_breakdown.total += statusAmount;
          transaction.transaction_breakdown.amount = statusAmount;
          transaction.transaction_breakdown.total_amount = statusAmount;
          prs.push(wallet.save());
        }

        const resTransaction = await Connection.transaction(async () => {
          const updatedTransaction = await Promise.all(prs);
          return updatedTransaction instanceof Array? updatedTransaction[0] : updatedTransaction;
        });

        return res
          .status(201)
          .json({
            msg: `Transaction ${resTransaction.status}`,
            transactionId: resTransaction._id
          });
      }
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async convertFromUsd(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string() 
          .valid(...Object.values(Coin))
          .required(),
        amount: Joi
          .number()
          .precision(2)
          .required(),
      });

      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { coin, amount } = value;
      let usdValue;

      if (coin === "ETH") {
        // Get ETHUSD value
        const response = await axios.get(`https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${process.env.ETHERSCAN_API_KEY}`);
        if (response.status != 200 || response.data.result.ethusd === undefined) {
            throw new Error(`${response.data.message} or Eth|Usd data not found`);
        };

        usdValue = response.data.result.ethusd;
      } else if (coin === "BNB") {
        // Get BNBUSD value
        const response = await axios.get(`https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=${process.env.BSCAN_API_KEY}`);
        if (response.status != 200 || response.data.result.ethusd === undefined) {
            throw new Error(`${response.data.message} or Eth|Usd data not found`);
        };

        usdValue = response.data.result.ethusd;
      } else {
        // Get MATICUSD value
        const response = await axios.get(`https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=${process.env.POLYSCAN_API_KEY}`);
        if (response.status != 200 || response.data.result.maticusd === undefined) {
            throw new Error(`${response.data.message} or Matic|Usd data not found`);
        };

        usdValue = response.data.result.maticusd;
      };

      return res
        .status(200)
        .json({
          msg: `Amount in ${coin}`,
          data: amount / usdValue
        });

    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        logger.error(error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }
}
  
module.exports = UserController;
