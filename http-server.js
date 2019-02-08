const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const websocketServerInit = require('./websocket-server');

const sessionStore = require('./session-store');

const apiRouter = require('./apiRouter.js');
const baseRouter = require('./baseRouter.js');
const { User } = require('./database/database.js').models;

const SETTINGS = require('./server-settings.js');

const app = express();

app.use(cors(SETTINGS.cors));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(expressSession({
  secret: 'xyzzxcuip',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: false,
  },
  store: sessionStore,
}));


const isAuthenticated = (req, res, next) => {
  const authToken = req.get('AuthToken');
  const [login='', auth_token=''] = Buffer.from(authToken, 'base64').toString("ascii").split(' + ');

  // TODO брать токен расшифровывать base64, резать по знаку + проверять логин пароль и tempkey
  // https://stackoverflow.com/questions/14573001/nodejs-how-to-decode-base64-encoded-string-back-to-binary

  User.findOne({
    where: {
      login,
      auth_token,
    },
    raw: true,
  })
    .then((result) => {
      if (result !== null) {
        req.isAuthenticated = true;
        const {login, id, createdAt, updatedAt} = result;
        req.user = {login, id, createdAt, updatedAt};
        next();
      } else {
        res.json({status: 'error', type: 'AUTH'});
      }
    });
}

app.use(baseRouter);
app.use('/api', isAuthenticated, apiRouter);

module.exports = app;
