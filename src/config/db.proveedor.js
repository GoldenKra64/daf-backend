const { Pool } = require('pg');
require('dotenv').config();

/**
 * Conexión del módulo Proveedor (POS) usando credenciales dinámicas.
 */
function getProveedorConnectionWithCredentials(user, password) {
  return new Pool({
    host: process.env.POS_HOST,
    port: process.env.POS_PORT,
    database: process.env.POS_NAME,
    user,
    password,
  });
}

module.exports = { getProveedorConnectionWithCredentials };
