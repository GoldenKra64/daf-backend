const getAllQuery = async (pool) => {
  const query = 'SELECT * FROM unidadmedida ORDER BY um_descripcion';
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllQuery,
};