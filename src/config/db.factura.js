const { Pool } = require('pg');
require('dotenv').config();

/**
 * Conexión del módulo Factura (POS) usando credenciales dinámicas.
 */
function getFacturaConnectionWithCredentials(user, password) {
  return new Pool({
    host: process.env.POS_HOST,
    port: process.env.POS_PORT,
    database: process.env.POS_NAME,
    user,
    password,
  });
}

module.exports = { getFacturaConnectionWithCredentials };
