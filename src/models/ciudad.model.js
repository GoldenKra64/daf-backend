<<<<<<< HEAD
const getAllQuery = async (pool) => {
  const query = 'SELECT ct_codigo, ct_descripcion FROM ciudad ORDER BY ct_descripcion';
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllQuery,
};
=======
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,       // ← MISMO usuario del resto del POS
    password: process.env.DB_PASSWORD
});

const CiudadModel = {
    async findAll() {
        const query = `
            SELECT ct_codigo, ct_descripcion
            FROM ciudad
            ORDER BY ct_descripcion
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = CiudadModel;
>>>>>>> f14ea63 (Interfaz de Proveedor)
