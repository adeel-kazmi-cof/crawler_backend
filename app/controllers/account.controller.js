const db = require("../models");
const config = require("../config/auth.config");
const Account = db.account;

exports.getAll = (req, res) => {
  Account.findAll()
    .then(accounts => {
      if (!accounts) {
        return res.status(404).send({ message: "Account Not found." });
      }
      return res.status(200).send(accounts);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getOne = (req, res) => {
    Account.findByPk(req.params.id)
      .then(accounts => {
        if (!accounts) {
          return res.status(404).send({ message: "Account Not found." });
        }
        return res.status(200).send(accounts);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };

exports.register = (req, res) => {  
  
  Account.create({
      user_name: req.body.user_name,
      account_name: req.body.account_name,
      url: req.body.url,
      password: req.body.password,
      repeat_every: req.body.repeat_every,
      start_time: req.body.start_time,
      status: req.body.status
      })
      .then(user => {
          return res.status(200).send({ message: "Account Created Successfully!" });
      })
      .catch(err => {
          res.status(500).send({ message: err.message });
      });
  
    
  };

  exports.update = (req, res) => {  
  
    Account.update({
      user_name: req.body.formDataFields.user_name,
      account_name: req.body.formDataFields.account_name,
      url: req.body.formDataFields.url,
      password: req.body.formDataFields.password,
      repeat_every: req.body.formDataFields.repeat_every,
      start_time: req.body.formDataFields.start_time,
      status: req.body.formDataFields.status
    }, { where: { id: req.params.id } })
        .then(user => {
            return res.status(200).send({ message: "Account Updated Successfully!" });
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        });
    };
exports.delete = (req, res) => {  
    Account.destroy({ where: { id: req.params.id } })
      .then(() => {
          return res.status(200).send({ message: "Account Deleted Successfully!" });
      })
      .catch(err => {
          res.status(500).send({ message: err.message });
      });  
  };