const express = require('express')
const router = express.Router()
const Game = require('../models/game')
const FantasyGame = require('../models/fantasyGame')
const { ensureAuthenticated } = require('../config/auth')
const FantasyBet = require('../models/fantasyBet')
const User = require('../models/User')
gameWeek = 1


// All games route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const fantasygames = await FantasyGame.find({game_week: gameWeek})
    res.render ('fantasy/index', {fantasygames: fantasygames})  
  } catch {
      res.redirect('/')
      console.log('Failed')
  }
})

router.get('/nextweek', ensureAuthenticated, async (req, res) => {
  try {
    nextWeek = gameWeek + 1
    const fantasygames = await FantasyGame.find({game_week: nextWeek})
    res.render ('fantasy/index_next', {fantasygames: fantasygames})  
  } catch {
      res.redirect('/')
      console.log('Failed')
  }
})
// Public games route
router.get('/list', ensureAuthenticated, async (req, res) => {
  nextWeek = +gameWeek + 1
  console.log(nextWeek)
  try {
    const fantasyGamesCompleted = await FantasyGame.find({completed: true}).limit(10)
    const fantasyGamesThisWeek = await FantasyGame.find({game_week: gameWeek})
    const fantasyGamesNextWeek = await FantasyGame.find({game_week: nextWeek})
    res.render ('fantasy/index_public', {
      fantasyGamesCompleted: fantasyGamesCompleted,
      fantasyGamesThisWeek: fantasyGamesThisWeek,
      fantasyGamesNextWeek: fantasyGamesNextWeek
    })  
  } catch {
      res.redirect('/')
      console.log('Failed')
  }
  
})
// Next week route
router.get('/list/nextweek', ensureAuthenticated, async (req, res) => {
  nextWeek = gameWeek + 1
  try {
    const fantasygames = await FantasyGame.find({game_week: nextWeek })
    res.render ('fantasy/index_public_next', {
      fantasygames: fantasygames
    })  
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
    const fantasygames = await FantasyGame.findById(req.body.gameid)
    if(req.body.bettype == fantasygames.team_a) {
      odds = fantasygames.odds_a
    } else if(req.body.bettype == fantasygames.team_b + " to win") {
      odds = fantasygames.odds_b
    } else if(req.body.bettype == "draw") {
      odds = fantasygames.odds_draw
    } else {console.log("Error getting odds")}
    winnings = odds * req.body.stake
    winnings = winnings.toFixed(2)
    const newFantasyBet = new FantasyBet ({
      type: req.body.bettype,
      stake: req.body.stake,
      winnings: winnings,
      user: users.id,
      game: req.body.gameid,
      game_title: req.body.game_title,
    })
    users.balance -= req.body.stake
    await users.save()
    await newFantasyBet.save()
    req.flash('success_msg', 'Bet created')
    res.redirect('/fantasy/list')
  } catch(err) {
      console.log(err)
  }
})

// Show create game  page route
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('fantasy/new', {fantasygame: new FantasyGame() })
})

// Get week change page
router.get('/week', ensureAuthenticated, (req, res) => {
  res.render('fantasy/week', {fantasygame: new FantasyGame() })
})

// Post week change
router.post('/new', ensureAuthenticated, async (req, res) => {
  gameWeek = req.body.game_week
  user = await User.findById(req.user.id)
  if(user.name == 'Luke '|| 'Tim') {
  if(req.body.started == 'true'){ 
    gameStarted = true
  } else { gameStarted = false }
  await FantasyGame.updateMany({game_week: { $lt: gameWeek }}, { $set: { 'completed': true, 'started': gameStarted }})  
  await FantasyGame.updateMany({game_week: { $gte: gameWeek }}, { $set: { 'completed': false, 'started': gameStarted }})
  res.redirect('/fantasy')
  } else {
    res.redirect(`/games/list`)
    console.log('Not allowed')
  }
  
})

//Create game route
router.post('/', ensureAuthenticated, async (req, res) =>{
  user = await User.findById(req.user.id)
  if(user.name == 'Luke '|| 'Tim') {
  const newFantasyGame = new FantasyGame ({
    team_a: req.body.team_a,
    odds_a: req.body.odds_a,
    team_b: req.body.team_b,
    odds_b: req.body.odds_b,   
    odds_draw: req.body.odds_draw,
    game_week: req.body.game_week,
    completed : req.body.completed
  })
  newFantasyGame.save()
            .then(fantasygame => {
              req.flash('success_msg', 'Fantasy Game created')
              res.redirect('/fantasy/list')
            })
            .catch(err => console.log(err))
  } else {
    res.redirect(`/games/list`)
    console.log('Not allowed')
  }
})


