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


router.get('/free_agents', ensureAuthenticated, async (req,res) => {
  let goalkeepers = []
  let defenders = []
  let midfielders = []
  let forwards = []
  try {
    const players = await Player.find({fantasy_team: 'Free Agent'})
    for(player of players) {
      if(player.position == "Goalkeeper") {
        goalkeepers.push(player)
      } else if(player.position == "Defender") {
        defenders.push(player)
      } else if(player.position == "Midfielder") {
        midfielders.push(player)
      } else if(player.position == "Forward") {
        forwards.push(player)
      }
    }
    res.render('./free_agents', { 
      goalkeepers: goalkeepers,
      defenders: defenders,
      midfielders: midfielders,
      forwards: forwards,
      players: players
     })
  } catch(err) {
    console.log(err)
  }
})

router.get('/all_lineups', ensureAuthenticated, async (req, res) => {
  let wedge = []
  let forbes = []
  let tim = []
  let bow = []
  let kite = []
  let stark = []
  let rog = []
  let coulman = []
  let niall = []
  let cowling = []
  try {
    const players = await Player.find({playing: true}).sort({fantasy_team: 1})
    for (const player of players){
      if(player.fantasy_team == 'Wedge'){wedge.push(player)}
      if(player.fantasy_team == 'Forbes'){forbes.push(player)}
      if(player.fantasy_team == 'Tim'){tim.push(player)}
      if(player.fantasy_team == 'Bow'){bow.push(player)}
      if(player.fantasy_team == 'Kite'){kite.push(player)}
      if(player.fantasy_team == 'Stark'){stark.push(player)}
      if(player.fantasy_team == 'Rog'){rog.push(player)}
      if(player.fantasy_team == 'Coulman'){coulman.push(player)}
      if(player.fantasy_team == 'Niall'){niall.push(player)}
      if(player.fantasy_team == 'Cowling'){cowling.push(player)}
    }
    res.render('./all_lineups', { 
      wedge: wedge,
      forbes: forbes,
      tim: tim,
      bow: bow,
      kite: kite,
      stark: stark,
      rog: rog,
      coulman: coulman,
      niall: niall,
      cowling: cowling
     })
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
    const players = await Player.find({fantasy_team: users.fantasy_team})
    for(player of players) {
      if(player.position == "Goalkeeper") {
        goalkeepers.push(player)
      } else if(player.position == "Defender") {
        defenders.push(player)
      } else if(player.position == "Midfielder") {
        midfielders.push(player)
      } else if(player.position == "Forward") {
        forwards.push(player)
      }
    }
    res.render('./lineup', { 
      goalkeepers: goalkeepers,
      defenders: defenders,
      midfielders: midfielders,
      forwards: forwards,
      players: players,
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
      if(player.position == "Goalkeeper") {
        goalkeepers.push(player.name)
      } else if(player.position == "Defender") {
        defenders.push(player.name)
      } else if(player.position == "Midfielder") {
        midfielders.push(player.name)
      } else if(player.position == "Forward") {
        forwards.push(player.name)
      }
    }
    formation = parseInt(req.body.formation)
    res.render('./lineup_change', { 
      players: players,
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
    await Player.updateMany({fantasy_team: req.user.fantasy_team}, {$set: {
      playing: false,
      captain: false,
      vice_captain: false
    }})
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
    await Player.findOneAndUpdate({name: req.body.captain}, {captain: true})
    await Player.findOneAndUpdate({name: req.body.vice_captain}, {vice_captain: true})
    res.redirect('/player/lineup')
  } catch(err) {
    console.log(err)
    res.redirect('/player/lineup')
  } 
})


module.exports = router