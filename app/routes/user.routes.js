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

  // app.get(
  //   "/api/user/:id",
  //   [authJwt.verifyToken],
  //   controller.userBoard
  // );

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
    controller.submitNewLightDarkPricing
  );

  app.post(
    "/api/user/submitNewEmbroideryPricing",
    controller.submitNewEmbroideryPricing
  );

  app.get(
    "/api/user/shirtprices",
    controller.getShirtPrices
  );

  app.get(
    "/api/user/embroideryprices",
    controller.getEmbroideryPrices
  );

  app.get(
    "/api/user/pricinglist",
    controller.getPricingList
  );

  app.post(
    "/api/user/getshirtpricequote",
    controller.getShirtPriceQuote
  );

  app.post(
    "/api/user/getembroiderypricequote",
    controller.getEmbroideryPriceQuote
  );

  app.get(
    "/api/user/getShirtPricingDisplay",
    controller.getShirtPricingDisplay
  );

  app.get(
    "/api/user/getEmbroideryPricingDisplay",
    controller.getEmbroideryPricingDisplay
  );
  app.post(
    "/api/user/saveScreenCharge",
    controller.saveScreenCharge
  );
app.get(
    "/api/user/getScreenCharge",
    controller.getScreenCharge
  );
 app.post(
    "/api/user/saveMaterialData",
    controller.saveMaterialData
  );
app.get(
    "/api/user/getMaterialData",
    controller.getMaterialData
  );

};

