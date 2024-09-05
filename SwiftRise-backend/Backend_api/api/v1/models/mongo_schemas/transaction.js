const { Schema } = require('mongoose');
const { Collections, Transaction_Status, Coin, Transaction_type } = require('../../enum_ish');

const transactionBreakdownSchema = new Schema({
  amount: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
  charges: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
  total_amount: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
});

const transactionSchema = new Schema({
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
  transaction_breakdown: {
    type: transactionBreakdownSchema,
    required: true,
  },
  credit_wallet: {
    type: String,
    required: true,
  },
  debit_wallet: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(Transaction_type),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(Transaction_Status),
    default: Transaction_Status.waiting_on_confirmation,
  },
  data_from_payment_service: {
    type: String,
    unique: true,
    default: null,
  },
}, { timestamps: true });

module.exports = { transactionSchema };
