const config = require("../config/auth.config");
const axios = require('axios');
var jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require('dotenv').config();
const { dbService } = require("../services");

const verifyGoogleToken = async (token) => {
  console.log(' ');
  console.log('verify google token ,', token)
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

  console.log('env ,', process.env.GOOGLE_CLIENT_ID)
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    console.log(' ');
    console.log('ticket ,', ticket)
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

const verifyBearerToken = async (token) => {
  const googleUrl = "https://www.googleapis.com/oauth2/v3/tokeninfo?bearer_token=" + token
  console.log(' ');
  console.log('google url ,', googleUrl)
  try {
    const ticket = await axios({
      url: googleUrl,
      method: "POST",
    })
    if (ticket) {
      console.log(' ');
      console.log('ticket ', ticket)
      return { payload: { id: ticket.data.user_id, email: ticket.data.email } };
    }
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

const getUserByIdAndSignIn = async (id) => {
  const userById = await dbService.getUserById(id);
  const signedInUser = signIn(userById);
  return signedInUser;
}

exports.login = async (req, res) => {
  console.log(' ')
  console.log('at login')
  console.log('body, ', req.body);
  const token = req.body.type === "bearer" ? await verifyBearerToken(req.body.credential) : await verifyGoogleToken(req.body.credential);
  console.log('token ,', token)
  const googleId = token.payload.id ? token.payload.id : token.payload.sub
  console.log(' ')
  console.log('google id, ', googleId);

  try {
    const userByGoogleId = await dbService.getUserByGoogleId(googleId);
    console.log(' ')
    console.log('user by google id, ', userByGoogleId)
    if (!userByGoogleId) {
      console.log(' ')
      console.log('no google user');
      const createdUser = await dbService.createUserByGoogleProfile(googleId, token.payload.email)
      if (!createdUser) {
        res.status(400).send({
          message: `Failed to create user with email ${token.payload.email} and google_id ${googleId}`
        });
      }
      else {
        console.log(' ')
        console.log('created a user, ', createdUser)
        const signedInUser = await getUserByIdAndSignIn(createdUser.id);
        console.log(' ')
        console.log('signed in user, ', signedInUser)
        res.status(200).send(signedInUser);
      }
    }
    else {
      const signedInUser = await getUserByIdAndSignIn(userByGoogleId.id);
      console.log(' ')
      console.log('already a user, signed in user, ', signedInUser)
      res.status(200).send(signedInUser);
    }

  } catch (error) {
    console.log(error);
    response.status(500).json({
      message: error.message || error,
    });
  }
};
