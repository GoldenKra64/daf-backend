const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.EC_HOST,
  port: process.env.EC_PORT,
  database: process.env.EC_NAME,
  user: process.env.EC_USER,
  password: process.env.EC_PASSWORD,
});

const getConnection = () => {
  return pool;
};

module.exports = {
  getConnection,
};