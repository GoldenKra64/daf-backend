const { Pool } = require('pg');
require('dotenv').config();

const getConnectionWithCredentials = (user, password) => {
  return new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user,
    password,
  });
};

module.exports = {
  getConnectionWithCredentials,
};