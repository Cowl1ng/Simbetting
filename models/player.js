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
  playing: {
    type: Boolean,
    default: false
  },
})

const Player = mongoose.model('Player', PlayerSchema)

module.exports = Player