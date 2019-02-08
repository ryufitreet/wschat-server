const port = process.env.PORT || 8081;

const corsWhitelist = [
  'http://localhost:8080',
  'http://localhost:8081',
  'https://alex-karo.github.io',
  'http://192.168.1.29:8080'
];
const cors = {
  origin: function (origin, callback) {
    // TODO replace === undefined to adequate condition
    if (origin === undefined || corsWhitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

module.exports = {
  port,
  cors,
};