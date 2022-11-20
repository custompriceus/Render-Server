const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const axios = require('axios');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken")
const { user } = require("../models");
require('dotenv').config();
const { OAuth2Client } = require("google-auth-library");
const { val } = require("objection");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

const verifyBearerToken = async (token) => {
  const googleUrl = "https://www.googleapis.com/oauth2/v1/tokeninfo?bearer_token=" + token
  try {
    const ticket = await axios({
      url: googleUrl,
      method: "POST",
    })
    return { payload: ticket.data };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

const getUserByEmail = async (email) => {
  try {
    return await User.findOne({
      where: {
        email: email
      }
    })
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

const createUserByEmail = async (email) => {
  const roles = [];

  try {
    const user = await User.create({
      email: email
    })

    // if (roles) {
    //   Role.findAll({
    //     where: {
    //       name: {
    //         [Op.or]: req.body.roles
    //       }
    //     }
    //   }).then(roles => {
    //     user.setRoles(roles).then(() => {
    //       return user;
    //     });
    //   });
    // } else {
    //   // user role = 1
    //   user.setRoles([1]).then(() => {
    //     return user;
    //   });
    // }
    return user;
  } catch (error) {
    return { error: "Unable to create user. Please try again" };
  }
}

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

exports.login = async (req, res) => {
  const token = req.body.type === "bearer" ? await verifyBearerToken(req.body.credential) : await verifyGoogleToken(req.body.credential);

  const user = await getUserByEmail(token.payload.email)

  if (!user) {
    const createdUser = await createUserByEmail(token.payload.email)

    if (!createdUser) {
      res.status(400).send({
        message: `Failed to create user with email ${token.payload.email}`
      });
    }
    else {
      res.status(200).send(signin(createdUser.toJSON()));
    }
  }
  else {
    res.status(200).send(signin(user.toJSON()));
  }
};
