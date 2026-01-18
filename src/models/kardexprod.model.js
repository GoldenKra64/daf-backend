const createKardexPrd = async (pool, data) => {
  const query = `
    CALL sp_insert_kardex_prd($1, $2, $3, $4, $5, $6)
  `;

  const values = [
    data.prd_codigo,
    data.trn_cod,
    data.krd_cantidad,
    data.krd_razon,
    data.est_cod || null, data.usr_id
  ];

  await pool.query(query, values);
  return { message: 'Movimiento registrado correctamente' };
};

const getAllKardexPrd = async (pool, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const query = `
      SELECT 
          kp.krd_id,
          kp.prd_codigo,
          p.prd_nombre,
          kp.trn_cod,
          kp.krd_cantidad,
          kp.krd_fecha,
          kp.usr_id,
          kp.krd_razon,
          kp.est_cod
      FROM kardex_producto kp
      INNER JOIN producto p ON kp.prd_codigo = p.prd_codigo
      ORDER BY kp.krd_fecha DESC
      LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const getKardexPrdByProduct = async (pool, prd_codigo, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const query = `
      SELECT 
          kp.krd_id,
          kp.prd_codigo,
          p.prd_nombre,
          kp.trn_cod,
          kp.krd_cantidad,
          kp.krd_fecha,
          kp.usr_id,
          kp.krd_razon,
          kp.est_cod
      FROM kardex_producto kp
      INNER JOIN producto p ON kp.prd_codigo = p.prd_codigo
      WHERE kp.prd_codigo = $1
      ORDER BY kp.krd_fecha DESC
      LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [prd_codigo, limit, offset]);
  return result.rows;
};

const getCountKardexPrd = async (pool) => {
  const query = 'SELECT COUNT(*) FROM kardex_producto';
  const result = await pool.query(query);
  return result.rows[0].count;
};

const getCountKardexPrdByProduct = async (pool, prd_codigo) => {
  const query = 'SELECT COUNT(*) FROM kardex_producto WHERE prd_codigo = $1';
  const result = await pool.query(query, [prd_codigo]);
  return result.rows[0].count;
};

module.exports = {
  createKardexPrd,
  getAllKardexPrd,
  getKardexPrdByProduct,
  getCountKardexPrd,
  getCountKardexPrdByProduct
};
