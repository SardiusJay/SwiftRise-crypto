/**
 * Contains the MinerService class
 * handles all miner operations
 * @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
 */
const fs = require('fs').promises;
const path = require('path');
const { Payment, Investment, Connection, Wallet } = require('../../models/engine/db_storage');
const { walletBreakdown_calc } = require('../../models/mongo_schemas/wallet');
const { notification_service } = require('../notification_service');
const { 
  Investment_Status, 
  Payment_status, 
  Collections, 
  Wallet_where, 
  Action, 
  Time_share,
  Wallet_availableBalance_specification
} = require('../../enum_ish');
const { logger } = require('../../logger');
const { Types } = require('mongoose');
require('dotenv').config();

class MinerService {
  /**
   * Constructor for the class.
   *
   * @constructor
   */
  constructor() {
    try {
      this._miner_file = path.join(__dirname, 'miners.json');
      this._duration_in_months = 4;
      this._total_interest_rate = 22;
      this._number_of_payments = 8;
      this._biWeekly_interest_rate = this._total_interest_rate / this._number_of_payments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate the comment for the bi-weekly interest payment.
   *
   * @param {type} index - payment index
   * @param {type} miner - miner name
   * @return {string} - The generated comment.
   */
  get_biWeekly_payment_comment(index, miner) {
    try {
      return `Your ${(index + 1)+this.asign_position_suffix(index)} payment from ${miner} is ready!`;
    } catch (error) {
      throw error;
    }
  }

/**
 * Generates a comment for the given function body in a markdown code block with the correct language syntax.
 *
 * @param {Object} payload - The payload for the function.
 * @param {number} payload.amount - The amount of the investment.
 * @param {string} payload.miner - The miner for the investment.
 * @param {string} payload.status - The status of the investment.
 * @throws {Error} If the payload is invalid.
 * @return {string} The investment comment.
 */
  get_investment_comment(payload=null) {
    try {
      if(!payload) {
        throw new Error('Invalid payload');
      }
      const { amount, miner, status } = payload;
      return `Your investment of $${amount} with ${miner} is ${status}!`;
    } catch (error) {
      throw error;
    }
  }

   /**
  * Assigns a position suffix based on the given index.
  *
  * @param {number} index - The index to determine the position suffix for.
  * @returns {string} - The position suffix.
  * @throws {Error} - If the index is invalid.
  */
  asign_position_suffix(index) {
    try {
      if(index < 0) {
        throw new Error('Invalid index');
      }
      const position = index + 1;
      if (position === 1) {
        return 'st';
      } else if (position === 2) {
        return 'nd';
      } else if (position === 3) {
        return 'rd';
      } else {
        return 'th';
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registers a miner.
   *
   * @param {Object} minerObj - The miner object containing name and capitals.
   * @param {string} minerObj.name - The name of the miner.
   * @param {Array} minerObj.capitals - The capitals of the miner.
   * @returns {Object | null} result.data - The registered miner object.
   * @returns {string} result.msg - The registration message.
   * @throws {Error} If there is an error during the registration process.
   */
  async register_miner(minerObj) {
    try {
      const { name, capitals } = minerObj;
      if(!name || !capitals) {
        return {
          data: null,
          msg: 'name and capitals are required',
        }
      }
      // Read data from blacklist.json
      const data = await fs.readFile(this._miner_file, 'utf8');
      let jsonData;
      if (!data) {
        jsonData = {
          miners: [],
        };
      } else {
        jsonData = JSON.parse(data);
      }
  
      jsonData.miners.push({
        name,
        capitals,
      });
  
      const updatedData = JSON.stringify(jsonData, null, 2);
  
      await fs.writeFile(this._miner_file, updatedData, 'utf8');
  
      logger.info(`${name} miner registered successfully`);

      return {
        data: minerObj,
        msg: 'miner registered successfully',
      }
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a miner from the JSON file.
   *
   * @param {Object} miner - The miner object to search for. Default is null.
   * @param {string} miner.name - The name of the miner.
   * @param {Array} miner.capitals - The capital of the miner.
   * @return {Object} The miner object that matches the search criteria. Returns null if no match is found.
   * @throws {Error} If an error occurs while retrieving the miner.
   */
  async get_miner(miner=null) {
    try {
      const { name, capitals } = miner;
      const jsonData = await fs.readFile(this._miner_file, 'utf8');
      if (!jsonData) {
        return null;
      }

      if(name && capitals) {
        return JSON.parse(jsonData).miners.find((miner) => {
          return miner.name === name && capitals.every((cap) => miner.capitals.includes(cap));
        });
      }

      if(capitals && !name) {
        return JSON.parse(jsonData).miners.find((miner) => {
          return capitals.every((cap) => miner.capitals.includes(cap));
        });
      }

      if(!capitals && name) {
        return JSON.parse(jsonData).miners.find((miner) => {
          return miner.name === name;
        });
      }
    } catch (error) {
      throw error;
    }
  }

/**
 * Retrieves information about all miners.
 *
 * @param {Object} miner - an optional miner object
 * @return {Promise<Array>} an array containing information about all miners
 */
  async get_all_miners() {
    try {
      const jsonData = await fs.readFile(this._miner_file, 'utf8');
      if (!jsonData) {
        return null;
      }
      return JSON.parse(jsonData).miners;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculates the total interest based on the given capital.
   *
   * @param {number} capital - The capital amount.
   * @return {number} The total interest calculated.
   */
  get_total_payment(capital) {
    try {
      if(!capital) {
        return null;
      }
      return ((capital * this._total_interest_rate) / 100) + capital;
    } catch (error) {
      throw error;
    }
  }

  get_total_interest(capital) {
    try {
      if(!capital) {
        return null;
      }
      return (capital * this._total_interest_rate) / 100;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate the bi-weekly interest based on the given capital.
   *
   * @param {number} capital - the initial capital amount
   * @return {number} the calculated bi-weekly interest
   */
  get_bi_weekly_payment(capital) {
    try {
      if(!capital) {
        return null;
      }
      return this.get_total_payment(capital) / this._number_of_payments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * A function to make interest payments.
   *
   * @param {Object} payload - the payload for making interest payments
   * @param {boolean} backlog - whether the passed payload.payment_ids  is a backlog of payments
   * @return {Promise} a promise that resolves after making the interest payments
   */
  async make_payments(payload=null, backlog=false) {
    if(!payload) {
      return;
    }
    try {
      const { payment_ids, wallet } = payload;
      const payments = await Payment.find({ _id: { $in: payment_ids } });
      let total_payments = 0;
      let payments_data = [];
      let updated_payments = [];
      let updated_investment = null;
      let updated_wallet = null;
      let updated_flag = false;
      // get due payments and update their status
      const today = new Date();
      payments.map((payment) => {
        if((payment.status === Payment_status.on_queue) && (today >= payment.date) ) {
          payment.status = Payment_status.paid;
          total_payments += payment.amount;

          // collect needed payment data
          payments_data.push({
            _id: payment._id,
            index: payment.index,
            miner: payment.miner,
          });

          // start payment update task
          updated_payments.push(payment.save());

          if(!backlog) {
            const { investment } = payload;
            investment.last_interest_payment_index = payment.index > investment.last_interest_payment_index ? payment.index : investment.last_interest_payment_index;
            if((investment.last_interest_payment_index + 1) === this._number_of_payments) {
              // investment is completed
              investment.status = Investment_Status.completed;
            }
            updated_investment = investment;
          }

          updated_flag = true;
        }
      });

      if(updated_flag) {
        return await Connection.transaction(async () => {
          let gather_tasks = [...updated_payments];
  
          // notify user
          // if there is only one payment
          if(payments_data.length === 1) {
            const { index, miner, _id } = payments_data[0];
  
            // notify user
            await notification_service.notify({
              subject: {
                subject: _id,
                doc_type: Collections.Payment
              },
              comment: this.get_biWeekly_payment_comment(index, miner),
            }, payments[0].user);
          }
  
          // if there are multiple payments
          if(payments_data.length > 1) {
            // payments notifications
            await notification_service.batch_notes_to_user(
              payments_data.map((payment) => {
                const { index, miner, _id } = payment;
  
                return {
                  subject: {
                    subject: _id,
                    doc_type: Collections.Payment
                  },
                  comment: this.get_biWeekly_payment_comment(index, miner),
                };
              }), payments[0].user);
          }
  
          // start investment update task
          gather_tasks.push(updated_investment.save());

          if(!backlog) {
            if(updated_investment) {
              if(updated_investment.status === Investment_Status.completed) {
                // start investment notify task
                gather_tasks.push(notification_service.notify({
                  subject: {
                    subject: updated_investment._id,
                    doc_type: Collections.Investment
                  },
                  comment: this.get_investment_comment({ 
                    amount: updated_investment.investment_breakdown.capital, 
                    miner: updated_investment.miner,
                    status: Investment_Status.completed,
                  }),
                }, updated_investment.investor));
              }
            }
          }
  
          // update wallet
          updated_wallet = await walletBreakdown_calc({ 
            amount: total_payments, 
            where: Wallet_where.available, 
            action: Action.add,
            available_balance_spec: Wallet_availableBalance_specification.investment_wallet
           }, wallet);
  
          // complete all tasks
          await Promise.all(gather_tasks);
  
          if(!backlog) {
            return {
              wallet: updated_wallet,
              investment: updated_investment,
            };
          }
        });
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * A function to make interest payment.
   *
   * @param {Object} payment - the payment object
   * @param {Object} payload - the payload object
   * @return {Object} the updated payment object or null
   */
  async make_payment(payment=null, payload=null) {
    if((!payment) || (payment.status !== Payment_status.on_queue)) {
      return null;
    }
    try {
      let payment_data = null;
      let updated_payment = null;
      let payment_backlogs = null;
      const today = new Date();
      if(today >= payment.date) {
        let [investment, wallet] = payload ? [payload.investment, payload.wallet] : await Promise.all([
          Investment.findById(payment.investment),
          Wallet.findById(payment.wallet),
        ]);

        // if payload is null it checks if there is any backlogged payment and handles it
        // other wise it assumes there wont any backlogged payments
        if(!payload && (payment.index > 0)) {
          const startIndex = investment.last_interest_payment_index ? investment.last_interest_payment_index + 1: 0;
          let no_backlogged_payments = 0;
          if(investment.last_interest_payment_index) {
            // adding 1 to both sides solves the any zero problem and then we minus one to exclude the current payment
            no_backlogged_payments = ((payment.index + 1) - (investment.last_interest_payment_index + 1)) - 1;
          } else {
            // since we know payment.index > 0
            no_backlogged_payments = payment.index;
          }
          if(no_backlogged_payments > 0) {
            const backlogged_payment_ids = investment.payments
              .splice(startIndex,  no_backlogged_payments);

            // begin to tend to backloged payments
            payment_backlogs = this.make_payments({
              payment_ids: backlogged_payment_ids,
              wallet
            }, true);
          }
        }

        // collect needed payment data
        payment_data = {
          _id: payment._id,
          index: payment.index,
          miner: payment.miner,
        };

        // update payment
        payment.status = Payment_status.paid;
        updated_payment = payment.save();

        
        investment.last_interest_payment_index = payment.index;

        if((investment.last_interest_payment_index + 1) === this._number_of_payments) {
          // investment is completed
          investment.status = Investment_Status.completed;
        }

        // if their are backlogged payments
        if(payment_backlogs) {
          // tend to backlog
          await payment_backlogs;
        }

        // handles updating wallet, investment and payment
        const result = await Connection.transaction(async () => {
          // save updated payment
          updated_payment = await updated_payment;

          let gather_tasks = [];

          const { index, miner, _id } = payment_data;
          // notify user for interest payment
          gather_tasks.push(notification_service.notify({
            subject: {
              subject: _id,
              doc_type: Collections.Payment
            },
            comment: this.get_biWeekly_payment_comment(index, miner),
          }, investment.investor));

          // if the last interest payment is paid
          if(investment.status === Investment_Status.completed) {
            // start notify task
            await notification_service.notify({
              subject: {
                subject: investment._id,
                doc_type: Collections.Investment
              },
              comment: this.get_investment_comment({ 
                amount: investment.amount, 
                miner: investment.miner,
                status: Investment_Status.completed,
              }),
            }, investment.investor);
          }
          // update investment
          gather_tasks.push(investment.save());

          // update wallet
          gather_tasks.push(walletBreakdown_calc({
            amount: payment.amount, 
            where: Wallet_where.available, 
            action: Action.add,
            available_balance_spec: Wallet_availableBalance_specification.investment_wallet
           }, wallet));

          // complete all tasks
          const result = await Promise.all(gather_tasks);

          return {
            wallet: result[2],
            investment: result[1],
            payment: updated_payment
          };
        });

        return result;
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * A function to calculate and make bi-weekly interest payments for an investment.
   *
   * @param {object} investment - the investment object
   * @return {Promise} a Promise representing the result of the interest payment
   */
  async pay_biWeekly_payments(investment=null) {
    try {
      if(!investment) {
        return null;
      }

      if(!investment.investor) {
        investment = await Investment.findById(investment).populate('wallet');
      }

      const {
        wallet,
        status
      } = investment;

      // if investment is cancelled or completed
      if(
        ([Investment_Status.cancelled, Investment_Status.completed].includes(status)) || 
        ((investment.last_interest_payment_index) + 1 === investment.payments.length)
        ) {
        return investment;
      }

      const startIndex = investment.last_interest_payment_index ? investment.last_interest_payment_index + 1 : 0;
      const no_of_onQueue_payments = (investment.payments.length - startIndex);
      let payments_que = investment.last_interest_payment_index ? investment.payments.splice((startIndex, no_of_onQueue_payments)) : investment.payments;

      if(payments_que.length === 1) {
        if(payments_que[0].coin) {
          payments_que[0] = payments_que[0]._id;
        }
        return await this.make_payment(payments_que[0], { investment, wallet });
      }

      if(payments_que.length > 1) {
        payments_que = payments_que.map((payment) => {
          if(payment.coin) {
            payment = payment._id;
          }
          return payment;
        })
        // get due payments and update their status
        return await this.make_payments({ payment_ids: payments_que, wallet: wallet, investment: investment });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the user's investment payments asynchronously.
   *
   * @param {Object} payload - The payload containing the user ID.
   * @return {Promise} A promise that resolves when the update is complete.
   * @throws {Error} If there is an error during the update process.
   */
  async update_user_investment_payments(user_id_object=null) {
    try {
      // get all user's investments
      const investments = await Investment
        .find({ investor: user_id_object, status: Investment_Status.active })
        .populate('wallet');
      
      if(investments.length > 0) {
        if(investments.length === 1) {
          await this.pay_biWeekly_payments(investments[0]);
        } else {
          let gather_tasks = [];
          investments.map(async (investment) => {
            gather_tasks.push(this.pay_biWeekly_payments(investment));
          });
          await Promise.all(gather_tasks);
        }
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates multiple payments based on the given payload
   *
   * @param {Object} payload - The payload for creating payments.
   *    - {Object} wallet - The wallet object.
   *    - {Object} investment - The investment object.
   *    - {string} miner_name - The name of the miner.
   *    - {number} amount - The amount for each payment.
   * @return {Promise<Array>} - A promise that resolves to an array of created payments.
   * @throws {Error} - If there is an error creating the payments.
   */
  async create_payments(payload=null) {
    try {
      const { wallet, investment, miner_name, amount, created_at } = payload;

      let payments = [];
      let maturity = null;
      
      for (let index = 0; index < this._number_of_payments; index++) {
        // Calculate payment date
        const payment_date = new Date(created_at + ((index + 1) * Time_share.week * 2)); // paid every 2 weeks

        // create payments
        payments.push(Payment.create({
          date: payment_date,
          amount: this.get_bi_weekly_payment(amount),
          index,
          status: Payment_status.on_queue,
          investment: investment,
          miner: miner_name,
          wallet: wallet._id,
          user: wallet.user,
          coin: wallet.coin
        }));

        if(index === 7) {
          maturity = payment_date;
        }
      }

      return {
        payments: await Promise.all(payments),
        maturity
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invests a given capital into a miner.
   *
   * @param {Object} payload - The payload object containing the capital, miner_name, and wallet.
   * @param {number} payload.capital - The capital to be invested.
   * @param {string} payload.miner - The name of the miner.
   * @param {Object} payload.wallet - The wallet object.
   * @returns {Object} An object containing the investment data and a message.
   */
  async invest(payload=null) {
    try {
      const { capital, miner, wallet } = payload;

      // if miner does not accept capital
      if(miner.capitals.includes(capital) === false) {
        return {
          data: null,
          msg: `Miner only accepts $${miner.capitals.length > 1 ? miner.capitals.join(' and $'): miner.capitals[0]} capital`,
        }
      }

      const timestamp = new Date().getTime();
      const total_interest = this.get_total_interest(capital);

      // run a transaction on the db
      const investment = await Connection.transaction(async () => {
        let gather_tasks = [];

        // create investment
        gather_tasks.push(Investment.create({
          investment_breakdown: {
            capital,
            interest: total_interest,
            total: capital + total_interest,
          },
          miner: miner.name,
          investor: wallet.user,
          coin: wallet.coin,
          wallet: wallet._id,
        }));

        wallet.wallet_breakdown.available -= capital;
        wallet.wallet_breakdown.holdings += (capital + total_interest);
        wallet.wallet_breakdown.total = wallet.wallet_breakdown.holdings + wallet.wallet_breakdown.available;
        gather_tasks.push(wallet.save());

        // run things
        const [investment, updated_wallet] = await Promise.all(gather_tasks);

        // create investment payments
        const { payments, maturity } = await this.create_payments({
          wallet,
          investment: investment,
          miner_name: miner.name,
          amount: capital,
          created_at: timestamp,
        });
        
        // sorted in ascending order of the index
        investment.payments = payments.sort((a, b) => a.index - b.index);

        // set maturity
        investment.maturity_date = maturity;

        updated_wallet.investments.push(investment._id);
         // save investment and wallet
        await Promise.all([
          investment.save(),
          updated_wallet.save(),
        ])

        return investment;
      });

      return {
        data: investment,
      };

    } catch (error) {
      throw error;
    }
  }

}

const miner_service = new MinerService();

module.exports = { miner_service };
