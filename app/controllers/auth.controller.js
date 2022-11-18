const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const axios = require('axios');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken")
const { user } = require("../models");
const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

exports.login = async (request, response) => {
  console.log('at login');

};
// exports.login = async (req, res) => {
//   console.log('at login');
//   console.log(' ');
//   if (db) {
//     console.log('yes db')
//     if (db.sequelize) {
//       console.log('yes sequelize')
//       try {
//         await db.sequelize.authenticate();
//         console.log('sequelize authenticated')
//       } catch (err) {

//         console.log('cant auth sequelize');
//       }

//       // if (req.body.credential) {
//       //   console.log('credential');
//       //   console.log(' ');
//       //   if (req.body.type && req.body.type === "bearer") {
//       //     const googleUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?bearer_token=" + req.body.credential
//       //     // console.log(googleUrl);



//       //     // .then(() => {
//       //     //   console.log(' ');
//       //     //   console.log('Connection has been established successfully.');
//       //     //   console.log(' ');
//       //     // axios({
//       //     //   url: googleUrl,
//       //     //   method: "POST",
//       //     // }).then(async (response) => {
//       //     //   console.log('received a google profile');
//       //     //   console.log(response.data);
//       //     //   console.log(' ');
//       //     //   const user = await User.findOne({
//       //     //     where: {
//       //     //       email: response.data.email
//       //     //     },
//       //     //     raw: true
//       //     //   }).catch(err => {
//       //     //     console.log('in err');
//       //     //     console.log(err);
//       //     //     res.status(500).send({ message: err.message });
//       //     //   });
//       //     //   if (!user) {
//       //     //     console.log('no user');
//       //     //     console.log(' ');
//       //     //     const roles = [];
//       //     //     // SET ROLES HERE
//       //     //     User.create({
//       //     //       email: response.data.email
//       //     //     })
//       //     //       .then(user => {
//       //     //         console.log('got user');
//       //     //         //NEED TO SIGN IN HERE
//       //     //         // console.log(user);
//       //     //         console.log(' ');
//       //     //         res.status(200).send(user);
//       //     //         // if (roles) {
//       //     //         //   Role.findAll({
//       //     //         //     where: {
//       //     //         //       name: {
//       //     //         //         [Op.or]: req.body.roles
//       //     //         //       }
//       //     //         //     }
//       //     //         //   }).then(roles => {
//       //     //         //     user.setRoles(roles).then(() => {
//       //     //         //       res.status(200).send(user);
//       //     //         //     });
//       //     //         //   });
//       //     //         // } else {
//       //     //         //   // user role = 1
//       //     //         //   user.setRoles([1]).then(() => {
//       //     //         //     res.status(200).send(user);
//       //     //         //   });
//       //     //         // }
//       //     //       })
//       //     //   } else {
//       //     //     console.log('already a user');
//       //     //     // console.log(user);
//       //     //     // console.log(' ');
//       //     //     //NEED TO SIGN IN HERE;
//       //     //     res.status(200).send(user);

//       //     //   }
//       //     // }).catch(err => {
//       //     //   console.log('in error 2');
//       //     //   console.log(err);
//       //     //   res.status(500).send({ message: err.message });
//       //     // });
//       //     // })
//       //     // .catch(err => {
//       //     //   console.log('unable to connect', err);
//       //     //   // console.error('Unable to connect to the database:', err);
//       //     // });
//       //   }
//       // }
//     }
//     else {
//       console.log('no sequelize')
//     }
//   }
//   else {
//     console.log('no db object')
//   }

// };

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
  console.log('get users');
  console.log(process.env);

  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      console.log('error');
      throw error;
    }
    response.status(200).json(results.rows);
  });
  // res.status(200).send({ message: "ok" });
  // User.findAll()
  //   .then(users => {
  //     console.log('got users');
  //     console.log(users);
  //     if (!users) {
  //       console.log('no users');
  //       return res.status(404).send({ message: "Users Not found." });
  //     }
  //     res.status(200).send(users);
  //   })
  //   .catch(err => {
  //     console.log('in error');
  //     res.status(500).send({ message: err.message });
  //   });
};
