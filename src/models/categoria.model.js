const getAllQuery = async (pool) => {
  const query = 'SELECT * FROM categoria ORDER BY cat_descripcion';
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllQuery,
};
