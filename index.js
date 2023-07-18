//Import required Libraries
require('dotenv').config();
const express = require('express');
const app = express();
const routReg = require('./routes/user');

const session = require('express-session');
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


//Assign Port to listen
const port = process.env.PORT;


app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Connection
const{connectMongoDb} = require('./connection')
connectMongoDb("mongodb://127.0.0.1:27017/authProject").then(()=>{
  console.log(" Mongodb Connected !")
})

// Oauth Logic
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALL_BACK_URL,
}, function (accessToken, refreshToken, profile, done) {
  console.log(profile);
  return done(null, profile);
}));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'failed' }),
  function (req, res) {
    // res.send('You Successfully log-in Using Google');
    res.render('home');
  }
);

app.get('/home', (req, res) => {res.render('home');});
app.get('/register', (req, res) => {res.render('register');});


app.use('/', routReg);
app.use('/login',routReg);
app.use('/forgetPassword',routReg);
app.use('/forgetPassword/:id/:token',routReg)


app.listen(port,(req,res)=>{
  console.log(`server running in Port ${port}`);
});









