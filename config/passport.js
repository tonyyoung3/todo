// config/passport.js
const FacebookStrategy = require('passport-facebook').Strategy    // 載入 passport-facebook
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')          // 載入 bcryptjs library
const User = require('../models/user')      // 載入 User model
module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      User.findOne({
        email: email,
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' })
        }
        //用 bcrypt 來比較「使用者輸入的密碼」跟在使用者資料庫的密碼是否是同一組字串
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Email and Password incorrect' });
          }
        })
      })
    })
  )

  passport.use(
    new FacebookStrategy({
      clientID: '1265488463601507',
      clientSecret: '73fbe2c97ed491342d166c2537ba5c51',
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['email', 'displayName'],
    }, (accessToken, refreshToken, profile, done) => {
      // find and create user
      User.findOne({
        email: profile._json.email,
      }).then(user => {
        // 如果 email 不存在就建立新的使用者
        if (!user) {
          // 因為密碼是必填欄位，所以我們可以幫使用者隨機產生一組密碼，然後用 bcrypt 處理，再儲存起來
          var randomPassword = Math.random().toString(36).slice(-8)
          bcrypt.genSalt(10, (err, salt) =>
            bcrypt.hash(randomPassword, salt, (err, hash) => {
              var newUser = User({
                name: profile._json.name,
                email: profile._json.email,
                password: hash
              })
              newUser.save().then(user => {
                return done(null, user)
              }).catch(err => {
                console.log(err)
              })
            })
          )
        } else {
          return done(null, user)
        }
      })
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