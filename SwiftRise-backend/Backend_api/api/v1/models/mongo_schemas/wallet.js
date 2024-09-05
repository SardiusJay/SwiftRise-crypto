const { Schema } = require('mongoose');
const { Collections, Coin, Wallet_where, Action, Wallet_availableBalance_specification } = require('../../enum_ish');

const walletBreakdownSchema = new Schema({
  holdings: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
  total: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
  available: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
}, { timestamps: true });

const walletSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: Collections.User,
    required: true,
  },
  coin: {
    type: String,
    enum: Object.values(Coin),
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  wallet_breakdown: {
    type: walletBreakdownSchema,
    required: true,
  },
  investments: {
    type: [{ type: Schema.Types.ObjectId, ref: Collections.Investment }],
    default: [],
  },
  
}, { timestamps: true });


/**
 * Calculates the breakdown of the wallet based on the provided payload and wallet object.
 *
 * @param {Object} payload - The payload containing the amount, where, action, and available_balance_spec.
 * @param {Object} wallet - The wallet object to be updated.
 * @return {Promise<Object>} - The updated wallet object.
 */
const walletBreakdown_calc = async (payload, wallet) => {
  try {
    const { amount, where, action } = payload;
    let { available_balance_spec } = payload;

    if(!available_balance_spec) {
      available_balance_spec = '';
    }

    // validates where and action
    if(Object.values(Wallet_where).includes(where) && Object.values(Action).includes(action)) {
      // updates wallet breakdown based on where and action
      switch(where) {
        case Wallet_where.holdings:
          if(action === Action.add) {
            wallet.wallet_breakdown.holdings += amount;
            wallet.wallet_breakdown.available -= amount;
          }
          if(action === Action.subtract) {
            wallet.wallet_breakdown.holdings -= amount;
            wallet.wallet_breakdown.available += amount;
          }
          break;
        case Wallet_where.available:
          if(action === Action.add) {
            wallet.wallet_breakdown.available += amount;
            if(available_balance_spec === Wallet_availableBalance_specification.investment_wallet) {
              wallet.wallet_breakdown.holdings -= amount;
            }
          }
          if(action === Action.subtract) {
            wallet.wallet_breakdown.available -= amount;
            if(available_balance_spec === Wallet_availableBalance_specification.investment_wallet) {
              wallet.wallet_breakdown.holdings += amount;
            }
          }
          break;
      }

      const { wallet_breakdown } = wallet;
      const { holdings, available } = wallet_breakdown;

      // balance the wallet
      wallet.wallet_breakdown.total = holdings + available;
      wallet = await wallet.save();
      return wallet;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = { walletSchema, walletBreakdown_calc };
