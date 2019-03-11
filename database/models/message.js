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
            let prms = Message.create({
              message: `Message Number ${0}`,
              fk_user,
            });
            for (let i of Array(300).keys()) {
              if (i === 0) continue;
              prms = prms.then(() => {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    Message.create({
                      message: `Message Number ${i}`,
                      fk_user,
                    })
                    .then(()=> resolve());
                  },5);
                });                  
              });
            }            
          }          
        })
    });

  return Message;
}

module.exports = initModel;