const createMateriaPrima = async (pool, data) => {
  const query = `
    INSERT INTO materia_prima
    (mp_codigo, um_compra, mp_descripcion, mp_precio_compra, mp_cantidad, mp_prioridad, mp_estado)
    VALUES ($1, $2, $3, $4, $5, $6, '${process.env.ACTIVE_STATUS_INDEPENDENT}')
    RETURNING *
  `;

  const values = [
    data.codigo,
    data.unidad_medida,
    data.descripcion,
    data.costo,
    data.cantidad,
    data.prioridad,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const updateMateriaPrima = async (pool, id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  const query = `
    UPDATE materia_prima
    SET ${fields.join(', ')}
    WHERE mp_codigo = $${index}
    RETURNING *
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllMateriaPrima = async (pool, page=1) => {
  const limit = parseInt(process.env.PAGINATION_LIMIT);
  const offset = (page - 1) * limit;
  const result = await pool.query(`SELECT * FROM materia_prima WHERE mp_estado = '${process.env.ACTIVE_STATUS_INDEPENDENT}' LIMIT $1 OFFSET $2`, [limit, offset]);
  return result.rows;
};

const getMateriaPrimaByName = async (pool, name, page=1) => {
  const limit = parseInt(process.env.PAGINATION_LIMIT);
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM materia_prima
    WHERE mp_descripcion ILIKE $1 AND mp_estado = '${process.env.ACTIVE_STATUS_INDEPENDENT}'
    LIMIT $2 OFFSET $3
  `;
  const result = await pool.query(query, [`%${name}%`, limit, offset]);
  return result.rows;
};

const getMateriaPrimaByID = async (pool, id) => {
  const query = `
    SELECT * FROM materia_prima
    WHERE mp_codigo = $1'
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const deleteMateriaPrima = async (pool, id) => {
  const query = `
    UPDATE materia_prima
    SET mp_estado = ''${process.env.INACTIVE_STATUS_INDEPENDENT}'
    WHERE mp_codigo ILIKE $1
  `;
  const result = await pool.query(query, [`%${id}%`]);
  return result.rows;
};

module.exports = {
  createMateriaPrima,
  updateMateriaPrima,
  getAllMateriaPrima,
  getMateriaPrimaByName,
  getMateriaPrimaByID,
  deleteMateriaPrima
};