const { Pool } = require('pg');
require('dotenv').config();

/**
 * Pool técnico exclusivo para el módulo Facturación
 * Usa las variables DB_* existentes
 * No afecta a otros módulos
 */
const facturaPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

module.exports = facturaPool;
