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
const shirtQuantityBuckets = ['6-11', '12-36', '37-72', '73-144', '145-287', '288-499', '500-999', '1000-4999', '5000+']

const shirtColorQuantities = [1, 2, 3, 4, 5, 6];

const embroideryStitchBuckets = ['1-4999', '5000-6999', '7000-8999', '9000-10999', '11000-12999', '13000-14999', '15000-16999', '17000-18999', '19000-20999', '21000+']

const embroideryQuantityBuckets = [
  '1-5', '6-11', '12-23', '24-47', '48-99', '100-248', '249+']

const embroideryStitchBucketsForDisplay = ['1-5k', '5-7k', '7-9k', '9-11k', '11-13k', '13-15k', '15-17k', '17-19k', '19-21k', '21k+']

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

const embroideryShirtPrices = [
  {
    quantity: '1-5',
    stitches: '1-4999',
    price: 4.75
  },
  {
    quantity: '1-5',
    stitches: '5000-6999',
    price: 5.95
  },
  {
    quantity: '1-5',
    stitches: '7000-8999',
    price: 7.25
  },
  {
    quantity: '1-5',
    stitches: '9000-10999',
    price: 8.45
  },
  {
    quantity: '1-5',
    stitches: '11000-12999',
    price: 9.5
  },
  {
    quantity: '1-5',
    stitches: '13000-14999',
    price: 10.9
  },
  {
    quantity: '1-5',
    stitches: '15000-16999',
    price: 12.15
  },
  {
    quantity: '1-5',
    stitches: '17000-18999',
    price: 13.25
  },
  {
    quantity: '1-5',
    stitches: '19000-20999',
    price: 14.25
  },
  {
    quantity: '1-5',
    stitches: '21000+',
    price: 15.95
  },
  {
    quantity: '6-11',
    stitches: '1-4999',
    price: 4.75
  },
  {
    quantity: '6-11',
    stitches: '5000-6999',
    price: 5.5
  },
  {
    quantity: '6-11',
    stitches: '7000-8999',
    price: 6.85
  },
  {
    quantity: '6-11',
    stitches: '9000-10999',
    price: 7.85
  },
  {
    quantity: '6-11',
    stitches: '11000-12999',
    price: 9.00
  },
  {
    quantity: '6-11',
    stitches: '13000-14999',
    price: 10.25
  },
  {
    quantity: '6-11',
    stitches: '15000-16999',
    price: 11.3
  },
  {
    quantity: '6-11',
    stitches: '17000-18999',
    price: 12.4
  },
  {
    quantity: '6-11',
    stitches: '19000-20999',
    price: 13.5
  },
  {
    quantity: '6-11',
    stitches: '21000+',
    price: 14.75
  },

  {
    quantity: '12-23',
    stitches: '1-4999',
    price: 4.4
  },
  {
    quantity: '12-23',
    stitches: '5000-6999',
    price: 5.15
  },
  {
    quantity: '12-23',
    stitches: '7000-8999',
    price: 6.25
  },
  {
    quantity: '12-23',
    stitches: '9000-10999',
    price: 7.25
  },
  {
    quantity: '12-23',
    stitches: '11000-12999',
    price: 8.5
  },
  {
    quantity: '12-23',
    stitches: '13000-14999',
    price: 9.5
  },
  {
    quantity: '12-23',
    stitches: '15000-16999',
    price: 10.5
  },
  {
    quantity: '12-23',
    stitches: '17000-18999',
    price: 11.5
  },
  {
    quantity: '12-23',
    stitches: '19000-20999',
    price: 12.35
  },
  {
    quantity: '12-23',
    stitches: '21000+',
    price: 13.4
  },
  {
    quantity: '24-47',
    stitches: '1-4999',
    price: 4.1
  },
  {
    quantity: '24-47',
    stitches: '5000-6999',
    price: 4.8
  },
  {
    quantity: '24-47',
    stitches: '7000-8999',
    price: 5.8
  },
  {
    quantity: '24-47',
    stitches: '9000-10999',
    price: 6.75
  },
  {
    quantity: '24-47',
    stitches: '11000-12999',
    price: 8.0
  },
  {
    quantity: '24-47',
    stitches: '13000-14999',
    price: 8.9
  },
  {
    quantity: '24-47',
    stitches: '15000-16999',
    price: 9.8
  },
  {
    quantity: '24-47',
    stitches: '17000-18999',
    price: 10.75
  },
  {
    quantity: '24-47',
    stitches: '19000-20999',
    price: 11.25
  },
  {
    quantity: '24-47',
    stitches: '21000+',
    price: 12.1
  },
  {
    quantity: '48-99',
    stitches: '1-4999',
    price: 3.75
  },
  {
    quantity: '48-99',
    stitches: '5000-6999',
    price: 4.5
  },
  {
    quantity: '48-99',
    stitches: '7000-8999',
    price: 5.4
  },
  {
    quantity: '48-99',
    stitches: '9000-10999',
    price: 6.25
  },
  {
    quantity: '48-99',
    stitches: '11000-12999',
    price: 7.5
  },
  {
    quantity: '48-99',
    stitches: '13000-14999',
    price: 8.25
  },
  {
    quantity: '48-99',
    stitches: '15000-16999',
    price: 9.0
  },
  {
    quantity: '48-99',
    stitches: '17000-18999',
    price: 9.85
  },
  {
    quantity: '48-99',
    stitches: '19000-20999',
    price: 10.25
  },
  {
    quantity: '48-99',
    stitches: '21000+',
    price: 10.9
  },
  {
    quantity: '100-248',
    stitches: '1-4999',
    price: 3.5
  },
  {
    quantity: '100-248',
    stitches: '5000-6999',
    price: 4.25
  },
  {
    quantity: '100-248',
    stitches: '7000-8999',
    price: 5.0
  },
  {
    quantity: '100-248',
    stitches: '9000-10999',
    price: 5.75
  },
  {
    quantity: '100-248',
    stitches: '11000-12999',
    price: 6.8
  },
  {
    quantity: '100-248',
    stitches: '13000-14999',
    price: 7.5
  },
  {
    quantity: '100-248',
    stitches: '15000-16999',
    price: 8.25
  },
  {
    quantity: '100-248',
    stitches: '17000-18999',
    price: 9.0
  },
  {
    quantity: '100-248',
    stitches: '19000-20999',
    price: 9.5
  },
  {
    quantity: '100-248',
    stitches: '21000+',
    price: 10.0
  },
  {
    quantity: '249+',
    stitches: '1-4999',
    price: 3.25
  },
  {
    quantity: '249+',
    stitches: '5000-6999',
    price: 4.0
  },
  {
    quantity: '249+',
    stitches: '7000-8999',
    price: 5.0
  },
  {
    quantity: '249+',
    stitches: '9000-10999',
    price: 5.25
  },
  {
    quantity: '249+',
    stitches: '11000-12999',
    price: 6.8
  },
  {
    quantity: '249+',
    stitches: '13000-14999',
    price: 7.5
  },
  {
    quantity: '249+',
    stitches: '15000-16999',
    price: 8.25
  },
  {
    quantity: '249+',
    stitches: '17000-18999',
    price: 9.0
  },
  {
    quantity: '249+',
    stitches: '19000-20999',
    price: 9.5
  },
  {
    quantity: '249+',
    stitches: '21000+',
    price: 10.0
  }
]

