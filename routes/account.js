const express = require('express')
const router = express.Router()
const Bet = require('../models/bet')
const User = require('../models/User')
const FantasyBet = require('../models/fantasyBet')
const { ensureAuthenticated } = require('../config/auth')

// Show account info
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.findById(req.user.id)
    const userBets = await Bet.find({user: users.id})
    const userFantasyBets = await FantasyBet.find({user: users.id})
    res.render('./account', {
      name: users.name,
      balance: users.balance,
      userBets: userBets,
      userFantasyBets: userFantasyBets
    })
  } catch(err) {
    console.log(err)
    res.redirect('/games')
  }  
})

router.delete('/', ensureAuthenticated, async (req, res) => {
  let bet
  try {
    bet = await Bet.findById(req.body.betid)
    console.log(bet)
    await bet.remove()
    res.redirect('/account')
  } catch (err){
    if(bet == null) {
      res.redirect('/account')
      console.log('Bet null')
    } else {
      console.log(err)
      req.flash('error_msg', 'Cannot delete, game already started')    
      res.redirect(`/account`)
        console.log('Error deleteing')       
    }
  }
})
// Show open bets
router.get('/openbets', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.findById(req.user.id)
    const userBets = await Bet.find({user: users.id})
    const userFantasyBets = await FantasyBet.find({user: users.id})
    res.render('./account', {
      name: users.name,
      balance: users.balance,
      userBets: userBets,
      userFantasyBets: userFantasyBets
    })
  } catch(err) {
    console.log(err)
    res.redirect('/account')
  }  
})

// Show settled bets
router.get('/settled', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.findById(req.user.id)
    const userBets = await Bet.find({ $and: [{user: users.id}, {settled: true}] }).sort({date: -1}).limit(10)
    const userFantasyBets = await FantasyBet.find({ $and: [{user: users.id}, {settled: true}] }).sort({date: -1}).limit(10)
    res.render('./account_settled', {
      name: users.name,
      balance: users.balance,
      userBets: userBets,
      userFantasyBets: userFantasyBets
    })
  } catch(err) {
    console.log(err)
    res.redirect('/account')
  }  
})
router.get('/settled/all', ensureAuthenticated, async (req, res) => {
  try {
    const users = await User.findById(req.user.id)
    const userBets = await Bet.find({ $and: [{user: users.id}, {settled: true}] }).sort({date: -1})
    const userFantasyBets = await FantasyBet.find({ $and: [{user: users.id}, {settled: true}] }).sort({date: -1})
    res.render('./account_settled', {
      name: users.name,
      balance: users.balance,
      userBets: userBets,
      userFantasyBets: userFantasyBets
    })
  } catch(err) {
    console.log(err)
    res.redirect('/account')
  }  
})

// Show leaderboard
router.get('/leaderboard', ensureAuthenticated, async (req, res) => {
  try{
    const thisUser = await User.findById(req.user.id)
    const users = await User.find({}).sort({balance: -1})
    res.render('./account_leaderboard', {
      name: thisUser.name,
      balance: thisUser.balance,
      users: users
    })
  } catch(err) {
    console.log(err)
    res.redirect('/account')
  }
})

module.exports = router
