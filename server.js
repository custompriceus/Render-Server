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
  // `SELECT a.id,a.google_id,a.email, ARRAY_REMOVE(ARRAY_AGG (b.league_id),NULL) as leaguetest,json_build_object('name',c.name) FROM users a FULL OUTER JOIN league_registrations b ON a.id = b.user_id FULL OUTER JOIN leagues c on c.id=b.league_id WHERE a.id='2' GROUP BY a.id,c.id ORDER BY a.id;`

  // `
  //  SELECT od.*,oe.*, ARRAY_REMOVE(ARRAY_AGG (od.id),NULL) leaguetest FROM league_registrations od
  //  INNER JOIN leagues oe
  //  ON oe.id=od.league_id GROUP BY od.id,oe.id`

  // `SELECT a.* FROM users a FULL OUTER JOIN (SELECT c.name,c.creator_id,c.admin_id,b.user_id FROM league_registrations b FULL OUTER JOIN leagues c on b.league_id = c.id) test ON test.user_id = a.id;`

  // `SELECT c.name,c.creator_id,c.admin_id,b.user_id FROM league_registrations b LEFT JOIN leagues c on b.league_id = c.id;`

  // [
  //   {
  //     "id": 1,
  //     "google_id": "100765043340969191539",
  //     "email": "jweinst4@gmail.com"
  //   },
  //   {
  //     "id": 2,
  //     "google_id": "101823395639017365071",
  //     "email": "thelastalaskn@gmail.com"
  //   }
  // ]

  // const queryString =
  //   `SELECT a.id,a.google_id,a.email, ARRAY_REMOVE(ARRAY_AGG (b.league_id),NULL) as league_ FROM users a INNER JOIN league_registrations b ON a.id = b.user_id WHERE a.id='2' GROUP BY a.id ORDER BY a.id;`

  // try {
  //   let response = await pool.query(
  //     queryString
  //   );
  //   if (response.rows[0].league_.length > 0) {
  //     const leaguesArray = response.rows[0].league_;

  //     const newString =
  //       `SELECT users.email,leagues.id,leagues.name FROM leagues FULL OUTER JOIN league_registrations ON leagues.id = league_registrations.league_id FULL OUTER JOIN users on league_registrations.user_id = users.id WHERE leagues.id IN (${leaguesArray})`
  //     // `SELECT users.email,leagues.id,leagues.name FROM leagues FULL OUTER JOIN league_registrations ON leagues.id = league_registrations.league_id FULL OUTER JOIN users on league_registrations.user_id = users.id WHERE leagues.id IN (${leaguesArray})`

  //     try {
  //       const updatedResponse = await pool.query(
  //         newString
  //       );
  //       if (updatedResponse && updatedResponse.rows) {
  //         response.rows[0].leaguedetails = updatedResponse.rows;
  //       }
  //       else {
  //         res.status(400).send({
  //           message: "Failed to get league details"
  //         });
  //       }
  //     } catch (error) {
  //       res.status(400).send({
  //         message: "Failed to get league details"
  //       });
  //     }
  //   }

  //   res.status(200).send(response.rows[0]);
  // } catch (err) {
  //   res.status(400).send({
  //     message: "Failed to get user by id"
  //   });
  // }
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

createLeagueRegistrationsTable = async () => {
  queryString = `CREATE TABLE IF NOT EXISTS league_registrations(
    id SERIAL,
  user_id INT NOT NULL,
  league_id INT NOT NULL,
  PRIMARY KEY (user_id, league_id)
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