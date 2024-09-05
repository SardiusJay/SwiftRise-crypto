const { Schema } = require('mongoose');
const { Role, Gender, Collections, Note_Status, Qs, userStatus } = require('../../enum_ish');


const questionSchema = new Schema({
  answer: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    enum: Object.values(Qs),
    required: true,
  },
});

const subjectSchema = new Schema({
  subject: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  doc_type: {
    type: String,
    enum: Object.values(Collections),
    required: true,
  },
});

const notificationSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  subject: {
    type: subjectSchema,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(Note_Status),
    default: Note_Status.sent,
  },
}, { timestamps: true });

const userSchema = new Schema({
  name: { 
    type: {
      fname: { type: String, required: true, min: 3, max: 20 },
      lname: { type: String, required: true, min: 3, max: 20 },
      aka: { type: String, min: 3, max: 20},
    },
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.user,
  },
  gender: {
    type: String,
    enum: Object.values(Gender),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(userStatus),
    required: true,
  },
  q_and_a: {
    type: questionSchema,
    required: true,
  },
  notifications: {
    type: [notificationSchema],
    default: [],
  },
  resetPassword: { 
    type: {
      passwordToken: { type: String, required: true},
      passwordTokenExpires: { type: Date, required: true },
    },
    default: null,
  },
  jwt_refresh_token: String,
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if((this.notifications) && (this.notifications.length >= 15)) {
    this.notifications.shift();
  }
  next();
});

module.exports = { userSchema, subjectSchema, notificationSchema };
