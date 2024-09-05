const { Schema, Types } = require('mongoose');
const { Collections, Investment_Status, Coin } = require('../../enum_ish');

const investmentBreakdownSchema = new Schema({
  capital: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
  interest: {
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
  }
});

const InvestmentSchema = new Schema({
  investor: {
    type: Types.ObjectId,
    ref: Collections.User,
    required: true,
  },
  wallet: {
    type: Types.ObjectId,
    ref: Collections.Wallet,
    required: true,
  },
  miner: {
    type: String,
    required: true,
  },
  coin: {
    type: String,
    enum: Object.values(Coin),
    required: true,
  },
  last_interest_payment_index: {
    type: Number,
    default: null,
  },
  investment_breakdown: {
    type: investmentBreakdownSchema,
    required: true,
  },
  payments: {
    type: [{ type: Types.ObjectId, ref: Collections.Payment }],
    default: [],
  },
  status: {
    type: String,
    enum: Object.values(Investment_Status),
    default: Investment_Status.active,
  },
  maturity_date: {
    type: Date,
    default: null,
  }
}, { timestamps: true });


module.exports = { InvestmentSchema };
