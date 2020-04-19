//This is the file which we will use to support user's information. This will support login, logout and registeration of user.
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Verify    = require('./verify'); //module to manage JWTs and verify user's idemtities through tokens
var Users = require('../models/user');
const Bcrypt = require("bcryptjs");

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("This is request: " + req);
  Users.find({}, function(err, users) {
    if(err) throw err;
    res.json(users);
  });
});

router.post('/add', function(req, res, next) {
  req.body.password = Bcrypt.hashSync(req.body.password, 10);
  Users.create(req.body, function(err, user) {
    if(err) {
      console.log(err);
      next(err);
    }
    var id = user._id;
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Added the user with id: ' + id);
  });
})

//Mounting this login functionality on "/users/login" end point.
router.post('/login', function(req, res, next) {
  console.log("request: " + req.body.username + " " + req.body.password);
  Users.findOne({username: req.body.username}, function(err, result) {
    if(err) {
      res.send(err);
    }
    else {
      if(!Bcrypt.compareSync(req.body.password, result.password)) {
        return res.status(400).send({ message: "The password is invalid" });
      }

      console.log("The username and password combination is correct!");
        // Now user is logged in successfully and the server will now send it token in response message which client will save and send with every subsequent request.
        //token is created with only 3 properties of User Schema.
        //deleting password from result object and then sending that as a payload to jsw token
        result.password = undefined;
        var token = Verify.getToken(result);
        res.status(200).json({
          status: 'Login successful!',
          success: true,
          token: token
        });
    }
  });

//   var user = Users.findOne({username: req.body.username}).exec();
//   console.log("user is: " + user.username);
//   if(!user) {
//       return res.status(400).send({ message: "The username does not exist" });
//   }
//   else if(!Bcrypt.compareSync(req.body.password, user.password)) {
//       return res.status(400).send({ message: "The password is invalid" });
//   }
//   else {
//   response.send({ message: "The username and password combination is correct!" });
// }

  // //Using custom callback for passport.authenticate function.
  // // When using a custom callback, it becomes the application's responsibility to establish a session (by calling req.login()) and send a response.
  // passport.authenticate('local', function(err, user, info) {
  //   console.log("user is: " + user);
  //   if (err) {
  //     return next(err);
  //   }
  //   // if(!Bcrypt.compareSync(req.body.password, user.password)) {
  //   //   return res.status(400).send({ message: "The password is invalid" });
  //   // }
  //   if (!user) {
  //     console.log("NO USER FOUND");
  //     return res.status(401).json({
  //       err: info
  //     });
  //   }
  //

});

// //Mounting "logout" functionality on "/users/logout".
// router.get('/logout', function(req, res) {
//   //At this point, we should destroy the token so that user cannot access server but we havent written code here for that.
//   req.logout();
//   res.status(200).json({ status: 'Bye!'});
// });

module.exports = router;
