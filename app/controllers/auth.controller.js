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
  console.log('at login');
  if (req.body.credential) {
    console.log('credential');
    console.log(req.body);
    if (req.body.type && req.body.type === "bearer") {
      const googleUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?bearer_token=" + req.body.credential
      try {
        axios({
          url: googleUrl,
          method: "POST",
        }).then(async (response) => {
          console.log('then');
          console.log(response.data);
          User.findOne({
            where: {
              email: response.data.email
            },
            raw: true
          })
            .then(user => {
              console.log('got a user');
              console.log(user);
              if (!user) {
                console.log('no user');
                const roles = [];
                // SET ROLES HERE
                User.create({
                  email: response.data.email
                })
                  .then(user => {
                    console.log('got user');
                    //NEED TO SIGN IN HERE
                    console.log(user);
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
                    console.log('in error 1');
                    console.log(err);
                    res.status(500).send({ message: err.message });
                  });
              }
              else {
                console.log('already a user');
                //NEED TO SIGN IN HERE;
                res.status(200).send(user);
              }
            })
            .catch(err => {
              console.log('error 2');
              console.log(err);
              res.status(500).send({ message: err.message });
            });


        }).catch(err => {
          console.log('error 3');
          console.log(err);
          res.status(500).json({
            message: err.message || err,
          });
        })
      } catch (err) {
        console.log('error 4');
        console.log(err);
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
  res.status(200).send({ message: "ok" });
  // User.findAll()
  //   .then(users => {
  //     if (!users) {
  //       return res.status(404).send({ message: "Users Not found." });
  //     }
  //     res.status(200).send(users);
  //   })
  //   .catch(err => {
  //     res.status(500).send({ message: err.message });
  //   });
};
