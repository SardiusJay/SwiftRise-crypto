const Role = {
  user: 'USER',
  admin: 'ADMIN',
  super_admin: 'SUPER ADMIN',
};

const Gender = {
  male: "MALE",
  female: "FEMALE",
  other: "OTHER",
};

const Note_Status = {
  sent: 'SENT',
  received: 'RECEIVED',
  read: 'READ',
};

const Transaction_Status = {
  successful: 'SUCCESSFUL',
  failed: 'FAILED',
  pending: 'PENDING'
};

const Investment_Status = {
  active: 'ACTIVE',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

const Is_Verified = {
  verified: 'VERIFIED',
  not_verified: 'NOT VERIFIED',
};

const Collections = {
  User: 'User',
  Investment: 'Investment',
  Wallet: 'Wallet',
  Transaction: 'Transaction',
  Payment: 'Payment',
  Contract: 'Contract',
  Email: 'Email'
};

const Power = {
  on: 'ON',
  off: 'OFF',
};

const Clock = {
  min: 'minute',
  hr: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
};

const Time_share = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  minute: 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

const Time_Directory = {
  future: 'future',
  past: 'past',
};

const Coin = {
  eth: 'ETH',
  bnb: 'BNB',
  matic: 'MATIC'
};

const Transaction_type = {
  credit: "CREDIT",
  debit: "DEBIT",
};

const Qs = {
  pet: 'What is the name of your favorite pet',
  food: 'What is the name of your favorite food',
  music: 'What is the name of your favorite song',
  book: 'What is the name of your favorite book',
  movie: 'What is the name of your favorite movie',
  friend: 'Whats the name of your best friend',
};

const Charges = {
  withdrawal: 'withdrawal',
  none: 'none',
};

const Payment_status = {
  paid: 'PAID',
  on_queue: 'ON QUEUE',
};

const Wallet_where = {
  holdings: 'HOLDINGS',
  total: 'TOTAL',
  available: 'AVAILABLE',
};

const Action = {
  add: 'ADD',
  subtract: 'SUBTRACT',
};

const Wallet_availableBalance_specification = {
  external_wallet: 'MY EXTERNAL WALLET',
  investment_wallet: 'INVESTMENT',
};

const userStatus = {
  active: 'ACTIVE',
  deleted: 'DELETED', // user action
  disabled: 'DISABLED', // admin action
  deactivated: 'DEACTIVATED', // user action
};

const emailStatus = {
  pending: 'PENDING',
  sent: 'SENT',
  failed: 'FAILED'
};

const emailType = {
  welcome: 'WELCOME',
  forget: 'FORGET',
  delete: 'DELETE',
  disable: 'DISABLE'
};


module.exports = { 
  Role, 
  Is_Verified, 
  Collections, 
  Power, 
  Gender, 
  Note_Status, 
  Transaction_Status,
  Time_share,
  Investment_Status,
  Coin, 
  Transaction_type,
  Qs,
  Clock,
  Time_Directory,
  Charges,
  Payment_status,
  Wallet_where,
  Action,
  Wallet_availableBalance_specification,
  userStatus,
  emailStatus,
  emailType
};
