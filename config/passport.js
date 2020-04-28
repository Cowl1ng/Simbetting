const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

// Load User Model

const User = require ('../models/User')

module.exports = function (passport) {
  passport.use(
    new localStrategy({ usernameField: 'username' }, (username, password, done) => {
      //Check username is registered
      User.findOne({ username: username })
      .then(user => {
        if(!user) {
          return done(null, false, {message: 'That username is not registered'})
        }

      // Check passwords match
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;

        if(isMatch) {
          return done(null, user)
        }else {
          return done(null, false, {message: 'Password incorrect'})
        }
        
      })
      })
      .catch(err => console.log(err))
    })
  )
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })

}