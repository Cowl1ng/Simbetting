const mongoose = require('mongoose');


const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  fantasy_team: {
    type: String,
    required: true
  },
  position: {
    type: String,
  },
  mvp_odds: {
    type: Number,
    default: 15
  },
  playing: {
    type: Boolean,
    default: false
  },
})

const Player = mongoose.model('Player', PlayerSchema)

module.exports = Player