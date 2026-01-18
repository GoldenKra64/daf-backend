const { Pool } = require('pg');
require('dotenv').config();

// Configuración limpia (Preservada para el servidor)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getConnectionWithCredentials = (user, password) => {
  return new Pool({
    host: process.env.POS_HOST,
    port: process.env.POS_PORT,
    database: process.env.POS_NAME,
    user,
    password,
  });
};

module.exports = { pool, getConnectionWithCredentials };
