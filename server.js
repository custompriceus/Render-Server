const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();
var Sequelize = require('sequelize'),
  pg = require('pg');

const app = express();

var corsOptions = {
  origin: "*",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept",
};

// app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*'
}));

// database
const db = require("./app/models");
const Role = db.role;

const connectionUrl = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}/${process.env.PGDATABASE}?ssl=1`
console.log(connectionUrl);

const pgsql = require('knex')({
  client: 'pg',
  connection: connectionUrl
})

pgsql.raw("SELECT 1").then(() => {
  console.log("PostgreSQL connected");
})
  .catch((e) => {
    console.log("PostgreSQL not connected");
    console.error(e);
  });

// db.sequelize.sync({ force: true }).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial()
// })



// init = async function (callback) {
//   console.log('at init');
//   const url = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:5432/${process.env.PGDATABASE}?ssl=1`
//   console.log(url)
//   var sequelize = new Sequelize(url);

//   try {
//     await sequelize.authenticate();
//     console.log('sequelize authenticated here')
//   } catch (err) {
//     console.log(err);
//     console.log('cant auth sequelize');
//   }

// };

// simple route

// init();
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

app.post("/createTables", async (req, res) => {
  db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Database with { force: true }');
    initial()
    res.json({ message: "Created Tables" });
  })
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
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