const express = require('express')
const router = express.Router()
const Player = require('../models/player')
const User = require('../models/User')
const { ensureAuthenticated } = require('../config/auth')


router.get('/new', ensureAuthenticated, async (req, res) => {
  try {
    const players = await Player.find({})
    res.render('./player_new', { player: players })
  } catch(err) {
    console.log(err)
}
})

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const players = await Player.find({})
    res.render('./player', { players: players })
  } catch(err) {
    console.log(err)
}
})

router.get('/all_lineups', ensureAuthenticated, async (req, res) => {
  try {
    const players = await Player.find({playing: false})
    res.render('./all_lineups', { players: players })
  } catch(err) {
    console.log(err)
}
})

router.get('/lineup', ensureAuthenticated, async (req, res) => {
  let goalkeepers = []
  let defenders = []
  let midfielders = []
  let forwards = []
  try {
    const users = await User.findById(req.user.id)
    const players = await Player.find({fantasy_team: users.fantasy_team, playing: true})
    for(player of players) {
      if(player.position == "goalkeeper") {
        goalkeepers.push(player)
      } else if(player.position == "defender") {
        defenders.push(player)
      } else if(player.position == "midfielder") {
        midfielders.push(player)
      } else if(player.position == "forward") {
        forwards.push(player)
      }
    }
    res.render('./lineup', { 
      goalkeepers: goalkeepers,
      defenders: defenders,
      midfielders: midfielders,
      forwards: forwards
     })
  } catch(err) {
    console.log(err)
}
})

router.post('/lineup_change', ensureAuthenticated, async (req, res) => {
  let goalkeepers = []
  let defenders = []
  let midfielders = []
  let forwards = []
  try {
    const users = await User.findById(req.user.id)
    const players = await Player.find({fantasy_team: users.fantasy_team})
    for(player of players) {
      if(player.position == "goalkeeper") {
        goalkeepers.push(player.name)
      } else if(player.position == "defender") {
        defenders.push(player.name)
      } else if(player.position == "midfielder") {
        midfielders.push(player.name)
      } else if(player.position == "forward") {
        forwards.push(player.name)
      }
    }
    formation = parseInt(req.body.formation)
    res.render('./lineup_change', { 
      formation: formation,
      goalkeepers: goalkeepers,
      defenders: defenders,
      midfielders: midfielders,
      forwards: forwards
     })
  } catch(err) {
    console.log(err)
}
})

router.post('/', ensureAuthenticated, async (req, res) =>{
  const newPlayer = new Player ({
    name: req.body.name,
    country: req.body.country,
    fantasy_team: req.body.fantasy_team,
    position: req.body.position
  })
  newPlayer.save()
            .then(player => {
              req.flash('success_msg', 'Player created')
              res.redirect('/games')
            })
            .catch(err => console.log(err))
})

router.post('/lineup', ensureAuthenticated, async (req, res) =>{
  try{
    await Player.findOneAndUpdate({name: req.body.goalkeeper}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_1}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_2}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_3}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_4}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_5}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_6}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_7}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_8}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_9}, {playing: true})
    await Player.findOneAndUpdate({name: req.body.player_10}, {playing: true})
    res.redirect('/player/lineup')
  } catch(err) {
    console.log(err)
    res.redirect('/player/lineup')
  } 
})


module.exports = router