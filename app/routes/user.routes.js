const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get(
    "/api/user/:id",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.post(
    "/api/user/createleague",
    [authJwt.verifyToken],
    controller.createLeague
  );

  app.post(
    "/api/user/joinleague",
    [authJwt.verifyToken],
    controller.joinLeague
  );

  app.post(
    "/api/user/submitdeck",
    [authJwt.verifyToken],
    controller.submitDeck
  );

  app.post(
    "/api/user/registerleaguedeck",
    [authJwt.verifyToken],
    controller.registerLeagueDeck
  );

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.post(
    "/api/user/submitNewLightDarkPricing",
    [authJwt.verifyToken],
    controller.submitNewLightDarkPricing
  );

  app.post(
    "/api/user/submitNewEmbroideryPricing",
    [authJwt.verifyToken],
    controller.submitNewEmbroideryPricing
  );

  app.post(
    "/api/user/shirtprices",
    [authJwt.verifyToken],
    controller.getShirtPrices
  );

  app.post(
    "/api/user/embroideryprices",
    [authJwt.verifyToken],
    controller.getEmbroideryPrices
  );

  app.post(
    "/api/user/pricinglist",
    [authJwt.verifyToken],
    controller.getPricingList
  );

  app.post(
    "/api/user/getshirtpricequote",
    [authJwt.verifyToken],
    controller.getShirtPriceQuote
  );

  app.post(
    "/api/user/getembroiderypricequote",
    [authJwt.verifyToken],
    controller.getEmbroideryPriceQuote
  );

  app.post(
    "/api/user/getShirtPricingDisplay",
    [authJwt.verifyToken],
    controller.getShirtPricingDisplay
  );

  app.post(
    "/api/user/getEmbroideryPricingDisplay",
    [authJwt.verifyToken],
    controller.getEmbroideryPricingDisplay
  );
};

