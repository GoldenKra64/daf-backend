const { getConnectionWithCredentials } = require('../config/db_pos.js');
const {
  getAllQuery,
} = require('../models/categoria.model');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

// READ ALL
const getAll = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await getAllQuery(pool);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron categorías' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

module.exports = {
  getAll,
};
