const { Pool } = require('pg');
require('dotenv').config();

// Configuración limpia
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE, // O DB_NAME según tu .env
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getConnectionWithCredentials = (user, password) => {
  return new Pool({
    user: user,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: password,
    port: process.env.DB_PORT,
  });
};

module.exports = { pool, getConnectionWithCredentials };