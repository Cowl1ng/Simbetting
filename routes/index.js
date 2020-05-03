const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')
//Welcome page
router.get('/', ensureAuthenticated, (req, res) => res.redirect('/games/list'))

//Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => 
res.render('dashboard' , {
  name: req.user.name,
  balance: req.user.balance
}))


module.exports = router