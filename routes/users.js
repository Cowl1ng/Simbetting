const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
image= [{image: "./background.jpg"}]

// User model
const User = require('../models/User')

// Login page
router.get('/login', (req, res) => {
  
  res.render('login')
})

// Register page
router.get('/register', (req, res) => res.render('register'))


// Register handle
router.post('/register', (req, res) => {
  const { name, username, password, password2 } = req.body
  let errors = []

  // Check required fields
  if(!name || !username || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields'})
  }

  // Check passwords match
  if(password !== password2) {
    errors.push({ msg: 'Passwords do not match'})
  }

  if(errors.length > 0) {
    res.render('register', {
      errors,
      name,
      username,
      password,
      password2
    })
  } else {
    //Validation passed
    User.findOne( { username: username})
    .then(user => {
      if(user) {
        // User exists
        errors.push({ msg: 'username is already registered' })
        res.render('register', {
          errors,
          name,
          username,
          password,
          password2
        }) 
      } else {
        const newUser = new User({
          name,
          username,
          password
        })
        // Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            // Set password to hashed password
            newUser.password = hash;
            // Save user
            newUser.save()
            .then(user => {
              req.flash('success_msg', 'You are now registered')
              res.redirect('/users/login')
            })
            .catch(err => console.log(err))
        }
      ))
      }
    })
    .catch(err => console.log(err))
  }
})


//Login handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/games/list',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// Logour handler
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'You are logged out')
  res.redirect('/users/login')
})





module.exports = router