module.exports = (sequelize, Sequelize) => {
  const Account = sequelize.define("accounts", {
    account_name: {
      type: Sequelize.STRING
    },
    url: {
      type: Sequelize.STRING
    },
    user_name: {
      type: Sequelize.STRING
    },    
    password: {
      type: Sequelize.STRING
    },
    repeat_every: {
      type: Sequelize.STRING
    },
    start_time: {
      type: Sequelize.STRING
    }, 
    status: {
      type: Sequelize.SMALLINT
    },   
  }, {
    timestamps: false,
  });

  return Account;
};
