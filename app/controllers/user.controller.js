const { dbService } = require("../services");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = async (req, res) => {
  const user = await dbService.getUserById(req.params.id);
  if (!user) {
    res.status(400).send({
      message: `Failed to find user with id ${req.params.id}`
    });
  }
  else {
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];

    res.status(200).send(user);
  }
};

exports.createLeague = async (req, res) => {
  console.log('at create league for user ', req.body.userId)
  const league = await dbService.createLeague(req.body.userId, req.body.leagueName);
  if (!league) {
    console.log(`failed to create a league for user ${req.body.userId}`);
    res.status(400).send({
      message: `Failed to create a league`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    if (!user) {
      console.log(`failed to find user with id ${req.body.userId}`);
      res.status(400).send({
        message: `Failed to find user with id ${req.body.userId}`
      });
    }
    else {
      let userWithToken = user;

      userWithToken.accessToken = req.headers["x-access-token"];
      console.log(`created a league for user ${req.body.userId}`);
      res.status(200).send(userWithToken);
    }
  }
};

exports.joinLeague = async (req, res) => {
  console.log('at join league for user ', req.body.userId)
  const leagueExists = await dbService.getLeagueById(req.body.leagueId)
  if (!leagueExists) {
    console.log(`Failed To Find League With Id ${req.body.leagueId} for user ${req.body.userId}`);
    res.status(400).send({
      message: `Failed To Find League With Id ${req.body.leagueId}`
    });
  }
  else {
    if (leagueExists.id) {
      const league = await dbService.joinLeague(req.body.userId, req.body.leagueId);
      if (!league) {
        console.log(`Failed To join League With Id ${req.body.leagueId} for user ${req.body.userId}`);
        res.status(400).send({
          message: `Failed To Join League With Id ${req.body.leagueId}`
        });
      }
      else {
        const user = await dbService.getUserById(req.body.userId);
        let userWithToken = user;
        userWithToken.accessToken = req.headers["x-access-token"];
        console.log(`joined league with id ${req.body.leagueId} for user ${req.body.userId}`);

        res.status(200).send(userWithToken);
      }
    }
    else {
      console.log(`Failed To Find League With Id ${req.body.leagueId} for user ${req.body.userId}`);
      res.status(400).send({
        message: `Failed To Find League With Id ${req.body.leagueId}`
      });
    }
  }
};

exports.submitDeck = async (req, res) => {
  console.log('at create deck for user ', req.body.userId)
  const submittedDeck = await dbService.submitDeck(req.body.userId, req.body.deckName, req.body.deckUrl, req.body.deckPrice);
  if (!submittedDeck) {
    console.log('failed to create deck for user ', req.body.userId)
    res.status(400).send({
      message: `Failed To Submit Deck`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log('created deck for user ', req.body.userId)

    res.status(200).send(userWithToken);
  }
};

exports.registerLeagueDeck = async (req, res) => {
  console.log('at register league deck for user ', req.body.userId)
  const registeredLeagueDeck = await dbService.registerLeagueDeck(req.body.userId, req.body.deckDetails);
  if (!registeredLeagueDeck) {
    console.log('failed to register league deck for user ', req.body.userId)
    res.status(400).send({
      message: `Failed To Register League Deck`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log('league deck registered for user ', req.body.userId)

    res.status(200).send(userWithToken);
  }
};

exports.submitNewLightDarkPricing = async (req, res) => {
  console.log('at update light dark prices')
  if (req.body && req.body.newPrices && req.body.newPrices.map && req.body.newPrices.length > 0) {
    const response = await Promise.all(req.body.newPrices.map(async (newPrice) => {
      await dbService.updateShirtPrice(newPrice.colors, newPrice.quantity, newPrice.price)
    }))
    if (response) {
      console.log('light dark prices updated')
      res.status(200).send('Light Dark Prices Updated');
    }
    else {
      console.log('failed to update light dark prices')
      res.status(400).send(`Failed To Update Light Dark Prices`);
    }
  }
};

exports.submitNewEmbroideryPricing = async (req, res) => {
  console.log('at update embroidery prices')
  if (req.body && req.body.newPrices && req.body.newPrices.map && req.body.newPrices.length > 0) {
    const response = await Promise.all(req.body.newPrices.map(async (newPrice) => {
      await dbService.updateEmbroideryPrice(newPrice.stitches, newPrice.quantity, newPrice.price)
    }))
    if (response) {
      console.log('embroidery prices updated')
      res.status(200).send('Embroidery Prices Updated');
    }
    else {
      console.log('failed to update embroidery prices')
      res.status(400).send(`Failed To Update Embroidery Prices`);
    }
  }
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
