const WebSocket = require('ws');
const { User } = require('./database/database.js').models;

const API = require('./api.js');

class WebSocketServer {
  constructor() {
    this.server = null;

    this.init = this.init.bind(this);
    this.ping = this.ping.bind(this);
  }

  sendCountOfUsersToAll() {
    // Send to all Users - somebody connected
    // Find count of authed connections
    const authedClients = [...this.server.clients].filter((client) => {
      return client.readyState === WebSocket.OPEN && client.authorized;
    });
    const usersInChat = [];
    authedClients.forEach((client) => {
      const { user } = client;
      const { id } = user;
      if (!usersInChat.includes(id)) {
        usersInChat.push(id);
      }
    });
    authedClients.forEach((client) => {
      client.send(JSON.stringify({
        type: 'USERS-COUNT-IN-CHAT',
        payload: usersInChat.length,
      }));
    });
  }

  init(server) {
    const wss = new WebSocket.Server({server});
    wss.on('connection', (ws) => {

      ws.authorized = false;
      // Wait 5 sec for auth and terminate
      setTimeout(() => {
        if (ws.authorized === false) {
          ws.terminate();
        }
      }, 5000);

      ws.on('message', (message) => {
        const { type, payload } = JSON.parse(message);

        console.log(`WS MESSAGE`);
        console.log(type, payload);
        if (type !== 'AUTH' && ws.authorized === false) return;

        if (type === 'AUTH') {
          const { token } = payload;
          const [login='', auth_token=''] = Buffer.from(token, 'base64').toString("ascii").split(' + ');
          User.findOne({
            where: {
              login,
              auth_token,
            },
            raw: true,
          })
            .then((result) => {
              if (result !== null) {
                ws.authorized = true;
                ws.send(JSON.stringify({
                  type: 'AUTH',
                  payload: {
                    status: true,
                  },
                }));
                ws.user = result;
              } else {
                ws.authorized = false;
                ws.send(JSON.stringify({
                  type: 'AUTH',
                  payload: {
                    status: false,
                  },
                }));
              }
            });
        } else if (type === 'MESSAGE') {
          const { message } = payload;
          const { user: { id: user_id } } = ws;
          API.Message.add(message, user_id)
            .then((result) => {
              this.server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.authorized) {
                  client.send(JSON.stringify({
                    type: 'NEW-MESSAGE',
                    payload: result,
                  }));
                }
              })
            })
            .catch((e) => {
              console.error(e);
            })
        } else if (type === 'GET_USERS_COUNT') {
          this.sendCountOfUsersToAll();
        }
        // ws.send(`Echo: ${message}`);
      });

      ws.on('pong', function() {
        this.isAlive = true;
      });

      ws.on('close', () => {
        this.sendCountOfUsersToAll();
      });

    });

    this.server = wss;
    const interval = setInterval(this.ping, 3000);
  }
  
  ping() {
    this.server.clients.forEach((ws) => {
      if (ws.isAlive === false) ws.terminate();

      ws.isAlive = false;
      ws.ping()
    });
  }

}

const websocket = new WebSocketServer();

module.exports = websocket;