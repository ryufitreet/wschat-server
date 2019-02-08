const md5 = require('md5');

const initModel = (sequelize) => {
  const { Sequelize } = sequelize;
  
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    login: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    auth_token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });

  
  User.saltPassword = function(password) {
    let saltPassword = password;
    for (let i = 0; i<666; i++){
      saltPassword = md5(saltPassword);
    }
    return saltPassword;
  }

  User.addUser = function(login, password) {
    let saltPassword = this.saltPassword(password);

    return this.create({
      login,
      password: saltPassword,
    });
  }

  User.sync({force: true})
    .then(() => {
      User.create({
        login: 'admin',
        password: '4766a87e438f468a41f9b855a8c3cc4f',
      })
      User.create({
        login: 'second',
        password: '7042ef14dcb42a7160f4b433b010edbe',
      })
    });


  return User;
}

module.exports = initModel;