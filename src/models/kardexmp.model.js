const createKardexMP = async (pool, data) => {
  const query = `
    CALL sp_insert_kardex_mp($1, $2, $3, $4, $5)
  `;

  const values = [
    data.oc_codigo,
    data.mp_codigo,
    data.krd_cantidad,
    data.krd_razon,
    data.trn_codigo,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateKardexMP = async (pool, id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  const query = `
    UPDATE kardex_mp
    SET ${fields.join(', ')}
    WHERE krd_codigo = $${index}
    RETURNING *
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllKardexMP = async (pool, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT 
      kmp.krd_codigo, 
      mp.mp_descripcion,
      kmp.trn_cod,
      kmp.oc_codigo,
      kmp.krd_cantidad,
      kmp.krd_fechahora,
      kmp.usr_id,
      kmp.krd_razon 
    FROM kardex_mp kmp
    INNER JOIN materia_prima mp ON kmp.mp_codigo = mp.mp_codigo
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows;
};

const getKardexMPByName = async (pool, name, page=1) => {
  const limit = parseInt(process.env.PAGINATION_LIMIT);
  const offset = (page - 1) * limit;
  const query = `
    SELECT 
      kmp.krd_codigo, 
      mp.mp_descripcion,
      kmp.trn_cod,
      kmp.oc_codigo,
      kmp.krd_cantidad,
      kmp.krd_fechahora,
      kmp.usr_id,
      kmp.krd_razon 
    FROM kardex_mp kmp
    INNER JOIN materia_prima mp ON kmp.mp_codigo = mp.mp_codigo
    WHERE mp.mp_descripcion ILIKE $1
    LIMIT $3 OFFSET $4
  `;

  const result = await pool.query(query, [
    `%${name}%`,
    process.env.ACTIVE_STATUS_INDEPENDENT,
    limit,
    offset
  ]);
  return result.rows;
};

const getKardexMPByID = async (pool, id) => {
  const query = `
    SELECT 
      kmp.krd_codigo, 
      mp.mp_descripcion,
      kmp.trn_cod,
      kmp.oc_codigo,
      kmp.mp_codigo,
      kmp.krd_cantidad,
      kmp.krd_fechahora,
      kmp.usr_id,
      kmp.krd_razon 
    FROM kardex_mp kmp
    INNER JOIN materia_prima mp ON kmp.mp_codigo = mp.mp_codigo
    WHERE kmp.krd_codigo = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const deleteKardexMP = async (pool, id) => {
  const query = `
    DELETE FROM kardex_mp
    WHERE krd_codigo = $1
  `;
  const result = await pool.query(query, [`${id}`]);
  return result.rows;
};

const getCountKardexMP = async (pool) => {
  const query = `
    SELECT COUNT(*) 
    FROM kardex_mp
  `

  const result = await pool.query(query);
  return result.rows[0].count;
}

module.exports = {
  createKardexMP,
  updateKardexMP,
  getAllKardexMP,
  getKardexMPByName,
  getKardexMPByID,
  deleteKardexMP,
  getCountKardexMP
};