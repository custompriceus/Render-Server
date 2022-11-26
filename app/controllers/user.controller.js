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
      message: `Failed to find league with id ${req.body.leagueId}`
    });
  }
  else {
    if (leagueExists && leagueExists.id) {
      const league = await dbService.joinLeague(req.body.userId, req.body.leagueId);
      if (!league) {
        res.status(400).send({
          message: `Failed to join a league`
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
    }
    else {
      res.status(400).send({
        message: `Failed to find league with id ${req.body.leagueId}`
      });
    }
  }
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
