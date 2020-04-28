const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  type: {
    type: String,
    // required: true
  },
  stake: {
    type: Number,
    // required: true
  },
  winnings: {
    type: Number,
    // required: true
  },
  win: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: 'User'
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: 'Game'
  },
  game_title: {
    type: String,
    // required: true
  }, 
  settled: {
    type: Boolean,
    default: false
  }
})


const Bet = mongoose.model('Bet', betSchema)
module.exports = Bet