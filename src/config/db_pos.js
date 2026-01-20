const { Pool } = require('pg');
require('dotenv').config();

function getConnectionWithCredentials() {
  return new Pool({
    host: process.env.POS_HOST,
    port: process.env.POS_PORT,
    database: process.env.POS_NAME,
    user: process.env.POS_DB_USER,
    password: process.env.POS_DB_PASSWORD,
  });
}

module.exports = {
  getConnectionWithCredentials,
};
