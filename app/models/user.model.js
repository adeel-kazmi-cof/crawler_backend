module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    full_name: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    accounts_permissions: {
      type: Sequelize.STRING
    }
  });

  return User;
};
