const { storage, Connection, User, Email } = require('../models/engine/db_storage')
const util = require('../util');
const { jwt_service } = require('../services/jwt_service');
const { miner_service } = require('../services/miner/miner_service');
const mail_service = require('../services/mail_service');
const Joi = require('joi');
const crypto = require('crypto');
const jwt_web = require('jsonwebtoken');
const { logger } = require('../logger');
const { Role, Gender, Qs, userStatus, emailType } = require('../enum_ish');
const mongoose = require('mongoose');
const MongooseError = mongoose.Error;
/**
 * Contains the AppController class 
 * which defines route handlers.
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */

class AppController {
  static async home(req, res) {
    res.status(200).json({ msg: 'Welcome To SwiftRise Api!' });
  }

  /**
   * Register a user.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a promise that resolves to the response object
   */
  static async register_user(req, res) {
    try {
      const schema = Joi.object({
        fname: Joi
          .string()
          .required(),
        lname: Joi
          .string()
          .required(),
        gender: Joi
          .string()
          .valid(...Object.values(Gender))
          .required(),
        phone: Joi
          .string()
          .required()
          .pattern(/^[8792][01]\d{8}$/),
        dob: Joi
          .date()
          .required(),
        q_and_a: Joi
          .object({
            question: Joi
              .string()
              .valid(...Object.values(Qs))
              .required(),
            answer: Joi
              .string()
              .required()
          })
          .required(),
        email: Joi
          .string()
          .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
          .required(),
        password: Joi
          .string()
          .required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
      });

    // validate body
    const { value, error } = schema.validate(req.body);
    
    if (error) {
      throw error;
    }

    const minDOB = new Date();
    minDOB.setFullYear(minDOB.getFullYear() - 14);
    if (value.dob > minDOB) {
      return res
        .status(400)
        .json({ msg: 'You are underage, go and play' });
    }
    // check email and phone integrity
    const integrity_task = Promise.all([
      User.exists({ email: value.email }),
      User.exists({ phone: value.phone })
    ]);
    const resolves = await integrity_task;

    // handle integrity
    if (resolves[0] || resolves[1]) {
      if (resolves[0]) { return res.status(400).json({ msg: 'Email exists'}); }
      if (resolves[1]) { return res.status(400).json({ msg: 'Phone exists'}); }
    }
    
   
    // create user
    const user = {
      name: {
        fname: value.fname,
        lname: value.lname
      },
      email: value.email,
      phone: value.phone,
      gender: value.gender,
      role: Role.user,
      q_and_a: value.q_and_a,
      dob: value.dob,
      status: userStatus.active
    };

    // encrypt pwd and a of q_and_a
    const pwd_pr = util.encrypt(value.password);
    const a_pr = util.encrypt(value?.q_and_a?.answer);

    const [pwd, a] = await Promise.all([pwd_pr, a_pr]);

    user.password = pwd;
    user.q_and_a.answer = a;
    
    const resolved_user =  await Connection.transaction(async () => {
      const resoled_u = await User.create(user);
      await Email.create({
        email: resoled_u.email,
        email_type: emailType.welcome,
        content: {
          name: {
            fname: user.name.fname,
            lname: user.name.lname,
          },
        }
      });
      return resoled_u
    });

    
    return res
      .status(201)
      .json({
        user: {
          email: resolved_user.email,
          phone: resolved_user.phone,
          status: userStatus.active
        }
      });
    } catch (error) {

      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res.status(400).json({
          msg: 'Invalid request body',
          errors: error.details,
        });
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Login function that handles the login process for users.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a promise that resolves to the response sent to the client
   */
  static async login(req, res) {
    try {
      const schema = Joi.object({
        email_or_phone: Joi
          .string()
          .required(),
        password: Joi
          .string()
          .required(),
      });
    
      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      let query = {}

      // validate email/phone
      if (/^\d+$/.test(value.email_or_phone)) {
        query = User.findOne({ phone: value.email_or_phone });
      } else {
        query = User.findOne({ email: value.email_or_phone });
      }

      // validate user
      const user = await query.exec();
      if (!user) {
        return res
          .status(400)
          .json({
          msg: 'email/phone or password or answer incorrect',
        });
      }

      if([userStatus.deactivated, userStatus.deleted, userStatus.disabled].includes(user.status)) {
        /**
         * Resolves the status and returns the corresponding API endpoint.
         *
         * @param {string} status - the status to be resolved
         * @return {string|boolean} the corresponding API endpoint or false if deleted or disabled
         */
        const resolve = (status) => {
          let resolve = false;
          if(status === userStatus.deactivated) {
            resolve = '/api/v1/general/forget-password';
          }

          return resolve;
        };
        
        return res
          .status(400)
          .json({
          msg: `Account ${user.status}`,
          resolve: resolve(user.status),
        });
      }
      
      // validate password
      const is_pwd = await util.validate_encryption(value.password, user.password);

      // validate password
      if (is_pwd === false) {
        return res
          .status(400)
          .json({
          msg: 'email/phone or password incorrect',
        });
      }

      const tokens = await jwt_service.generate_token({
        role: user.role,
        id: user._id.toString(),
        gender: user.gender,
        status: user.status
      });

      
      user.jwt_refresh_token = tokens.refreshToken;

      // update user
      await Promise.all([
        user.save(),
        miner_service.update_user_investment_payments(user._id),
      ]);

      return res
        .status(201)
        .json({
          msg: 'Login succesful',
          user: {
            _id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
          tokens: tokens,
        });
      
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            msg: error.details,
          });
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

/**
 * Refreshes the access token for a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The response containing the new access token and user information.
 */
  static async refreshToken(req, res) {
    try {
      const schema = Joi.object({
        refresh_token: Joi
          .string()
          .required(),
        user_id: Joi
          .string()
          .required(),
      });
    
      // validate body
      const { value, error } = schema.validate(req.body);
      
      if (error) {
        throw error;
      }

      const blacklisted = await storage.get_jwt(value.refresh_token);
      if(blacklisted) {
        return res
          .status(400)
          .json({
            msg: 'Invalid Credential, Refresh token invalid',
          });
      }

      const user = await User.findById(value.user_id, 'jwt_refresh_token email _id role gender').exec();
      // validate user
      if (!user) {
        return res
          .status(404)
          .json({
            msg: 'User does not exist',
          });
      }

      // validate refresh user's refresh_token
      if(user.jwt_refresh_token !== value.refresh_token) {
        return res
          .status(400)
          .json({
            msg: 'Invalid Credential, Refresh token invalid',
          });
      }

      // validate refresh_token
      jwt_web.verify(value.refresh_token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res
            .status(401)
            .json({
              msg: 'Refresh Token expired, user should login again',
              second_chance: false
            });
        }
      });

      // refresh access token
      const newAccessToken = await jwt_service.generate_token({
        role: user.role,
        id: user._id,
        gender: user.gender
      }, true);

      return res
        .status(200)
        .json({
          msg: 'Token refresh successful',
          user: {
            _id: user._id,
          },
          new_token: newAccessToken,
        });
      
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request body',
            errors: error.details,
          });
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Logout function that handles logging out a user.
   *
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @return {Object} The response with the logged out message.
   */
  static async logout(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Extract the token part
      const user = await User.findById(req.user.id).exec();
      const timestamp = new Date().toISOString();
      
      const jwt = {
        token: token,
        user: user._id.toString(),
        created_on: timestamp,
      };

      // blacklist jwt
      await storage.blacklist_jwt(jwt);

      // reset refresh token
      user.refresh_token = '';

      await user.save();
    
      return res
        .status(200)
        .json({
          msg: 'Logged out succesfully',
        });
      
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Asynchronously handles the forget password functionality.
   *
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @return {Object} The HTTP response object.
   */
  static async forget_pwd(req, res) {
    try {
      const schema = Joi.object({
        email: Joi
          .string()
          .email()
          .required(),
        front_url: Joi
          .string()
          .required()
      });
    
      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      // validate user
      const user = await User.findOne({ email: value.email });
      if(!user) {
        return res
          .status(404)
          .json({
            msg: 'Email does not exist',
          });
      }

      const token = crypto.randomBytes(20).toString('hex');
      const tokenexp = new Date(Date.now() + 1800000); // 30mins
      const reset_link = `${value.front_url}/${token}`;

      await Connection.transaction(async () => {
        user.resetPassword = {
          passwordToken: token,
          passwordTokenExpires: tokenexp
        };
        
        try {
          const mail = Email.create({
            email: user.email,
            email_type: emailType.forget,
            content: {
              name: {
                fname: user.name.fname,
                lname: user.name.lname,
              },
              resetLink: reset_link
            }
          });

          await Promise.all([mail, user.save()]);
          logger.info('Email sent successfully');
        } catch (error) {
          logger.error('Error sending email', error.message);
          return res
            .status(500)
            .json({
              msg: 'Internal server error, error sending email',
            })
        }
      });

      return res
        .status(201)
        .json({
          msg: `Password reset link succesfully sent to ${value.email}`,
        })

    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({error: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            error: 'Invalid request body',
            errors: error.details,
          });
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Validates a reset password token.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a Promise that resolves with the validation result
   */
  static async validate_reset_pwd_token(req, res) {
    try {
      if(!req.params.token) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request, token is required',
          });
      }

      const { token } = req.params
      // checks if token has been blacklisted
      const blacklisted = await storage.get_reset_token(token);
      if(blacklisted) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request, token is blacklisted',
            valid: false
          });
      }

