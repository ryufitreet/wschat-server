const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  operatorsAliases: false,

  pool: {
    max: 300,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: false,

  // SQLite only
  storage: './chat.db'
});

// Init User Model
const User = require('./models/user.js')(sequelize);
const Message = require('./models/message.js')(sequelize);

module.exports = {
  models: {
    User,
    Message,
  }
};