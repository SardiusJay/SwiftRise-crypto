const { Schema } = require('mongoose');
const { Coin } = require('../../enum_ish');


const contractSchema = new Schema({
  coin: {
    type: String,
    enum: Object.values(Coin),
    required: true,
  },
  abi: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = { contractSchema };
