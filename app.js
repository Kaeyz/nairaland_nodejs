// to read variables from file 'variable.ev'
require("dotenv").config({path: "variable.env"});
// to require express
const express = require("express");
const app = express();
// allows put and delete to work on the route
const methodOverride = require("method-override");
// saves form input in 'req.body'
const bodyParser = require("body-parser");
// my database buddy
const mongoose = require("mongoose");
// to connect to the database
const passport = require('passport')
const LocalStrategy = require('passport-local')
const expressSession  = require ('express-session')
const flash = require('connect-flash');

// User, Post and Comment Schema
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')

// Routes 
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')

// const dbUrl = process.env.DATABASE 
const dbUrl = 'mongodb://localhost:27017/nairaland_clone'   /* process.env.DATABASE || */ 
mongoose.connect(dbUrl, { useNewUrlParser: true }).catch(err => {console.log(err);});
const port = 80;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash())

//Passport setup
app.use(expressSession({
  secret: 'this is the best',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.error = req.flash('error')
  res.locals.success = req.flash('success')
  // res.locals.moment = require('moment')
  res.locals.dump = (obj) => JSON.stringify(obj, null, 5) 
  next()
})

// home route
app.use('/', authRoutes);
app.use('/user', userRoutes)
app.use('/post', postRoutes);
app.use('/post/:id/comment', commentRoutes)


app.listen(port, () => {
  console.log('listening on port 80');
});
