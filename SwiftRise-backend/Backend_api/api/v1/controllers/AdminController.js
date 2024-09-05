require('dotenv').config();
const util = require('../util');
const { 
  page_info, 
  User, 
  Transaction, 
  Connection, 
  Payment, 
  Wallet, 
  Investment,
  Contract,
  Email
} = require('../models/engine/db_storage');
const { notification_service } = require('../services/notification_service');
const { miner_service } = require('../services/miner/miner_service');
const MongooseError = require('mongoose').Error;
const { Types } = require('mongoose');
const JsonWebTokenErro = require('jsonwebtoken').JsonWebTokenError;
const Joi = require('joi');
const { logger } = require('../logger');
const { getEvents } = require('../services/getContractEvents');
const { get_transaction_status } = require('../services/getTransactionStatus');
const { 
  payment_service_eth, 
  payment_service_bnb, 
  payment_service_matic 
} = require('../services/payment_service');
const { 
  Transaction_Status, 
  Time_share,
  Investment_Status,
  Transaction_type,
  Coin,
  Time_Directory,
  Payment_status,
  Role,
  Gender,
  Collections,
  userStatus,
  emailType
 } = require('../enum_ish');
const mail_service = require('../services/mail_service');
/**
 * Contains the UserController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 * @author Eyang Daniel <https://github.com/Tediyang>
 */

