const db = require("../models");
const config = require("../config/auth.config");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const User = db.user;
const Role = db.role; 

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
        return res.status(404).send({ message: "User Not found." });
      }
      console.log(req.body.current_password);
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


