const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*'
}));

const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: true
});

pool.connect((err, client, done) => {
  if (err) {
    console.log('error');
    console.log(err);
  }
  else {
    console.log('pg connected');
  }
});

app.get("/", async (req, res) => {
  res.status(200).send('Healthy');
});

app.post("/deleteTables", async (req, res) => {

  pool.query(`DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;`, [], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).send(`All Tables Deleted`);
  });
});

createUsersTable = async () => {
  const queryString = `CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255)
    )`

  pool.query(
    queryString,
    [],
    (error, results) => {
      if (error) {
        throw error;
      }
      return results.rows;

    }
  );
}

createLeaguesTable = async () => {
  const queryString = `CREATE TABLE IF NOT EXISTS leagues(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
  creator_id INT NOT NULL,
  admin_id INT NOT NULL
    )`

  pool.query(
    queryString,
    [],
    (error, results) => {
      if (error) {
        throw error;
      }
      return results.rows;

    }
  );
}

createSeasonsTable = async () => {
  queryString = `CREATE TABLE IF NOT EXISTS seasons(
    id SERIAL,
  league_id INT NOT NULL,
  season_id INT NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  reveal_date TIMESTAMP,
  isFinished BOOLEAN,
  winner_id INT,
  PRIMARY KEY (league_id, season_id)
    )`

  pool.query(
    queryString,
    [],
    (error, results) => {
      if (error) {
        throw error;
      }
      return results.rows;

    }
  );
}

createLeagueRegistrationsTable = async () => {
  queryString = `CREATE TABLE IF NOT EXISTS league_registrations(
    id SERIAL,
  user_id INT NOT NULL,
  league_id INT NOT NULL,
  season_id INT NOT NULL,
  deck_id INT,
  PRIMARY KEY (user_id, league_id, season_id)
    )`

  pool.query(
    queryString,
    [],
    (error, results) => {
      if (error) {
        throw error;
      }
      return results.rows;

    }
  );
}

createDecksTable = async () => {
  queryString = `CREATE TABLE IF NOT EXISTS decks(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255),
    url VARCHAR(255)
    )`

  pool.query(
    queryString,
    [],
    (error, results) => {
      if (error) {
        throw error;
      }
      return results.rows;

    }
  );
}

app.post("/createTables", async (req, res) => {

  createUsersTable();
  createLeaguesTable();
  createSeasonsTable();
  createDecksTable();
  createLeagueRegistrationsTable();

  res.status(201).send('Tables Created');


});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});