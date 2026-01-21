const createKardexPrd = async (pool, data) => {
  const query = `
    CALL sp_insert_kardex_prd($1, $2, $3, $4, $5)
    `;

  const values = [
    data.prd_codigo,
    data.trn_cod,
    data.krd_cantidad,
    data.krd_razon,
    data.est_cod || null
  ];

  await pool.query(query, values);
  return { message: 'Movimiento registrado correctamente' };
};

const getAllKardexPrd = async (pool, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      kp.krd_codigo,
      kp.prd_codigo,
      p.prd_nombre as prd_descripcion,
      kp.trn_cod,
      t.trn_descripcion,
      kp.krd_cantidad,
      kp.krd_fechahora,
      kp.usr_id,
      kp.krd_razon,
      kp.est_cod
    FROM kardex_prd kp
    INNER JOIN producto p ON kp.prd_codigo = p.prd_codigo
    INNER JOIN transaccion t ON kp.trn_cod = t.trn_cod
    ORDER BY kp.krd_fechahora DESC
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
      kp.krd_codigo,
      kp.prd_codigo,
      p.prd_nombre as prd_descripcion,
      kp.trn_cod,
      t.trn_descripcion,
      kp.krd_cantidad,
      kp.krd_fechahora,
      kp.usr_id,
      kp.krd_razon,
      kp.est_cod
    FROM kardex_prd kp
    INNER JOIN producto p ON kp.prd_codigo = p.prd_codigo
    INNER JOIN transaccion t ON kp.trn_cod = t.trn_cod
    WHERE kp.prd_codigo = $1
    ORDER BY kp.krd_fechahora DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [prd_codigo, limit, offset]);
  return result.rows;
};

const getCountKardexPrd = async (pool) => {
  const query = "SELECT COUNT(*) FROM kardex_prd";
  const result = await pool.query(query);
  return result.rows[0].count;
};

const getCountKardexPrdByProduct = async (pool, prd_codigo) => {
  const query = "SELECT COUNT(*) FROM kardex_prd WHERE prd_codigo = $1";
  const result = await pool.query(query, [prd_codigo]);
  return result.rows[0].count;
};

const deleteKardexPrd = async (pool, id) => {
  const query = "DELETE FROM kardex_prd WHERE TRIM(krd_codigo) = TRIM($1)";
  const result = await pool.query(query, [id]);
  return result;
};


module.exports = {
  createKardexPrd,
  getAllKardexPrd,
  getKardexPrdByProduct,
  getCountKardexPrd,
  getCountKardexPrdByProduct,
  deleteKardexPrd
};