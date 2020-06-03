const express = require('express')
const router = express.Router()
const Game = require('../models/game')
const { ensureAuthenticated } = require('../config/auth')
const Bet = require('../models/bet')
const User = require('../models/User')
const Player = require('../models/player')
const Score = require('../models/score')

// All games route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const games = await Game.find({})
    res.render('games/index', { games: games })
  } catch {
    res.redirect('/')
    console.log('Failed')
  }
})
// Public games list
router.get('/list', ensureAuthenticated, async (req, res) => {
  try {
    const games = await Game.find({ completed: false }).limit(10)
    const completedGames = await Game.find({ completed: true })
      .limit(10)
      .sort({ date: -1 })
    res.render('games/index_public', {
      games: games,
      completedGames: completedGames,
    })
  } catch {
    res.redirect('/')
    console.log('Failed')
  }
})
// Create bet route
router.post('/list', ensureAuthenticated, async (req, res) => {
  console.log('Submitting new bet')
  var odds = 0
  let bet_type = ''
  try {
    const users = await User.findById(req.user.id)
    const games = await Game.findById(req.body.gameid)
    const correct_scores = await Score.find({ game_id: req.body.gameid }).lean()
    const score = String(req.body.c_score)
    await Player.find({
      $or: [{ name: req.body.motm }, { name: req.body.fgoal }],
    }).then((player) => {
      if (
        (req.body.bettype == undefined) &
        (req.body.fgoal == undefined) &
        (req.body.motm == undefined)
      ) {
        bet_type = req.body.c_score + ' score'
        odds = correct_scores[0][score]
        console.log(odds)
      } else if (
        (req.body.bettype == undefined) &
        (req.body.fgoal == undefined)
      ) {
        bet_type = req.body.motm + ' MOTM'
        odds = player[0].mvp_odds
      } else if (req.body.bettype == undefined) {
        console.log(player)
        bet_type = req.body.fgoal + ' first goal scorer'
        odds = player[0].fgoal_odds
      } else {
        console.log('Non MOTM')
        console.log(req.body.bettype)
        bet_type = req.body.bettype
        if (req.body.bettype == games.team_a) {
          odds = games.odds_a
        } else if (req.body.bettype == games.team_b) {
          odds = games.odds_b
        } else if (req.body.bettype == 'draw') {
          odds = games.odds_draw
        } else if (req.body.bettype == 'Over ' + games.ougoals + ' goals') {
          odds = games.odds_ogoals
        } else if (req.body.bettype == 'Under ' + games.ougoals + ' goals') {
          odds = games.odds_ugoals
        } else if (req.body.bettype == 'Red Card') {
          odds = games.odds_rcard
        } else {
          console.log('Error getting odds')
        }
      }
    })
    winnings = odds * req.body.stake
    winnings = winnings.toFixed(2)
    const newBet = new Bet({
      type: bet_type,
      stake: req.body.stake,
      winnings: winnings,
      user: users.id,
      game: req.body.gameid,
      game_title: req.body.game_title,
    })
    users.balance -= req.body.stake
    await users.save()
    await newBet.save()
    req.flash('success_msg', 'Bet created')
    res.redirect('/games/list')
  } catch (err) {
    console.log(err)
  }
})

// Show create game  page route
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('games/new', { game: new Game() })
})

//Create game route
router.post('/', ensureAuthenticated, async (req, res) => {
  user = await User.findById(req.user.id)
  if (user.name == 'Luke ' || 'Tim') {
    const newGame = new Game({
      team_a: req.body.team_a,
      odds_a: req.body.odds_a,
      team_b: req.body.team_b,
      odds_b: req.body.odds_b,
      odds_draw: req.body.odds_draw,
      ougoals: req.body.ougoals,
      odds_ogoals: req.body.odds_ogoals,
      odds_ugoals: req.body.odds_ugoals,
      completed: req.body.completed,
    })
    newGame
      .save()
      .then((game) => {
        req.flash('success_msg', 'Game created')
        res.redirect('/games')
      })
      .catch((err) => console.log(err))
  } else {
    res.redirect(`/games/list`)
    console.log('Not allowed')
  }
})

