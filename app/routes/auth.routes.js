const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/login",
    [

    ],
    controller.login
  );

  app.post(
    "/api/auth/logintest",
    [

    ],
    controller.logintest
  );

  app.post(
    "/api/auth/loginwithemail",
    [

    ],
    controller.loginwithemail
  );

  app.post(
    "/api/auth/signupwithemail",
    [

    ],
    controller.signupwithemail
  );
};
