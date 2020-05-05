const mongoose = require('mongoose')
const FantasyBet = require('./fantasyBet')
const User = require('./User')


// Create new schema (tables in sql database)
const FantasyGameSchema = new mongoose.Schema ({
  team_a: {
    type: String,
    required: true
  },
  odds_a: {
    type: Number,
    required: true
  },
  team_b: {
    type: String,
    required: true
  },
  odds_b: {
    type: Number,
    required: true
  },
  draw: {
    type: Boolean,
  },
  odds_draw: {
    type: Number,
    required: true
  },
  game_week: {
    type: Number,
  },
  team_a_points: {
    type: Number,
    default: 0
  },
  team_b_points: {
    type: Number,
    default: 0
  },
  game_number: {
    type: Number,
  },
  started: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
})

FantasyGameSchema.pre('remove', function(next) {
  try {
  FantasyBet.find({ game: this.id }, (err, bets)) 
  .then(bets => {
    if(err) {
      next(err)
      next(new Error('This game has bets on it'))
    }
  })
  .catch(err => console.log(err))
} catch(err) {
  console.log(err)
}
})

FantasyGameSchema.post('save', async function(next) {
  try{
  await FantasyBet.find({ game: this.id }, (error, bets) => {
    var bettype = [this.team_a + " to win", this.team_b + " to win", "draw"]
    for (const bet of bets) {
      if(this.completed == true) {
       if(bet.type == bettype[0] & this.team_a_points > this.team_b_points){
         bet.win = true
       } else if(bet.type == bettype[1] & this.team_b_points > this.team_a_points){
         bet.win = true
       } else if(bet.type == bettype[2] & this.team_a_points == this.team_b_points) {
         bet.win = true
       } else { bet.win = false}
       bet.settled = true
       FantasyBet.findOneAndUpdate({ _id: bet.id} , { win: bet.win, settled: true})
       .catch(err => console.log(err))
    } else {
      bet.settled = false
       FantasyBet.findOneAndUpdate({ _id: bet.id} , {settled: false})
       .catch(err => console.log(err))
    } 
  }
}) 
  
  
 
  await User.find({}, async (error, users) => {
  for (const user of users) {
    winnings = 0
    user.balance = user.preFbalance
    await FantasyBet.find({ user: user.id }, (error, bets) => {
      for (bet of bets) {
        if (bet.settled == true & bet.win == true) {
          winnings += bet.winnings - bet.stake
        } else {
          winnings -= bet.stake
        }
        user.balance += winnings
        winnings = 0
        user.balance = user.balance.toFixed(2)
      }
      User.findOneAndUpdate({ _id: user.id} , { balance: user.balance})
      .catch(err => console.log(err))
    })
  }
})
  } catch(err) {
    console.log(err)
  }
})


const FantasyGame = mongoose.model('FantasyGame', FantasyGameSchema)
module.exports = FantasyGame