// Indivdual game route
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
    const users = await User.findById(req.user.id)
    const userBets = await Bet.find({ user: users.id, game: game.id })
    const winningBets = await Bet.find({ game: game.id, win: true })
      .sort({ winnings: -1 })
      .limit(5)
    const losingBets = await Bet.find({ game: game.id, win: false })
      .sort({ stake: -1 })
      .limit(5)
    console.log(req.params.id)
    console.log(users.id)
    const correct_scores = await Score.find({ game_id: req.params.id }).lean()
    console.log(`Score: ${correct_scores}`)
    if (correct_scores != '') {
      const score_object = correct_scores[0]
      var scores_odds = Object.values(score_object)
      var scores = Object.keys(score_object)
    }
    const players_show = await Player.find({
      $or: [
        { $and: [{ country: game.team_a }, { starter: true }] },
        { $and: [{ country: game.team_b }, { starter: true }] },
      ],
    }).sort({ mvp_odds: 1 })
    var bettype = [
      game.team_a,
      game.team_b,
      'draw',
      'Over ' + game.ougoals + ' goals',
      'Under ' + game.ougoals + ' goals',
      'Red Card',
    ]
    if ((game.started == false) & (game.completed == false)) {
      res.render('games/show', {
        game: game,
        users: users,
        bettype: bettype,
        userBets: userBets,
        players: players_show,
        scores: scores,
        scores_odds: scores_odds,
      })
    } else if ((game.started == true) & (game.completed == false)) {
      res.render('games/started', {
        game: game,
        users: users,
        userBets: userBets,
        players: players_show,
      })
    } else {
      res.render('games/completed', {
        game: game,
        users: users,
        userBets: userBets,
        losingBets: losingBets,
        winningBets: winningBets,
      })
    }
  } catch (err) {
    console.log(err)
    res.redirect('/games/list')
  }
})

// Page to edit betting lines on game
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
    res.render('games/edit', { game: game })
  } catch {
    res.redirect('/games/list')
  }
})

// Page to edit result of game
router.get('/:id/result', ensureAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)

    const players = await Player.find({
      $or: [{ country: game.team_a }, { country: game.team_b }],
    })
    res.render('games/result', {
      game: game,
      players: players,
    })
  } catch {
    res.redirect('/games')
  }
})
// Request to edit result of game in mongodb
router.put('/:id/completed', ensureAuthenticated, async (req, res) => {
  try {
    console.log('saving reuslt')
    game = await Game.findById(req.params.id)
    user = await User.findById(req.user.id)
    if (user.name == 'Luke ' || 'Tim') {
      game.team_a_goals = req.body.team_a_goals
      game.team_b_goals = req.body.team_b_goals
      game.yellow_cards = req.body.yellow_cards
      game.red_card = req.body.red_card
      game.mvp = req.body.motm
      game.fgoal_scorer = req.body.fgoal
      game.score = String(req.body.team_a_goals + '-' + req.body.team_b_goals)
      console.log(game.score)
      if (req.body.red_card == null) {
        game.red_card = false
      }
      game.completed = true
      await game.save()
      res.redirect(`/games/${game.id}`)
    } else {
      res.redirect(`/games/list`)
      console.log('Not allowed')
    }
  } catch (err) {
    if (game == null) {
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
    user = await User.findById(req.user.id)
    if (user.name == 'Luke' || 'Tim') {
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
      if (req.body.started == null) {
        game.started = false
      }
      if (req.body.completed == null) {
        game.completed = false
      }
      await game.save()
      res.redirect(`/games/${game.id}`)
    } else {
      res.redirect(`/games/list`)
      console.log('Not allowed')
    }
  } catch (err) {
    if (game == null) {
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
    user = await User.findById(req.user.id)
    if (user.name == 'Luke ' || 'Tim') {
      await game.remove()
    } else {
      res.redirect(`/games/list`)
      console.log('Not allowed')
    }
    res.redirect('/games')
  } catch (err) {
    if (game == null) {
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
