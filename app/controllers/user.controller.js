const db = require("../models");
const config = require("../config/auth.config");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const User = db.user;
const Role = db.role; 
const userAccounts = db.userAccounts;

exports.getAll = (req, res) => {
  User.findAll()
    .then(users => {
      if (!users) {
        return res.status(404).send({ message: "User Not found." });
      }
      return res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });  
};

exports.getOne = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      return res.status(200).send(user);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getProfile = (req, res) => {
  let token = req.headers["authorization"];
  var TokenArray = token.split(" ");
  var userId = jwt.decode(TokenArray[1])
  User.findByPk(userId.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      return res.status(200).send(user);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
    
  
};

exports.changePassword = (req, res) => {
  let token = req.headers["authorization"];
  var TokenArray = token.split(" ");
  var userId = jwt.decode(TokenArray[1])
  User.findByPk(userId.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not Found." });
      }
     // console.log(req.body.current_password);
      var passwordIsValid = bcrypt.compareSync(
        req.body.current_password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      User.update({
        password: bcrypt.hashSync(req.body.new_password, 8)
      }, { where: { id: user.id } })
      .then(() => {
            return res.status(200).send({ message: "Password Changed Successfully!" });
        })
      .catch(err => {
            res.status(500).send({ message: err.message });
        });
      return res.status(200).send(user);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.register = (req, res) => {  
  User.create({    
    full_name: req.body.full_name,
    username: req.body.email,
    email: req.body.email,
    phone: req.body.phone,
    password: bcrypt.hashSync(req.body.password, 8)
    })
    .then(() => {
        return res.status(200).send({ message: "User Created Successfully!" });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });

  
};

exports.accountsPermissions = (req, res) => {  
 // console.log(req.body);
 // return;
 
  if(req.body.accounts_permissions.split(',').length > 0){
    try {
      for(accountId of req.body.accounts_permissions.split(',')) {  
        userAccounts.findOne({where: {'account_id' : accountId, 'user_id' : req.body.user_id}})
        .then(user => {
          if (!user) {
            userAccounts.create({    
              user_id: req.body.user_id,
              account_id: accountId
              });
          } else {
            userAccounts.update({
              user_id: req.body.user_id,
              account_id: accountId
            }, { where: {'account_id' : accountId, 'user_id' : req.body.user_id} });
            
          }
        });    
      };
      return res.status(200).send({ message: "User Accounts Permissions Saved Successfully!" });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  } else {
    res.status(500).send({ message: "No Account ID select" });
  }
}

exports.update = (req, res) => {  
  User.update({
    full_name: req.body.full_name,
    username: req.body.email,
    email: req.body.email,
    phone: req.body.phone
  }, { where: { id: req.params.id } })
    .then(() => {
          return res.status(200).send({ message: "User Updated Successfully!" });
      })
    .catch(err => {
          res.status(500).send({ message: err.message });
      });
  };
exports.delete = (req, res) => {  
  User.destroy({ where: { id: req.params.id } })
    .then(() => {
        return res.status(200).send({ message: "User Deleted Successfully!" });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });  
};


