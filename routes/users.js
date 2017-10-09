const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

function isAuthenticated(req, res, next) {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).send({ message: 'You did not provide a JSON Web Token in the Authorization header.' });
  }

  var header = req.headers.authorization.split(' ');
  var token = header[1];
  var payload = jwt.decode(token, config.tokenSecret);
  var now = moment().unix();

  if (now > payload.exp) {
    return res.status(401).send({ message: 'Token has expired.' });
  }

  User.findById(payload.sub, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  })
}

// Register
router.get('/', isAuthenticated, (req, res) => {
  res.render('users/register');
});
router.post('/register', (req, res, next) => {
  if(!req.body.username){
    return res.json({success: false, msg:'Bạn chưa nhập tài khoản'});
  }
  if(!req.body.password){
    return res.json({success: false, msg:'Bạn chưa nhập mật khẩu'});
  }
  if(!req.body.repassword){
    return res.json({success: false, msg:'Bạn chưa nhập lại mật khẩu'});
  }
  if(req.body.password != req.body.repassword){
    return res.json({success: false, msg:'Bạn nhập mật khẩu không giống nhau'});
  }

  const username = req.body.username.toLowerCase();
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if(user){
      return res.json({success: false, msg: 'Tài khoản này đã được sử dụng'});
    }else{
      var newUser = new User({
        username: username,
        password: password
      });
      User.addUser(newUser, (err, user) => {
        if(err){
          res.json({success: false, msg:'Không thể đăng ký'});
        } else {
          res.json({success: true, msg:'Đăng ký thành công'});
        }
      });
    }
  });

});

// Authenticate
router.post('/login', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  User.getUserByUsername(username, (err, user) => {
    if(!user){
      return res.json({success: false, msg: 'Tài khoản không tồn tại'});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if(isMatch){
        const token = jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60),
        }, config.secret);
        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            username: user.username
          }
        });
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  res.json({user: req.user});
});

module.exports = router;
