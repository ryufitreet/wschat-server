const express = require('express');
const router = express.Router();
const database = require('./database/database.js');
const md5 = require('md5');
const { User } = database.models;

/**
 * 
 * @param {sequelize instance} user 
 */
const loginUser = (user) => {
  return new Promise((resolve, reject) => {
    const { login } = user;
    let hash = md5(login + String(Date.now()) + login);
    for (let i=0;i<666;i++) {
      hash = md5(hash);
    }
    user.update({auth_token: hash})
      .then(() => {
        resolve(hash)
      });
  });
  
}

router.post('/signup', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    res.json({status: 'error', message: 'Enter login and password!'});
    return;
  }

  User.addUser(login, password)
    .then((user) => {
      loginUser(user)
        .then(hash => res.json({status: true, token: hash}))
    })
    .catch((err) => {
      console.warn(err);
      res.json({status: 'error'});
    })
});

router.all('/signin', (req, res) => {
  const { login, password } = req.body;
  User.findOne({
    where: {
      login,
      password: User.saltPassword(password),
    }
  })
    .then((user) => {
      if (!user) {
        res.json({status: 'error'});    
      } else {
        loginUser(user)
          .then(hash => res.json({status: true, token: hash}))
      }
    })
})

module.exports = router;