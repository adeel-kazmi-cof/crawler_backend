module.exports = (sequelize, Sequelize) => {
  const UserAccounts = sequelize.define("user_accounts", {
    user_id: {
      type: Sequelize.INTEGER
    },
    account_id: {
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false,
  });

  return UserAccounts;
};