class AdminController {
  /**
   * Handles the role switch for a user.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @return {Promise<object>} The updated user object.
   */
  static async role_switcheroo(req, res) {
    // only super-admins have access to this endpoint
    try {
      const schema = Joi.object({
        email: Joi
          .string()
          .required(),
        role: Joi
          .string()
          .valid(...Object.values(Role))
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const user = await User.findOne({ email: value.email });

      if(!user) {
        return res
          .status(404)
          .json({ msg: 'User does not exist'});
      }

      if(user.role === value.role) {
        return res
          .status(200)
          .json({
            message: `${value.email} has the Role: ${value.role} already`,
          })
      }

      user.role = value.role;

      // notify owner
      await Connection.transaction(async () => {
        const comment = `${user.name?.aka ? user.name.aka : user.name.fname + ' ' + user.name.lname} you are now ${[Role.user, Role.super_admin].includes(value.role) ? "a" : "an" } ${value.role} on this platform`;
        await user.save();
        await notification_service
          .notify({
            comment: comment,
            subject: {
              subject: user._id,
              doc_type: Collections.User
            }
          }, user);
      });
      
      return res
        .status(201)
        .json({
          msg: 'Role succesfully updated',
          user: user,
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
       logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
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
   * Retrieves users based on the provided filter criteria.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise} The promise that resolves to the response object.
   */
  static async get_users(req, res) {
    try {
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            name: Joi
              .object({
                fname: Joi
                  .string(),
                lname: Joi
                  .string(),
                aka: Joi
                  .string(),
              }), 
            dob: Joi
              .date(),
            role: Joi
              .string()
              .valid(...Object.values(Role)),
            status: Joi
              .string()
              .valid(...Object.values(userStatus)),
            gender: Joi
              .string()
              .valid(...Object.values(Gender)),
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

      // building filter
      const { filter } = value;
      let query = {};
      const { name, dob, role, createdAt, gender, status } = filter;

      if(name) {
        const { fname, lname, aka } = name;
        let hold_name = {};
        if(fname) { query['name.fname'] = fname }
        if(lname) { query['name.lname'] = lname }
        if(aka) { query['name.aka'] = aka }

      }

      if(dob) {
        query.dob = dob;
      }

      if(role) {
        query.role = role;
      }

      if(status) {
        query.status = status;
      }

      if(gender) {
        query.gender = gender;
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
      if (value.count) {
        const count = await User
            .countDocuments(query);
        return res
          .status(200)
          .json({
            count: count,
          });
      }

      const { haveNextPage, currentPageExists, totalPages } = await page_info(query, Collections.User, value.size, value.page);

      let gather_data = [];

      if(currentPageExists) {
        const users = await User
          .find(query)
          .skip((value.page - 1) * value.size)
          .limit(value.size)
          .sort({ createdAt: -1 })
          .exec(); //get orders

        gather_data = [
          users,
          haveNextPage, //have next page
          totalPages, //total pages
        ];
      }

      if(!currentPageExists) {
        gather_data = [
          [],
          haveNextPage, //have next page
          totalPages, //total pages
        ];
      }

      return res
        .status(200)
        .json({
          users: gather_data[0],
          have_next_page: gather_data[1],
          total_pages: gather_data[2]
        });
        
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
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
   * Find a user based on the provided request and response objects.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise} A promise that resolves to the user object.
   */
  static async find_user(req, res) {
    try {
      const schema = Joi.object({
        phone: Joi
          .string()
          .pattern(/^[8792][01]\d{8}$/),
        email: Joi
          .string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      if(Object.values(value).length === 0) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request, email or phone required'
          })
      }

      const { phone, email } = value;
      let user = null;
      if(phone) {
        user = await User
          .findOne({ phone: phone })
          .exec();
      } else if(email) {
        user = await User
          .findOne({ email: email })
          .exec();
      }

      if(!user) {
        return res
          .status(404)
          .json({
            msg: 'User not found'
          })
      }

      return res
        .status(200)
        .json({
          user,
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async search_user(req, res) {
    try {
      const schema = Joi.object({
        search: Joi
          .string()
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const regexPattern = new RegExp(`.*${value.search}.*`, 'i');

      const users = await User
        .find({ 
          $or: [
            { 'name.fname': { $regex: regexPattern } },
            { 'name.lname': { $regex: regexPattern } },
            { 'name.aka': { $regex: regexPattern } },
            { email: { $regex: regexPattern } },
            { phone: { $regex: regexPattern } },
          ]
         }).select('name email phone _id');

      return res
        .status(200)
        .json({
          users: users,
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
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
   * Asynchronously disables a user account.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} response object with status and message
   */
  static async disable_account(req, res) {
    try {
      const schema = Joi.object({
        password: Joi
          .string()
          .required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
        user_id: Joi
          .string()
          .required(),
        reason: Joi
          .string()
          .required()
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { password, user_id, reason } = value;

      const [admin, user] = await Promise.all([
        User.findById(req.user.id).exec(),
        User.findById(user_id).exec()
      ]);

      const is_pwd = await util.validate_encryption(password, admin.password);
      // validate admin password
      if(is_pwd === false) {
        return res
          .status(400)
          .json({ msg: 'Invalid Request, incorrect password'});
      }

      // validates user
      if(!user) {
        return res
          .status(404)
          .json({ msg: 'Invalid Request, user does not exist'});
      }

      // if user is already deactivated
      if(user.status === userStatus.disabled) {
        return res
          .status(400)
          .json({ msg: 'Invalid Request, user already disabled'});
      }

      // deactivate
      user.status = userStatus.disabled;
      // reset refresh token
      user.jwt_refresh_token = '';
      // save
      await Connection.transaction(async () => {
        const mail = Email.create({
          email: user.email,
          email_type: emailType.disable,
          content: {
            name: {
              fname: user.name.fname,
              lname: user.name.lname,
            },
            reason: reason
          }
        });

        await Promise.all([
          user.save(),
          mail
        ]);
      })

      return res
        .status(200)
        .json({ msg: 'User disabled successfully'});
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof JsonWebTokenErro) {
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
   * Registers a miner.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Promise} A Promise that resolves with the registered miner details.
   */
  static async register_miner(req, res) {
    try {
      const schema = Joi.object({
        name: Joi
          .string()
          .required(),
        capitals: Joi
          .array()
          .items(Joi.number().integer().precision(2))
          .required()
      });

      // validate body
      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { name, capitals } = value;

      await miner_service.register_miner({
        name,
        capitals
      });

      return res
        .status(200)
        .json({
          msg: `${name} Miner registered successfully`,
          name,
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
   * Retrieves investments based on the provided filters.
   *
   * @param {object} req - the request object
   * @param {object} res - the response object
   * @return {Promise} returns a promise resolving to the filtered investments
   */
  static async get_investments(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            investor: Joi
              .string(),
            coin: Joi
              .string()
              .valid(...Object.values(Coin)),
            miner: Joi
              .string(),
            status: Joi
              .string()
              .valid(...Object.values(Investment_Status)),
            wallet: Joi
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
        investor,
        coin,
        miner,
        status,
        wallet,
        createdAt,
       } = filter;

      if(investor) {
        query.investor = new Types.ObjectId(investor);
      }

      if(wallet) {
        query.wallet = new Types.ObjectId(wallet);
      }

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

      let data = [];

      if(currentPageExists) {
        data = await Investment
          .find(query)
          .skip((page - 1) * size)
          .limit(size)
          .sort({ createdAt: -1 })
          .exec(); //get investments
      }

      return res
        .status(200)
        .json({
          investments: data,
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
   * Retrieves wallets based on the provided filter criteria.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Object} the wallets that match the filter criteria
   */
  static async get_wallets(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            user: Joi
              .string(),
            coin: Joi
              .string()
              .valid(...Object.values(Coin)),
            address: Joi
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
        user, 
        coin, 
        address,
        createdAt,
       } = filter;

      if(user) {
        query.user = new Types.ObjectId(user);
      }

      if(coin) {
        query.coin = coin;
      }

      if(address) {
        query.address = address;
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
        const result = await Wallet
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
       } = await page_info(query, Collections.Wallet, size, page);

      let data = [];

      if(currentPageExists) {
        data = await Wallet
          .find(query)
          .skip((page - 1) * size)
          .limit(size)
          .sort({ createdAt: -1 })
          .exec(); //get wallets
      }

      return res
        .status(200)
        .json({
          wallets: data,
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
   * Retrieves transactions based on the provided filters.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a Promise that resolves to the retrieved transactions
   */
  static async get_transactions(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            user: Joi
              .string(),
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
        user, 
        coin,
        type,
        status,
        credit_wallet,
        debit_wallet,
        createdAt,
       } = filter;

      if(user) {
        query.user = new Types.ObjectId(user);
      }

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
   * Retrieves payments based on the provided request parameters.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} The payments matching the provided parameters.
   */
  static async get_payments(req, res) {
    try {
      // validate body
      const schema = Joi.object({
        count: Joi
          .boolean()
          .default(false),
        filter: Joi
          .object({
            user: Joi
              .string(),
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
        user,
        miner,
        createdAt,
        coin,
        status
       } = filter;

      if(user) {
        query.user = new Types.ObjectId(user);
      }
    
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

      let data = [];

      if(currentPageExists) {
        data = await Payment
          .find(query)
          .skip((page - 1) * size)
          .limit(size)
          .sort({ createdAt: -1 })
          .exec(); //get payments
      }

      return res
        .status(200)
        .json({
          payments: data,
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

  static async settleFundingDispute(req, res) {
    try {
      const schema = Joi.object({
        email: Joi
          .string()
          .required(),
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
        address: Joi
          .string()
          .required(),
        event: Joi
          .number()
          .default(0)
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { coin, email, address, event } = value;
      const user = await User.findOne({ email: email });
      if(!user) {
        return res
          .status(404)
          .json({
            msg: `User with Email: ${email} does not exist`
          });
      }
      let wallet = await Wallet
        .findOne({ user: user._id, coin: coin });

      if(!wallet) {
        return res
          .status(404)
          .json({
            msg: `User have no ${coin} wallet on our platform`
          });
      }

      const result = await getEvents.getUserFundedEvent(coin, address, event);
      if(!result) {
        return res
          .status(400)
          .json({
            msg: `user does not have such transaction on ${coin} blockchain`
          });
      }

      const [transaction, status] = await Promise.all([
        Transaction
          .findOne({ data_from_payment_service: result.transactionHash, user: user._id, coin: coin }),
        get_transaction_status.getStatus(coin, result.transactionHash)
      ]);

      if(!transaction) {
        const resTransaction = await Connection.transaction(async () => {
          const newTransaction = await Transaction.create({
            user: user,
            transaction_breakdown: {
              total_amount: result.amount,
              amount: result.amount,
              charges: 0
            },
            coin: coin,
            status: status ? Transaction_Status.successful : Transaction_Status.failed,
            data_from_payment_service: result.transactionHash,
            credit_wallet: "APP",
            debit_wallet: address,
            type: Transaction_type.debit
          });
  
          if(status) {
            // update wallet
            wallet.wallet_breakdown.available += result.amount;
            wallet.wallet_breakdown.total += result.amount;
            await wallet.save();
          }

          return newTransaction;
        });

        return res
          .status(201)
          .json({
            msg: `Transaction ${resTransaction.status}`,
            transactionId: resTransaction._id
          });
      }

      if(transaction.status === Transaction_Status.successful) {
        return res
          .status(400)
          .json({
            msg: "Transaction has already been settled"
          });
      }

      if(transaction.status === Transaction_Status.pending) {
        transaction.status = status ? Transaction_Status.successful : Transaction_Status.failed;
        let prs = [transaction];
        if(status) {
          // update wallet
          wallet.wallet_breakdown.available += transaction.transaction_breakdown.amount;
          wallet.wallet_breakdown.total += transaction.transaction_breakdown.amount;
          prs.push(wallet.save());
        }

        const resTransaction = await Connection.transaction(async () => {
          const [updatedTransaction, updatedWallet] = Promise.all(prs);
          return updatedTransaction;
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
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error.message);
      return res.status(500).json({msg: error.message});
    }
  }

  static async settleAppWithdrawDispute(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
        event: Joi
          .number()
          .default(0)
      });

      // validate body
      const { value, error } = schema.validate(req.body);

      if (error) {
        throw error;
      }

      const { coin, event } = value;
      const superAdmin = await User.findOne({ _id: new Types.ObjectId(req.user.id) });

      const result = await getEvents.getWithdrawalEvent(coin, event);
      if(!result) {
        return res
          .status(404)
          .json({
            msg: "No such transaction exists on the blockchain"
          });
      }

      const [transaction, status] = await Promise.all([
        Transaction
          .findOne({ data_from_payment_service: result.transactionHash, coin: coin }),
        get_transaction_status.getStatus(coin, result.transactionHash)
      ]);
      if(!transaction) {
        const newTransaction = await Transaction.create({
          user: superAdmin,
          transaction_breakdown: {
            total_amount: result.beforeAmount,
            amount: result.beforeAmount,
            charges: 0
          },
          coin: coin,
          status: status ? Transaction_Status.successful : Transaction_Status.failed,
          data_from_payment_service: result.transactionHash,
          credit_wallet: "APP",
          debit_wallet: "APP",
          type: Transaction_type.debit
        });

        return res
          .status(201)
          .json({
            msg: `Transaction ${newTransaction.status}`,
            transactionId: newTransaction._id
          });
      }

      if(transaction.status === Transaction_Status.successful) {
        return res
          .status(400)
          .json({
            msg: "Transaction has already been settled"
          });
      }

      if(transaction.status === Transaction_Status.pending) {
        transaction.status = status ? Transaction_Status.successful : Transaction_Status.failed;
        await transaction.save();

        return res
          .status(201)
          .json({
            msg: `Transaction ${transaction.status}`,
            transactionId: transaction._id
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
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  static async appWithdraw(req, res) {
    try {
      if(!Object.values(Coin).includes(req.params.coin)) {
        return res
          .status(400)
          .json({
            msg: "Invalid coin"
          });
      }
      const superAdmin = new Types.ObjectId(req.user.id)

      let receipt = null;
      try {
        if(req.params.coin === Coin.eth) {
          receipt = await payment_service_eth.withdraw();
        }
        if(req.params.coin === Coin.bnb) {
          receipt = await payment_service_bnb.withdraw();
        }
        if(req.params.coin === Coin.matic) {
          receipt = await payment_service_matic.withdraw();
        }
      } catch (error) {
        logger.error('Transaction failed', receipt.error);
        throw new Error('Transaction failed');
      }

      if (receipt.status !== 1 && receipt.status !== 0) {
        logger.error('Transaction failed', receipt.error);
        throw new Error('Transaction failed');
      }

      const { hash, status } = receipt;
      const transaction = await Transaction.create({
        user: superAdmin,
        transaction_breakdown: {
          total_amount: 0,
          amount: 0,
          charges: 0
        },
        coin: req.params.coin,
        debit_wallet: "APP",
        credit_wallet: "APP",
        type: Transaction_type.debit,
        data_from_payment_service: hash,
        status: status == 1 ? Transaction_Status.successful : Transaction_Status.failed
      });

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

  static async updateContract(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .required(),
        abi: Joi
          .string()
          .required(),
        address: Joi
          .string()
          .required(),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { coin, address, abi } = value;

      const contract = await Contract.findOne({ coin: coin });

      if(!contract) {
        return res
          .status(404)
          .json({
            msg: `We dont have a ${coin} contract`
          });
      }
      contract.abi = abi;
      contract.address = address;
      await contract.save();

      return res
        .status(200)
        .json({
          msg: `${coin} Contract updated successfully`
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

  static async getContract(req, res) {
    try {
      const schema = Joi.object({
        coin: Joi
          .string()
          .valid(...Object.values(Coin))
          .default(Coin.eth),
        all: Joi
          .boolean()
          .default(false),
      });

      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const { coin, all } = value;
      if(all) {
        const contracts = await Contract.find({});

        if(contracts.length === 0) {
          return res
            .status(404)
            .json({
              msg: "We have no contracts"
            });
        }

        return res
          .status(200)
          .json({
            contracts: contracts
          });
      } else {
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
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({msg: error.message});
      }

      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }
}

module.exports = AdminController;
