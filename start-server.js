const httpServer = require('./http-server');
const SETTINGS = require('./server-settings');
const server = require('http').createServer();
const initWebsocketServer = require('./websocket-server').init;

initWebsocketServer(server);
server.on('request', httpServer);

server.listen(SETTINGS.port, () => {
  console.log(`Server started on port ${SETTINGS.port}`);
});
