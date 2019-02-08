const md5 = require('md5');

const initModel = (sequelize) => {
  const { Sequelize } = sequelize;

  const Message = sequelize.define('message', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    message: {
      type: Sequelize.STRING,
    },
  });

  Message.belongsTo(sequelize.models.user, {foreignKey: 'fk_user'});

  Message.sync({force: true})
    .then(() => {
      // Must be on User
      sequelize.models.user.findAll()
        .then((users) => {
          if (users.length) {
            const { id: fk_user } = users[0];
            Message.create({
              message: 'Very First Message',
              fk_user,
            })
          }          
        })
    });

  return Message;
}

module.exports = initModel;