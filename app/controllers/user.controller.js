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
    res.status(200).send(user.toJSON());
  }
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
