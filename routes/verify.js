var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user) {
  //creating token and setting its validity for 1 hour.
  return jwt.sign(user.toObject(), config.secretKey, { expiresIn: 3600});
};

exports.verifyOrdinaryUser = function (req, res, next) {
  // A client can send token either in body of req message or in url parameter or in header
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // If token is present in either of these 3 then decode it and verify its validity (whether its tampered or not)
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.secretKey, function (err, decoded) {
      if (err) { //Means token is not verified
        var err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
      }
      else { //Token is verified
        // if everything is good, then payload content of token will be available on "req.decoded". So if we want to retrieve token information then we can do it easily through "req.decoded"
        req.decoded = decoded;
        next();
      }
    });
  }
  // if there is no token, return an error
  else {
    var err = new Error('No token provided!');
    err.status = 403;
    return next(err);
  }
};

exports.verifyAdmin = function(req, res, next) {
  console.log("req.decoded: ",  req.decoded);
  if(req.decoded.admin) {
    console.log("req.decoded: ",  req.decoded);
    next();
  }
  else {
    var err = new Error('You are not authorized to perform this operaion');
    err.status = 403;
    return next(err);
  }
};
