const getAllQuery = async (pool) => {
  const query = 'SELECT ct_codigo, ct_descripcion FROM ciudad ORDER BY ct_descripcion';
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllQuery,
};