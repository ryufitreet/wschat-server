const express = require('express');
const database = require('./database/database.js');
const WebSocket = require('ws');
const wsServer = require('./websocket-server');
const sessionStore = require('./session-store');

const { User, Message } = database.models;
const API = require('./api.js');

const router = express.Router();

router.use((req, res, next) => {
  next();
});

router.get('/', (req, res) => {
  res.json({message: 'its ok!'});
});

router.route('/users')
  .get((req, res) => {
    const users = User.findAll({
      attributes: ['login', 'createdAt'],
    })
    .then((users) => {
      res.json(users);
    })
    .catch(() => {
      res.json({status: 'error'});
    })
    
  })

router.route('/users/me')
  .get((req, res) => {
    const { user } = req;
    if (!user) {
      res.json({status: 'error'});
      return;
    }
    
    User.findOne({
      where: { id: user.id },
      attributes: ['login', 'id', 'createdAt'],
    })
    .then((user) => {
      if (user == null) throw "User not found!";
      res.json({user});
    })
    .catch((err) => {
      res.json({status: 'error'});
    })
  })

router.route('/messages/main/:page(\\d?)') // main assumed PRIVATE chat will be implemented
  .get((req, res) => {
    let { page } = req.params;
    page = page || 1;
    const limit = 50;
    // TODO брать параметры из гетов
    // Добавить сортировку
    Message.findAll({
      attributes: ['id', 'message', 'createdAt'],
      include: [
        { model: User, }
      ],
      order: [
        ['createdAt', 'DESC'],
      ],
      limit,
      offset: (page - 1)*limit
    })
      .then(messages => res.json(messages))
      .catch(error => {
        res.json({status: 'error'});
        console.log(error);
      });
  })
  .put((req, res) => { // remove after transfer to websocker message sending
    const { message } = req.body;
    const { id } = req.user;

    API.Message.add(message, id);    
  })

module.exports = router;