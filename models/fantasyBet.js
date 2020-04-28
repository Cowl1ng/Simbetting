const mongoose = require('mongoose');

const FantasyBetSchema = new mongoose.Schema({
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
    ref: 'FantasyGame'
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


const FantasyBet = mongoose.model('FantasyBet', FantasyBetSchema)
module.exports = FantasyBet