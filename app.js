const express = require('express')
const app = express()

if (process.env.NODE_ENV !== 'production') {      // 如果不是 production 模式
  require('dotenv').config()                      // 使用 dotenv 讀取 .env 檔案
}

const mongoose = require('mongoose')                    // 載入 mongoose

// 引用 express-handlebars
const exphbs = require('express-handlebars');

// 引用 method-override
const methodOverride = require('method-override')    // 設定 method-override
app.use(methodOverride('_method'))

// 載入 express-session 與 passport
const session = require('express-session')
const passport = require('passport')
app.use(session({
  secret: 'your secret key',                 // secret: 定義一組自己的私鑰（字串)
  resave: 'false',
  saveUninitialized: 'false',
}))
// 使用 Passport 
app.use(passport.initialize())
app.use(passport.session())

require('./config/passport')(passport)
// 登入後可以取得使用者的資訊方便我們在 view 裡面直接使用

// 建立 local variables
app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.isAuthenticated = req.isAuthenticated()
  // console.log(res.locals.isAuthenticated)      // 辨識使用者是否已經登入的變數，讓 view 可以使用
  next()
})

//body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// 告訴 express 使用 handlebars 當作 template engine 並預設 layout 是 main
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

mongoose.connect('mongodb://localhost/todo', { useNewUrlParser: true, useCreateIndex: true })   // 設定連線到 mongoDB

// mongoose 連線後透過 mongoose.connection 拿到 Connection 的物件
const db = mongoose.connection

// 連線異常
db.on('error', () => {
  console.log('mongodb error!')
})

// 連線成功
db.once('open', () => {
  console.log('mongodb connected!')
})



// 設定路由
// 載入路由器

app.use('/', require('./routes/home'))
app.use('/todos', require('./routes/todo'))
app.use('/users', require('./routes/user'))
app.use('/auth', require('./routes/auths'))    // 把 auth route 加進來


app.listen(3000, () => {
  console.log('App is running!')
})