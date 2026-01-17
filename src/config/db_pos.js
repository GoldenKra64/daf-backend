// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Retorna un pool usando las credenciales del usuario autenticado
 * (modelo POS con credenciales dinámicas)
 */
function getConnectionWithCredentials(user, password) {
  return new Pool({
    host: process.env.POS_HOST,
    port: process.env.POS_PORT,
    database: process.env.POS_NAME,
    user,
    password,
  });
}

module.exports = { getConnectionWithCredentials };