      // checks if token has expired
      const now = new Date();

      const user = await User.findOne({
        "resetPassword.passwordToken": token,
        "resetPassword.passwordTokenExpires": { $gt: now },
      });

      if(!user) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request, token has expired',
            valid: false
          });
      }

      return res
        .status(200)
        .json({
          msg: 'Token is valid',
          valid: true,
          token,
        });

    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({MessageChannel: error.message});
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }

  /**
   * Reset the user's password.
   *
   * @param {Object} req - the request object
   * @param {Object} res - the response object
   * @return {Promise} a Promise that resolves to the updated response object
   */
  static async reset_password(req, res) {
    try {
      const schema = Joi.object({
        new_pwd: Joi
          .string()
          .required()
          .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,}$/),
        token: Joi
          .string()
          .required(),
      });
    
      // validate body
      const { value, error } = schema.validate(req.body);
      if (error) {
        throw error;
      }

      const { token, new_pwd } = value
      // checks if token has been blacklisted
      const blacklisted = await storage.get_reset_token(token);
      if(blacklisted) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request, token is blacklisted',
          });
      }
      
      // checks if token has expired
      const now = new Date();

      const user = await User.findOne({
        "resetPassword.passwordToken": token,
        "resetPassword.passwordTokenExpires": { $gt: now },
      });

      // checks if token has expired
      if(!user) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request, token expired',
          });
      }

      user.password = await util.encrypt(new_pwd);
      if(user.status === userStatus.deactivated) {
        user.status = userStatus.active;
      }
      await Connection.transaction(async () => {
        // blacklists the token
        await Promise.all([storage.blacklist_reset_token(token), user.save()])
        logger.info('Password successfully updated');
      });

      return res
        .status(201)
        .json({
          msg: 'Password successfully updated',
        });
    } catch (error) {
      if (error instanceof MongooseError) {
        logger.error('We have a mongoose problem', error);
        return res.status(500).json({msg: error.message});
      }
      if (error instanceof Joi.ValidationError) {
        return res
          .status(400)
          .json({
            msg: 'Invalid request body',
            errors: error.details,
          });
      }
      logger.error(error);
      return res.status(500).json({msg: error.message});
    }
  }
}

module.exports = AppController;
