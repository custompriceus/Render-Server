const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;

// force: true will drop the table if it already exists
const dropTables = 1
dropTables ?
  db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Database with { force: true }');
    initial()
  }) : db.sequelize.sync();

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(' ');
  console.log(process.env);
  console.log(' ');
  console.log(db.sequelize.config);
  console.log(' ');
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });

  Role.create({
    id: 2,
    name: "moderator"
  });

  Role.create({
    id: 3,
    name: "admin"
  });
}