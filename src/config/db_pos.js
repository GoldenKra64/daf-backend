const { Pool } = require('pg');
require('dotenv').config();

const getConnectionWithCredentials = (user, password) => {
  return new Pool({
    host: process.env.POS_HOST,
    port: process.env.POS_PORT,
    database: process.env.POS_NAME,
    user,
    password,
  });
};

module.exports = { getConnectionWithCredentials };