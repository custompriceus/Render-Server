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

const shirtPrices = [
  {
    quantity: '6-11',
    colors: 1,
    price: 3
  },
  {
    quantity: '6-11',
    colors: 2,
    price: 4
  },
  {
    quantity: '6-11',
    colors: 3,
    price: 5.55
  },
  {
    quantity: '6-11',
    colors: 4,
    price: 7.5
  },
  {
    quantity: '6-11',
    colors: 5,
    price: 9.0
  },
  {
    quantity: '6-11',
    colors: 6,
    price: 11
  },
  {
    quantity: '12-36',
    colors: 1,
    price: 1.95
  },
  {
    quantity: '12-36',
    colors: 2,
    price: 3.00
  },
  {
    quantity: '12-36',
    colors: 3,
    price: 4.1
  },
  {
    quantity: '12-36',
    colors: 4,
    price: 5.2
  },
  {
    quantity: '12-36',
    colors: 5,
    price: 6.75
  },
  {
    quantity: '12-36',
    colors: 6,
    price: 7.5
  },
  {
    quantity: '37-72',
    colors: 1,
    price: 1.2
  },
  {
    quantity: '37-72',
    colors: 2,
    price: 2.25
  },
  {
    quantity: '37-72',
    colors: 3,
    price: 3.2
  },
  {
    quantity: '37-72',
    colors: 4,
    price: 3.6
  },
  {
    quantity: '37-72',
    colors: 5,
    price: 4.5
  },
  {
    quantity: '37-72',
    colors: 6,
    price: 5.5
  },
  {
    quantity: '73-144',
    colors: 1,
    price: .9
  },
  {
    quantity: '73-144',
    colors: 2,
    price: 1.85
  },
  {
    quantity: '73-144',
    colors: 3,
    price: 2.25
  },
  {
    quantity: '73-144',
    colors: 4,
    price: 2.6
  },
  {
    quantity: '73-144',
    colors: 5,
    price: 3.5
  },
  {
    quantity: '73-144',
    colors: 6,
    price: 4.25
  },
  {
    quantity: '145-287',
    colors: 1,
    price: .85
  },
  {
    quantity: '145-287',
    colors: 2,
    price: 1.3
  },
  {
    quantity: '145-287',
    colors: 3,
    price: 1.7
  },
  {
    quantity: '145-287',
    colors: 4,
    price: 2.25
  },
  {
    quantity: '145-287',
    colors: 5,
    price: 2.75
  },
  {
    quantity: '145-287',
    colors: 6,
    price: 3.25
  },
  {
    quantity: '288-499',
    colors: 1,
    price: .65
  },
  {
    quantity: '288-499',
    colors: 2,
    price: 1.0
  },
  {
    quantity: '288-499',
    colors: 3,
    price: 1.35
  },
  {
    quantity: '288-499',
    colors: 4,
    price: 1.65
  },
  {
    quantity: '288-499',
    colors: 5,
    price: 2.25
  },
  {
    quantity: '288-499',
    colors: 6,
    price: 2.75
  },
  {
    quantity: '500-999',
    colors: 1,
    price: .55
  },
  {
    quantity: '500-999',
    colors: 2,
    price: .85
  },
  {
    quantity: '500-999',
    colors: 3,
    price: 1
  },
  {
    quantity: '500-999',
    colors: 4,
    price: 1.2
  },
  {
    quantity: '500-999',
    colors: 5,
    price: 1.55
  },
  {
    quantity: '500-999',
    colors: 6,
    price: 1.8
  },
  {
    quantity: '1000-4999',
    colors: 1,
    price: .5
  },
  {
    quantity: '1000-4999',
    colors: 2,
    price: .6
  },
  {
    quantity: '1000-4999',
    colors: 3,
    price: .7
  },
  {
    quantity: '1000-4999',
    colors: 4,
    price: 1
  },
  {
    quantity: '1000-4999',
    colors: 5,
    price: 1.25
  },
  {
    quantity: '1000-4999',
    colors: 6,
    price: 1.5
  },
  {
    quantity: '5000+',
    colors: 1,
    price: .45
  },
  {
    quantity: '5000+',
    colors: 2,
    price: .55
  },
  {
    quantity: '5000+',
    colors: 3,
    price: .65
  },
  {
    quantity: '5000+',
    colors: 4,
    price: .8
  },
  {
    quantity: '5000+',
    colors: 5,
    price: 1.1
  },
  {
    quantity: '5000+',
    colors: 6,
    price: 1.25
  }
]

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
  deck_reveal_date TIMESTAMP,
  is_finished BOOLEAN,
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
    deck_name VARCHAR(255),
    deck_url VARCHAR(255),
    deck_price FLOAT
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

createShirtPriceTable = async () => {
  queryString = `CREATE TABLE IF NOT EXISTS shirtprices(
    id SERIAL PRIMARY KEY,
    quantity VARCHAR(255),
    colors INT,
    price FLOAT
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

insertShirtPrices = async () => {
  shirtPrices.map(async (shirt) => {

    const randInt = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
    try {
      const res = await pool.query(
        'INSERT INTO shirtprices (id,quantity,colors,price) VALUES ($1,$2,$3,$4) RETURNING *',
        [randInt, shirt.quantity, shirt.colors, shirt.price]
      )
      return res.rows[0];
    } catch (err) {
      console.log(err);
      return false;
    }

  })
}

app.post("/createShirtPriceTable", async (req, res) => {
  createShirtPriceTable();
  res.status(201).send('Tables Created');
});

app.post("/insertShirtPrices", async (req, res) => {
  insertShirtPrices();
  res.status(201).send('Prices Added');
});

app.get("/shirtPrices", async (req, res) => {
  queryString = `SELECT * FROM shirtprices`;

  pool.query(
    queryString,
    [],
    (error, results) => {
      if (error) {
        console.log(error);
        throw error;
      }
      res.status(201).send(results.rows);
    }
  );
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});