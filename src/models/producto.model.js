const createProducto = async (pool, data) => {
  const query = `
    CALL public.sp_crear_producto(
      $1::varchar,
      $2::varchar,
      $3::varchar,
      $4::varchar,
      $5::varchar,
      $6::numeric,
      $7::integer,
      $8::character,
      $9::character varying,
      NULL::varchar
    )
  `;
  const values = [
    data.um_venta,
    data.cat_codigo ?? null,
    data.prd_nombre,
    data.prd_desc_corta,
    data.prd_desc_larga,
    data.prd_precio_venta,
    data.prd_stock,
    data.prd_prioridad,
    data.prd_img ?? null,
  ];

  const result = await pool.query(query, values);

  // normalmente: { p_prd_codigo: 'PD00000001' }
  return result.rows[0];
};

const updateProducto = async (pool, id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  const query = `
    UPDATE producto
    SET ${fields.join(', ')}
    WHERE prd_codigo = $${index}
    RETURNING *
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllProducto = async (pool, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT *
     FROM producto
     WHERE prd_estado = $1
     LIMIT $2 OFFSET $3`,
    [process.env.ACTIVE_STATUS_INDEPENDENT, limit, offset]
  );

  return result.rows;
};

const getProductoByName = async (pool, name, page = 1) => {
  const limit = parseInt(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT *
     FROM producto
     WHERE prd_nombre ILIKE $1
       AND prd_estado = $2
     LIMIT $3 OFFSET $4`,
    [`%${name}%`, process.env.ACTIVE_STATUS_INDEPENDENT, limit, offset]
  );

  return result.rows;
};

const getProductoByID = async (pool, id) => {
  const result = await pool.query(
    `SELECT * FROM producto
     WHERE prd_codigo = $1`,
    [id]
  );

  return result.rows[0];
};

const deleteProducto = async (pool, id) => {
  const query = `
    UPDATE producto
    SET 
      prd_estado = $1,
      prd_fecha_alta = NOW()
    WHERE prd_codigo = $2
    RETURNING *
  `;

  const result = await pool.query(query, [
    process.env.INACTIVE_STATUS_INDEPENDENT,
    id
  ]);

  return result.rows[0];
};


const getCountProducto = async (pool) => {
  const query = `
    SELECT COUNT(*)
    FROM producto
    WHERE prd_estado='ACT'
  `;

  const result = await pool.query(query);
  return result.rows[0].count;
};

const getProductoForSelect = async (pool) => {
  const query = `
    SELECT prd_codigo, prd_nombre
    FROM producto
    WHERE prd_estado='ACT'
    ORDER BY prd_nombre
  `;

  const result = await pool.query(query);
  return result.rows;
};


module.exports = {
  createProducto,
  updateProducto,
  getAllProducto,
  getProductoByName,
  getProductoByID,
  deleteProducto,
  getCountProducto,
  getProductoForSelect,
};
