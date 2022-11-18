const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const axios = require('axios');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
const e = require("cors");
const { user } = require("../models");

exports.login = async (req, res) => {
  if (req.body.credential) {
    if (req.body.type && req.body.type === "bearer") {
      const googleUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?bearer_token=" + req.body.credential
      try {
        axios({
          url: googleUrl,
          method: "POST",
        }).then(async (response) => {
          User.findOne({
            where: {
              email: response.data.email
            },
            raw: true
          })
            .then(user => {
              if (!user) {
                console.log('no user');
                const roles = [];
                // SET ROLES HERE
                User.create({
                  email: response.data.email
                })
                  .then(user => {
                    //NEED TO SIGN IN HERE
                    res.status(200).send(user);
                    // if (roles) {
                    //   Role.findAll({
                    //     where: {
                    //       name: {
                    //         [Op.or]: req.body.roles
                    //       }
                    //     }
                    //   }).then(roles => {
                    //     user.setRoles(roles).then(() => {
                    //       res.status(200).send(user);
                    //     });
                    //   });
                    // } else {
                    //   // user role = 1
                    //   user.setRoles([1]).then(() => {
                    //     res.status(200).send(user);
                    //   });
                    // }
                  })
                  .catch(err => {
                    return { message: err.message };
                  });
              }
              else {
                console.log('already a user');
                res.status(200).send(user);
              }
            })
            .catch(err => {
              res.status(500).send({ message: err.message });
            });


        }).catch(err => {
          res.status(500).json({
            message: err.message || err,
          });
        })
      } catch (err) {
        res.status(500).json({
          message: err.message || err,
        });
      }
    }
  }
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }


      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }

  next();
};

exports.getusers = async (req, res) => {
  User.findAll()
    .then(users => {
      if (!users) {
        return res.status(404).send({ message: "Users Not found." });
      }
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
