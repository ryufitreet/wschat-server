const database = require('./database/database');
const Models = database.models;

const User = {};

const Message = {
    add(message, user_id) {
      console.log(message, user_id);
      return Models.Message.create({
          message,
          fk_user: user_id,
        })
          .then((result) => {
            const data = result.dataValues;

            return Models.User.findOne({
              where: {
                id: data.fk_user
              }
            })
              .then((result) => {
                 data.user = result.dataValues;
                 return data;
              })
          });
    }
};

module.exports = {
    User,
    Message,
}