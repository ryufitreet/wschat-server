const WebSocket = require('ws');
const { User } = require('./database/database.js').models;

class WebSocketServer {
  constructor() {
    this.server = null;

    this.init = this.init.bind(this);
    this.ping = this.ping.bind(this);
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
                console.log('ws authrozition прошла');
                ws.authorized = true;
              } else {
                ws.authorized = false;
              }
            });
        } else {

        }
        // ws.send(`Echo: ${message}`);
      });

      ws.on('pong', function() {
        this.isAlive = true;
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