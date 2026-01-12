const getAllQuery = async (pool) => {
  const query = 'SELECT trn_cod, trn_descripcion FROM transaccion ORDER BY trn_descripcion';
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  getAllQuery,
};