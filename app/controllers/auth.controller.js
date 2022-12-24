const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require('dotenv').config();
const { dbService } = require("../services");

const verifyGoogleToken = async (token) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    let payload = ticket.getPayload();
    let payloadTest = {
      sub: payload.sub,
      email: payload.email
    }
    return payloadTest;
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
  console.log('google login');
  const googleId = req.body.sub ? { sub: req.body.sub, email: req.body.email } : await verifyGoogleToken(req.body.credential);

  await dbService.getUserByGoogleId(googleId.sub).then(async (responseTwo) => {
    if (!responseTwo) {
      await dbService.createUserByGoogleProfile(googleId.sub, googleId.email).then(async (responseThree) => {
        if (!responseThree) {
          res.status(400).send(
            `Failed to create user with email ${response.payload.email} and google_id ${googleId}`
          );
        }
        else {
          const signedInUser = await getUserByIdAndSignIn(responseThree.id);
          console.log('created google login user ', responseThree.id)
          res.status(200).send(signedInUser);
        }
      });
    }
    else {
      await getUserByIdAndSignIn(responseTwo.id).then(async (responseFour) => {
        console.log('google login user  ', responseFour)
        res.status(200).send(responseFour);
      })
    }
  })
};

exports.loginwithemail = async (req, res) => {
  console.log('login with email');
  await dbService.getUserByEmail(req.body.email).then(async (user) => {
    if (!user) {
      return res.status(404).send("User Not Found");
    }
    else {
      await dbService.checkPassword(user.password, req.body.password).then(async (passwordMatches) => {
        if (passwordMatches) {
          await getUserByIdAndSignIn(user.id).then(async (signedInUser) => {
            console.log('logged in with email ', signedInUser)
            res.status(200).send(signedInUser);
          })
        }
        else {
          res.status(400).send('Incorrect Password');
        }
      })
    }
  })
};

exports.signupwithemail = async (req, res) => {
  console.log('sign up with email');
  await dbService.getUserByEmail(req.body.email).then(async (user) => {
    if (!user) {
      await dbService.createUserWithPassword(req.body.email, req.body.password).then(async (createdUser) => {
        if (!createdUser) {
          res.status(400).send('There was a problem creating the user');
        }
        else {
          await getUserByIdAndSignIn(createdUser.id).then(async (signedInUser) => {
            console.log('signed up user ', signedInUser)
            res.status(200).send(signedInUser);
          })
        }
      })
    }
    else {
      res.status(400).send('User Already Exists');
    }
  })
};
