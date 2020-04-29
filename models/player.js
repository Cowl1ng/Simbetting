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
  fgoal_odds: {
    type: Number,
    default: 11
  },
  captain: {
    type: Boolean,
    default: false
  },
  vice_captain: {
    type: Boolean,
    default: false
  },
  playing: {
    type: Boolean,
    default: true
  },
})

const Player = mongoose.model('Player', PlayerSchema)

module.exports = Player