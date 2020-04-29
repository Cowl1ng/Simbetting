const express = require('express')
const router = express.Router()
const Game = require('../models/game')
const { ensureAuthenticated } = require('../config/auth')
const Bet = require('../models/bet')
const User = require('../models/User')


// All games route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const games = await Game.find({})
    res.render ('games/index', {games: games})  
  } catch {
      res.redirect('/')
      console.log('Failed')
  }
  
})
// Public games list
router.get('/list', ensureAuthenticated, async (req, res) => {
  try {
    const games = await Game.find({})
    res.render ('games/index_public', {games: games})  
  } catch {
      res.redirect('/')
      console.log('Failed')
  }
  
})
// Create bet route
router.post('/list', ensureAuthenticated, async (req, res) =>{
  console.log('Submitting new bet')
  var odds = 0
  try {
    const users = await User.findById(req.user.id)
    const games = await Game.findById(req.body.gameid)
    if(req.body.bettype == games.team_a ) {
      odds = games.odds_a
    } else if(req.body.bettype == games.team_b) {
      odds = games.odds_b
    } else if(req.body.bettype == "draw") {
      odds = games.odds_draw
    } else if(req.body.bettype == "Over " + games.ougoals + " goals") {
      odds = games.odds_ogoals
    } else if(req.body.bettype == "Under " + games.ougoals + " goals") {
      odds = games.odds_ugoals
    } else if(req.body.bettype == "Red Card") {
      odds = games.odds_rcard
    } else {console.log("Error getting odds")}
    winnings = odds * req.body.stake
    winnings = winnings.toFixed(2)
    const newBet = new Bet ({
      type: req.body.bettype,
      stake: req.body.stake,
      winnings: winnings,
      user: users.id,
      game: req.body.gameid,
      game_title: req.body.game_title
    })
    users.balance -= req.body.stake
    await users.save()
    await newBet.save()
    req.flash('success_msg', 'Bet created')
    res.redirect('/games/list')
  } catch(err) {
      console.log(err)
  }
})

// Show create game  page route
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('games/new', {game: new Game() })
})

//Create game route
router.post('/', ensureAuthenticated, async (req, res) =>{
  const newGame = new Game ({
    team_a: req.body.team_a,
    odds_a: req.body.odds_a,
    team_b: req.body.team_b,
    odds_b: req.body.odds_b,   
    odds_draw: req.body.odds_draw,
    ougoals: req.body.ougoals,
    odds_ogoals: req.body.odds_ogoals,
    odds_ugoals: req.body.odds_ugoals,
    completed : req.body.completed
  })
  newGame.save()
            .then(game => {
              req.flash('success_msg', 'Game created')
              res.redirect('/games')
            })
            .catch(err => console.log(err))
})


// Indivdual game route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
    const users = await User.findById(req.user.id)
    const userBets = await Bet.find({user: users.id, game: game.id})
    console.log(userBets)
    var bettype = [game.team_a, game.team_b, "draw", "Over " + game.ougoals + " goals", "Under " + game.ougoals + " goals", "Red Card"]
    if(game.started == false & game.completed == false){ 
      res.render('games/show', {
        game: game,
        users: users,
        bettype: bettype,
        userBets: userBets
      })
    } else if(game.started == true & game.completed == false) {
      res.render('games/started', {
        game: game,
        users: users,
        userBets: userBets
      })
    } else {

      res.render('games/completed', {
        game: game,
        users: users,
        userBets: userBets
      })
    }

  } catch(err) {
    console.log(err)
    res.redirect('/games')
  }
})

// Page to edit betting lines on game
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
    res.render('games/edit', {game: game })
  } catch {
    res.redirect('/games')
  }
  
})

// Page to edit result of game
router.get('/:id/result', ensureAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
    res.render('games/result', {game: game })
  } catch {
    res.redirect('/games')
  }
  
})
// Request to edit result of game in mongodb
router.put('/:id/completed', ensureAuthenticated, async (req, res) => {
  let game
  try {
    game = await Game.findById(req.params.id)
    game.team_a_goals = req.body.team_a_goals
    game.team_b_goals = req.body.team_b_goals
    game.yellow_cards = req.body.yellow_cards
    game.red_card = req.body.red_card
    if(req.body.red_card == null) {
      game.red_card = false
    }
    game.completed = true
    await game.save()
    res.redirect(`/games/${game.id}`)
  } catch(err) {
    if(game == null) {
      res.redirect('/games')
      console.log('Name null')
      console.log(err)
    } else {
        console.log('Error updating')
        console.log(err)
    }
  }
})

// Request to edit betting lines in mongodb
router.put('/:id', ensureAuthenticated, async (req, res) => {
  let game
  try {
    game = await Game.findById(req.params.id)
    game.team_a = req.body.team_a
    game.odds_a = req.body.odds_a
    game.team_b = req.body.team_b
    game.odds_b = req.body.odds_b   
    game.odds_draw = req.body.odds_draw
    game.ougoals = req.body.ougoals
    game.odds_ogoals = req.body.odds_ogoals
    game.odds_ugoals = req.body.odds_ugoals
    game.odds_rcard = req.body.odds_rcard
    game.started = req.body.started
    game.completed = req.body.completed
    if(req.body.started == null) {
      game.started = false
    }
    if(req.body.completed == null) {
      game.completed = false
    }
    await game.save()
    res.redirect(`/games/${game.id}`)
  } catch(err) {
    if(game == null) {
      res.redirect('/games')
      console.log('Name null')
      console.log(err)
    } else {
        console.log('Error updating')
        console.log(err)
        req.flash('error_msg', 'Cannot update, bets already placed')  
      res.redirect(`/games/${game.id}`)
    }
  }
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  let game
  try {
    game = await Game.findById(req.params.id)
    await game.remove()
    res.redirect('/games')
  } catch (err){
    if(game == null) {
      res.redirect('/games')
      console.log('Name null')
    } else {
      console.log(err)
      req.flash('error_msg', 'Cannot delete, bets already placed')  
      res.redirect(`/games/${game.id}`)
      console.log('Error deleteing')       
    }
  }

})


module.exports = router
