const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const app = express()
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const methodOverride = require('method-override')

const PORT = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'));

// Passport config
require('./config/passport')(passport)

//DB config
const db = require('./config/keys').MongoURI

//Connect to mongo
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))

//EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

// Bodyparser
app.use(express.urlencoded({ extended: false }))

// Express session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(express.static('public'))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash())

// Global vars 
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg') // Creating global variable success_msg
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

// Method override
app.use(methodOverride('_method'))

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/games', require('./routes/games'))
app.use('/account', require('./routes/account'))
app.use('/fantasy', require('./routes/fantasy'))
app.use('/player', require('./routes/player'))

app.listen(PORT, console.log(`Server started on port ${PORT}`))