const createOrdenCompra = async (pool, data) => {
  const query = `CALL sp_crear_orden_compra($1::char(10), NULL)`;
  const values = [data.prv_codigo];

  const result = await pool.query(query, values);
  return { oc_codigo: result.rows[0].p_oc_codigo };
};

const getOrdenCompraByID = async (pool, ocCodigo) => {
  const query = `
    SELECT
      oc_codigo,
      prv_codigo,
      oc_fecha,
      oc_subtotal,
      oc_iva,
      oc_total,
      oc_fecha_aprobacion,
      oc_fecha_eliminacion,
      oc_estado
    FROM ordencompra
    WHERE oc_codigo = $1
  `;
  const result = await pool.query(query, [ocCodigo]);
  return result.rows[0];
};

const getDetallesByOC = async (pool, ocCodigo) => {
  const query = `
    SELECT
      d.oc_codigo,
      d.mp_codigo,
      mp.mp_descripcion,
      d.pxoc_cantidad,
      d.pxoc_subtotal,
      d.pxoc_estado
    FROM detalle_oc d
    INNER JOIN materia_prima mp ON d.mp_codigo = mp.mp_codigo
    WHERE d.oc_codigo = $1
    ORDER BY d.mp_codigo
  `;
  const result = await pool.query(query, [ocCodigo]);
  return result.rows;
};

const getAllOrdenCompra = async (pool, page = 1, estado = null) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const params = [];
  let where = "";

  if (estado) {
    params.push(estado);
    where = `WHERE oc_estado = $${params.length}`;
  }

  params.push(limit);
  params.push(offset);

  const query = `
    SELECT
      oc_codigo,
      prv_codigo,
      oc_fecha,
      oc_subtotal,
      oc_iva,
      oc_total,
      oc_estado
    FROM ordencompra
    ${where}
    ORDER BY oc_fecha DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const result = await pool.query(query, params);
  return result.rows;
};

const getCountOrdenCompra = async (pool, estado = null) => {
  const params = [];
  let where = "";

  if (estado) {
    params.push(estado);
    where = `WHERE oc_estado = $1`;
  }

  const query = `SELECT COUNT(*) FROM ordencompra ${where}`;
  const result = await pool.query(query, params);
  return result.rows[0].count;
};

const getOrdenCompraByProveedor = async (pool, prvCodigo, page = 1) => {
  const limit = Number(process.env.PAGINATION_LIMIT) || 20;
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      oc_codigo,
      prv_codigo,
      oc_fecha,
      oc_subtotal,
      oc_iva,
      oc_total,
      oc_estado
    FROM ordencompra
    WHERE prv_codigo = $1
    ORDER BY oc_fecha DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [prvCodigo, limit, offset]);
  return result.rows;
};


const upsertDetalleOC = async (pool, data) => {
  const query = `
    INSERT INTO detalle_oc (oc_codigo, mp_codigo, pxoc_cantidad)
    VALUES ($1, $2, $3)
    ON CONFLICT (oc_codigo, mp_codigo)
    DO UPDATE SET pxoc_cantidad = EXCLUDED.pxoc_cantidad
    RETURNING oc_codigo, mp_codigo, pxoc_cantidad, pxoc_subtotal, pxoc_estado
  `;

  const values = [
    data.oc_codigo,
    data.mp_codigo,
    data.pxoc_cantidad,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteDetalleOC = async (pool, ocCodigo, mpCodigo) => {
  const query = `
    DELETE FROM detalle_oc
    WHERE oc_codigo = $1 AND mp_codigo = $2
  `;
  const result = await pool.query(query, [ocCodigo, mpCodigo]);
  return result.rowCount; // 1 si borró
};

const aprobarOC = async (pool, ocCodigo) => {
  const query = `
    UPDATE ordencompra
    SET oc_estado = 'APR'
    WHERE oc_codigo = $1
    RETURNING oc_codigo, oc_estado
  `;
  const result = await pool.query(query, [ocCodigo]);
  return result.rows[0];
};

const anularOC = async (pool, ocCodigo) => {
  const query = `
    UPDATE ordencompra
    SET oc_estado = 'ANU'
    WHERE oc_codigo = $1
    RETURNING oc_codigo, oc_estado
  `;
  const result = await pool.query(query, [ocCodigo]);
  return result.rows[0];
};

module.exports = {
  createOrdenCompra,
  getOrdenCompraByID,
  getDetallesByOC,
  getAllOrdenCompra,
  getCountOrdenCompra,
  getOrdenCompraByProveedor,
  upsertDetalleOC,
  deleteDetalleOC,
  aprobarOC,
  anularOC,
};
