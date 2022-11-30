const config = require("../config/auth.config");
const axios = require('axios');
var jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require('dotenv').config();
const { dbService } = require("../services");

const verifyGoogleToken = async (token) => {
  console.log(' ');
  console.log('at verify google token ,')
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

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
  return new Promise((resolve, reject) => {
    axios({
      url: `https://oauth2.googleapis.com/tokeninfo`,
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Referrer-Policy": "no-referrer-when-downgrade",
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
      }
    })
      .then(res => {
        resolve(res)
      })
      .catch(err => {
        console.log('error');
        console.log(err)
        reject(err)
      })
  })
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


const getToken = async (type, credential) => {
  console.log(' ');
  console.log('at get token - GET TOKEN START');
  const token = type === "bearer" ? await verifyBearerToken(credential) : await verifyGoogleToken(credential);


  if (token) {
    console.log(' ');
    console.log('got a token at get token - GET TOKEN END')
    console.log('status ', token.status ? token.status : null)
    console.log('status text', token.statusText ? token.statusText : null)
    console.log('url', token.config && token.config.url ? token.config.url : null)
    console.log('data', token.data ? token.data : null)

    return token.data ? { payload: token.data } : token
  }
  else {
    console.log(' ');
    console.log('no token at get token - GET TOKEN END')
    return false;
  }

}

exports.login = async (req, res) => {
  console.log(' ')
  console.log('at login - START')
  await getToken(req.body.type, req.body.credential).then(async (response) => {
    console.log(' ');
    console.log('got token ', response);

    const googleId = response.payload.sub

    await dbService.getUserByGoogleId(googleId).then(async (responseTwo) => {
      if (!responseTwo) {
        console.log(' ')
        console.log('no google user');
        await dbService.createUserByGoogleProfile(googleId, response.payload.email).then(async (responseThree) => {
          if (!responseThree) {
            res.status(400).send({
              message: `Failed to create user with email ${response.payload.email} and google_id ${googleId}`
            });
          }
          else {
            console.log(' ')
            console.log('created a user')
            const signedInUser = await getUserByIdAndSignIn(responseThree.id);
            console.log(' ')
            console.log('signed in user')
            res.status(200).send(signedInUser);
          }
        });
      }
      else {
        await getUserByIdAndSignIn(responseTwo.id).then(async (responseFour) => {
          console.log(' ')
          console.log('already a user, signed in user')
          res.status(200).send(responseFour);
        })
      }
    })
  })
};