// Indivdual game route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const fantasygame = await FantasyGame.findById(req.params.id)
    const users = await User.findById(req.user.id)
    const userFantasyBets = await FantasyBet.find({user: users.id, game: fantasygame.id})
    var bettype = [fantasygame.team_a, fantasygame.team_b, "draw"]
    if(fantasygame.completed == true) {
      res.render('fantasy/completed', {
        fantasygame: fantasygame,
        users: users,
        userBets: userFantasyBets
      })
    } else if(fantasygame.started == true) {
      res.render('fantasy/started', {
        fantasygame: fantasygame,
        users: users,
        bettype: bettype,
        userBets: userFantasyBets
      })
    } else { 
      res.render('fantasy/show', {
        fantasygame: fantasygame,
        users: users,
        bettype: bettype,
        userBets: userFantasyBets
      })
    }
    
  } catch(err) {
    console.log(err)
    res.redirect('/fantasy')
  }
})

// Page to edit betting lines on game
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const fantasygame = await FantasyGame.findById(req.params.id)
    res.render('fantasy/edit', {fantasygame: fantasygame })
  } catch {
    res.redirect('/fantasy')
  }
  
})

// Page to edit result of game
router.get('/:id/result', ensureAuthenticated, async (req, res) => {
  try {
    const fantasygame = await FantasyGame.findById(req.params.id)
    res.render('fantasy/result', {fantasygame: fantasygame })
  } catch {
    res.redirect('/fantasy')
  }
  
})
// Request to edit result of game in mongodb
router.put('/:id/completed', ensureAuthenticated, async (req, res) => {
  let fantasygame
  try {
    fantasygame = await FantasyGame.findById(req.params.id)
    user = await User.findById(req.user.id)
    if(user.name == 'Luke '|| 'Tim') {
    fantasygame.team_a_points = req.body.team_a_points
    fantasygame.team_b_points = req.body.team_b_points
    fantasygame.completed = true
    await fantasygame.save()
    res.redirect(`/fantasy/${fantasygame.id}`)
  } else {
    res.redirect(`/games/list`)
    console.log('Not allowed')
  }
  } catch(err) {
    if(game == null) {
      res.redirect('/fantasy')
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
  try {
    fantasygame = await FantasyGame.findById(req.params.id)
    user = await User.findById(req.user.id)
    if(user.name == 'Luke ' || 'Tim') {
      fantasygame.team_a = req.body.team_a
      fantasygame.odds_a = req.body.odds_a
      fantasygame.team_b = req.body.team_b
      fantasygame.odds_b = req.body.odds_b   
      fantasygame.odds_draw = req.body.odds_draw
      fantasygame.started = req.body.started
      fantasygame.completed = req.body.completed
      if(req.body.started == null) {
        fantasygame.started = false
      }
      if(req.body.completed == null) {
        fantasygame.completed = false
      }
      await fantasygame.save()
      res.redirect(`/fantasy/${fantasygame.id}`)
    } else {
      res.redirect(`/games/list`)
      console.log('Not allowed')
    }
  } catch(err) {
    if(fantasygame == null) {
      res.redirect('/fantasy')
      console.log('Name null')
      console.log(err)
    } else {
        console.log('Error updating')
        console.log(err)
        req.flash('error_msg', 'Cannot update, bets already placed')  
      res.redirect(`/fantasy/${fantasygame.id}`)
    }
  }
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
  let game
  try {
    game = await Game.findById(req.params.id)
    if(user.name == 'Luke '|| 'Tim') {
    await game.remove()
    res.redirect('/fantasy')
    } else {
      res.redirect(`/games/list`)
      console.log('Not allowed')
    }
  } catch (err){
    if(game == null) {
      res.redirect('/fantasy')
      console.log('Name null')
    } else {
      console.log(err)
      req.flash('error_msg', 'Cannot delete, bets already placed')  
      res.redirect(`/fantasy/${game.id}`)
      console.log('Error deleteing')       
    }
  }

})


module.exports = router
