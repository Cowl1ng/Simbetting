const mongoose = require('mongoose')
const Game = require('./game')


// Create new schema (tables in sql database)
const scoreSchema = new mongoose.Schema ({
  game_title: {
    type: String
  },
  game_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game' 
  }
})


const Score = mongoose.model('Score', scoreSchema)
module.exports = Score