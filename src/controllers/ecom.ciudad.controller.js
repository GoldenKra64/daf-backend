const { getConnection } = require('../config/db_ecom.js');
const {
  getAllQuery,
} = require('../models/ciudad.model.js');

// READ ALL
const getAll = async (req, res) => {
  const pool = getConnection();

  try {
    const result = await getAllQuery(pool);

    if (!result.length) {
      return res.status(200).json([]);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
  // No pool.end() because it is a shared pool now
};

module.exports = {
  getAll,
};