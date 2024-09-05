const { Schema } = require('mongoose');
const { emailStatus, emailType } = require('../../enum_ish');

const emailSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(emailStatus),
    default: emailStatus.pending
  },
  email_type: {
    type: String,
    enum: Object.values(emailType),
    required: true
  },
  content: {
    type: {
      name : {
        type: {
          fname: { type: String, required: true, min: 3, max: 20 },
          lname: { type: String, required: true, min: 3, max: 20 },
        },
        required: true
      },
      reason: { type: String},
      resetLink: { type: String}
    },
    required: true,
  }
}, { timestamps: true });


module.exports = { emailSchema };