const shirtBuckets = []

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

createLightAndDarkShirtPriceTable = async () => {
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

createEmbroideryShirtPriceTable = async () => {
  queryString = `CREATE TABLE IF NOT EXISTS embroideryshirtprices(
    id SERIAL PRIMARY KEY,
    quantity VARCHAR(255),
    stitches VARCHAR(255),
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

insertLightAndDarkShirtPrices = async () => {
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

insertEmbroideryShirtPrices = async () => {
  embroideryShirtPrices.map(async (shirt) => {
    console.log(shirt);

    const randInt = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
    try {
      const res = await pool.query(
        'INSERT INTO embroideryshirtprices (id,quantity,stitches,price) VALUES ($1,$2,$3,$4) RETURNING *',
        [randInt, shirt.quantity, shirt.stitches, shirt.price]
      )
      return res.rows[0];
    } catch (err) {
      console.log(err);
      return false;
    }

  })
}

app.post("/createLightAndDarkShirtPriceTable", async (req, res) => {
  createLightAndDarkShirtPriceTable();
  res.status(201).send('Tables Created');
});

app.post("/insertLightAndDarkShirtPrices", async (req, res) => {
  insertLightAndDarkShirtPrices();
  res.status(201).send('Prices Added');
});

app.post("/createEmbroideryShirtPriceTable", async (req, res) => {
  createEmbroideryShirtPriceTable();
  res.status(201).send('Tables Created');
});

app.post("/insertEmbroideryShirtPrices", async (req, res) => {
  insertEmbroideryShirtPrices();
  res.status(201).send('Prices Added');
});

app.get("/shirtPrices", async (req, res) => {
  const queryString = `SELECT * FROM shirtprices`;

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

app.get("/embroideryShirtPrices", async (req, res) => {
  const queryString = `SELECT * FROM embroideryshirtprices`;

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

app.get("/pricinglist", async (req, res) => {
  const queryStringOne = `SELECT * FROM shirtprices`;
  const queryStringTwo = `SELECT * FROM embroideryshirtprices`;
  let shirtPrices = [];
  let embroideryPrices = [];

  pool.query(
    queryStringOne,
    [],
    (error, results) => {
      if (error) {
        console.log(error);
        throw error;
      }
      shirtPrices = results.rows;
      pool.query(
        queryStringTwo,
        [],
        (error, results) => {
          if (error) {
            console.log(error);
            throw error;
          }
          embroideryPrices = results.rows;

          const shirtPricingBuckets = shirtQuantityBuckets.map(shirtQuantityBucket => {
            return {
              shirtQuantityBucket: shirtQuantityBucket,
              prices: shirtColorQuantities.map(colorQuantity => {
                return shirtPrices.find(element => element.colors === colorQuantity && element.quantity === shirtQuantityBucket)
              }).sort((a, b) => {
                if (a.colors > b.colors) return 1;
                if (a.colors < b.colors) return -1;
                return 0;
              })
            }
          })

          const embroideryPricingBuckets = embroideryQuantityBuckets.map(embroideryQuantityBucket => {
            return {
              embroideryQuantityBucket: embroideryQuantityBucket,
              prices: embroideryStitchBuckets.map(stitchBucket => {
                return embroideryPrices.find(element => element.stitches === stitchBucket && element.quantity === embroideryQuantityBucket);
              })
                .sort((a, b) => {
                  const stitchQuantityBucketA = parseInt(a.stitches.substring(a.stitches.indexOf("-") + 1, 100))
                  const stitchQuantityBucketB = parseInt(b.stitches.substring(b.stitches.indexOf("-") + 1, 100))

                  if (stitchQuantityBucketA > stitchQuantityBucketB) return 1;
                  if (stitchQuantityBucketA < stitchQuantityBucketB) return -1;
                  return 0;
                })
            }
          })

          res.status(201).send({
            shirtPrices: shirtPrices,
            embroideryPrices: embroideryPrices,
            shirtColorQuantities: shirtColorQuantities,
            embroideryQuantityBuckets: embroideryQuantityBuckets,
            embroideryStitchBuckets: embroideryStitchBucketsForDisplay,
            shirtPricingBuckets: shirtPricingBuckets,
            embroideryPricingBuckets: embroideryPricingBuckets
          });
        }
      );
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