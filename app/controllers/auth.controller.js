const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const axios = require('axios');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken")
const { user } = require("../models");
require('dotenv').config();

exports.login = async (req, res) => {
  if (req.body.credential) {
    if (req.body.type && req.body.type === "bearer") {
      const googleUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?bearer_token=" + req.body.credential
      axios({
        url: googleUrl,
        method: "POST",
      }).then(async (response) => {
        const user = await User.findOne({
          where: {
            email: response.data.email
          },
          raw: true
        }).catch(err => {
          console.log('in err');
          console.log(err);
          res.status(500).send({ message: err.message });
        });
        if (!user) {
          console.log('no user');
          const roles = [];
          // SET ROLES HERE
          User.create({
            email: response.data.email
          })
            .then(async (user) => {
              console.log('created a user');
              const userWithToken = signin(user);
              console.log(userWithToken);

              res.status(200).send(userWithToken);
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
        } else {
          console.log('already a user');
          const userWithToken = signin(user);
          console.log(userWithToken);

          res.status(200).send(userWithToken);
        }
      }).catch(err => {
        console.log('in error 2');
        console.log(err);
        res.status(500).send({ message: err.message });
      });
    }
  }
  else {
    console.log('no credential')
  }
};

const signin = (user) => {
  var token = jwt.sign({ id: user.id }, config.secret, {
    expiresIn: 86400 // 24 hours
  });

  var authorities = [];
  // user.getRoles().then(roles => {
  //   for (let i = 0; i < roles.length; i++) {
  //     authorities.push("ROLE_" + roles[i].name.toUpperCase());
  //   }
  //   return user;
  // });

  user.roles = authorities;
  user.accessToken = token;
  return user;
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
