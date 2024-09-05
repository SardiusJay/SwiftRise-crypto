const { Schema } = require('mongoose');
const { Collections, Payment_status, Coin } = require('../../enum_ish');


const paymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: Collections.User,
    required: true,
  },
  miner: {
    type: String,
    required: true,
  },
  wallet: {
    type: Schema.Types.ObjectId,
    ref: Collections.Wallet,
    required: true,
  },
  investment: {
    type: Schema.Types.ObjectId,
    ref: Collections.Investment,
    required: true,
  },
  coin: {
    type: String,
    enum: Object.values(Coin),
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    get: v => Math.round(v * 1000) / 1000,
    set: v => Math.round(v * 1000) / 1000
  },
  status: {
    type: String,
    enum: Object.values(Payment_status),
    default: Payment_status.on_queue,
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = { paymentSchema };
