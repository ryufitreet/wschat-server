const express = require('express');
const database = require('./database/database.js');
const WebSocket = require('ws');
const wsServer = require('./websocket-server');
const sessionStore = require('./session-store');

const { User, Message } = database.models;

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

router.route('/messages/main') // main assumed PRIVATE chat will be implemented
  .get((req, res) => {
    Message.findAll({
      attributes: ['id', 'message', 'createdAt'],
      include: [
        { model: User, }
      ],
    })
      .then(messages => res.json(messages))
      .catch(error => res.json({status: 'error'}));
  })
  .put((req, res) => {
    const { message } = req.body;
    const { id: fk_user } = req.user;

    Message.create({
      message,
      fk_user,
    })
      .then(async (result) => {
        const data = result.dataValues;
        const user = await User.findOne({
          where: {id: data.fk_user}
        });
        data.user = user.dataValues;
        // Send Result via WebSocket
        if (wsServer.server) {
          const { clients = [] } = wsServer.server;
          
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.authorized){
              client.send(JSON.stringify({
                type: 'new-message',
                payload: data
              }));
            }
          });
        }
        // Send result via API
        res.json(result);
      })
      .catch((error) => {
        console.error(error);
        res.json({status: 'error'});
      });
  })

module.exports = router;