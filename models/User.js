const mongoose = require('mongoose');

var defaultBalance = 500 // Needs changing in game model as well

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  balance: {
    type: Number,
    default: defaultBalance,
    required: true
  },
  preFbalance: {
    type: Number,
    default: defaultBalance,
    required: true
  },
})

const User = mongoose.model('User', UserSchema)

module.exports = User