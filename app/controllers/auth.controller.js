const config = require("../config/auth.config");
const axios = require('axios');
var jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require('dotenv').config();
const { dbService } = require("../services");

const verifyGoogleToken = async (token) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);

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
    return { payload: { id: ticket.data.user_id, email: ticket.data.email } };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

const signIn = (user) => {
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

  // user.roles = authorities;
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
  const googleId = token.payload.id ? token.payload.id : token.payload.sub
  const user = await dbService.getUserByGoogleId(googleId)

  if (!user) {
    const createdUser = await dbService.createUserByGoogleProfile(googleId, token.payload.email)
    if (!createdUser) {
      res.status(400).send({
        message: `Failed to create user with email ${token.payload.email} and google_id ${googleId}`
      });
    }
    else {
      const signedInUser = signIn(createdUser.toJSON())
      res.status(200).send(signedInUser);
    }
  }
  else {
    const signedInUser = signIn(user.toJSON())
    res.status(200).send(signedInUser);
  }
};
