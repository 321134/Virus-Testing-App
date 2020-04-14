//We have refactor code of "app.js" by seperating authentication code.
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require('./config');
var User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
