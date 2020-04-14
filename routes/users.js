//This is the file which we will use to support user's information. This will support login, logout and registeration of user.
var express = require('express');
var router = express.Router();
var passport = require('passport');
var Verify    = require('./verify'); //module to manage JWTs and verify user's idemtities through tokens

/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
  users.find({}, function(err, users) {
    if(err) throw err;
    res.json(users);
  });
});


//Mounting this login functionality on "/users/login" end point.
router.post('/login', function(req, res, next) {
  //Using custom callback for passport.authenticate function.
  // When using a custom callback, it becomes the application's responsibility to establish a session (by calling req.login()) and send a response.
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log("NO USER FOUND");
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: err.message
        });
      }
      // Now user is logged in successfully and the server will now send it token in response message which client will save and send with every subsequent request.
      //token is created with only 3 properties of User Schema.
      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.isAdmin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

// //Mounting "logout" functionality on "/users/logout".
// router.get('/logout', function(req, res) {
//   //At this point, we should destroy the token so that user cannot access server but we havent written code here for that.
//   req.logout();
//   res.status(200).json({ status: 'Bye!'});
// });

module.exports = router;
