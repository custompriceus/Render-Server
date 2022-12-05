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
  const league = await dbService.createLeague(req.body.userId, req.body.leagueName);
  if (!league) {
    res.status(400).send({
      message: `Failed to create a league`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    if (!user) {
      res.status(400).send({
        message: `Failed to find user with id ${req.body.userId}`
      });
    }
    else {
      let userWithToken = user;

      userWithToken.accessToken = req.headers["x-access-token"];
      res.status(200).send(userWithToken);
    }
  }
};

exports.joinLeague = async (req, res) => {
  const leagueExists = await dbService.getLeagueById(req.body.leagueId)
  if (!leagueExists) {
    res.status(400).send({
      message: `Failed To Find League With Id ${req.body.leagueId}`
    });
  }
  else {
    if (leagueExists.id) {
      const league = await dbService.joinLeague(req.body.userId, req.body.leagueId);
      if (!league) {
        res.status(400).send({
          message: `Failed To Join League With Id ${req.body.leagueId}`
        });
      }
      else {
        const user = await dbService.getUserById(req.body.userId);
        let userWithToken = user;
        userWithToken.accessToken = req.headers["x-access-token"];

        res.status(200).send(userWithToken);
      }
    }
    else {
      res.status(400).send({
        message: `Failed To Find League With Id ${req.body.leagueId}`
      });
    }
  }
};

exports.submitDeck = async (req, res) => {
  const submittedDeck = await dbService.submitDeck(req.body.userId, req.body.deckName, req.body.deckUrl, req.body.deckPrice);
  if (!submittedDeck) {
    res.status(400).send({
      message: `Failed To Submit Deck`
    });
  }
  else {
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log(userWithToken);

    res.status(200).send(userWithToken);
  }
};

exports.registerLeagueDeck = async (req, res) => {
  const registeredLeagueDeck = await dbService.registerLeagueDeck(req.body.userId, req.body.deckDetails);
  console.log(registeredLeagueDeck);
  if (!registeredLeagueDeck) {
    res.status(400).send({
      message: `Failed To Register League Deck`
    });
  }
  else {
    console.log('in else');
    const user = await dbService.getUserById(req.body.userId);
    let userWithToken = user;
    userWithToken.accessToken = req.headers["x-access-token"];
    console.log(userWithToken);

    res.status(200).send(userWithToken);
  }
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
