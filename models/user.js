var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
  username: String,
  password: String,
  isAdmin:   {
    type: Boolean,
    default: false
  }
});


userSchema.plugin(passportLocalMongoose);
var Users = mongoose.model('User', userSchema);
module.exports = Users;
