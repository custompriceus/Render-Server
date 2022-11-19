require('dotenv').config();

module.exports = {
  HOST: process.env.PGHOST,
  USER: process.env.PGUSER,
  PASSWORD: process.env.PGPASSWORD,
  DB: process.env.PGDATABASE,
  dialect: "postgres",
  protocol: 'postgres',
  dialectOptions: {
    ssl: process.env.PGHOST !== 'localhost' ? true : false,
    native: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};