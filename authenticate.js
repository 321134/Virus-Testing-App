//We have refactor code of "app.js" by seperating authentication code.
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config');
var Users = require('./models/user');

exports.local = passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());
