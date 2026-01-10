const createMateriaPrima = async (pool, data) => {
  const query = `
    CALL sp_crear_materia_prima($1, $2, $3, $4, $5)
  `;

  const values = [
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

const getAllMateriaPrima = async (pool, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT *
     FROM materia_prima
     WHERE mp_estado = $1
     LIMIT $2 OFFSET $3`,
    [process.env.ACTIVE_STATUS_INDEPENDENT, limit, offset]
  );

  return result.rows;
};

const getMateriaPrimaByName = async (pool, name, page=1) => {
  const limit = parseInt(process.env.PAGINATION_LIMIT);
  const offset = (page - 1) * limit;
  const query = `
    SELECT *
    FROM materia_prima
    WHERE mp_descripcion ILIKE $1
      AND mp_estado = $2
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

const getMateriaPrimaByID = async (pool, id) => {
  const query = `
    SELECT * FROM materia_prima
    WHERE mp_codigo = $1
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