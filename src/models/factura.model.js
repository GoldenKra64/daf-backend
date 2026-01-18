/* =====================================================
   MODELO FACTURA  (CommonJS)
===================================================== */

const IVA_RATE = 0.15;

/* =====================================================
   LISTAR FACTURAS
===================================================== */
const getAllFacturas = async (pool) => {
    const query = `
    SELECT
      f.fac_codigo,
      f.fac_fecha,
      f.fac_descripcion,
      f.fac_subtotal,
      f.fac_iva,
      f.fac_total,
      f.fac_estado,
      c.cli_codigo,
      c.cli_nombre
    FROM factura f
    JOIN cliente c ON c.cli_codigo = f.cli_codigo
    ORDER BY f.fac_fecha DESC
  `;
    const { rows } = await pool.query(query);
    return rows;
};

/* =====================================================
   OBTENER FACTURA POR CÓDIGO
===================================================== */
const getFacturaByCodigo = async (pool, facCodigo) => {
    const query = `
    SELECT
      f.fac_codigo,
      f.fac_fecha,
      f.fac_descripcion,
      f.fac_subtotal,
      f.fac_iva,
      f.fac_total,
      f.fac_estado,
      c.cli_codigo,
      c.cli_nombre
    FROM factura f
    JOIN cliente c ON c.cli_codigo = f.cli_codigo
    WHERE f.fac_codigo = $1
  `;
    const { rows } = await pool.query(query, [facCodigo]);
    return rows[0];
};

/* =====================================================
   DETALLE POR FACTURA
===================================================== */
const getDetalleByFactura = async (pool, facCodigo) => {
    const query = `
    SELECT
      d.pxfa_codigo,
      d.prd_codigo,
      p.prd_nombre,
      d.pxfa_cantidad,
      p.prd_precio_venta,
      d.pxfa_subtotal
    FROM detalle_factura d
    JOIN producto p ON p.prd_codigo = d.prd_codigo
    WHERE d.fac_codigo = $1
  `;
    const { rows } = await pool.query(query, [facCodigo]);
    return rows;
};

/* =====================================================
   INSERTAR DETALLE
===================================================== */
const insertDetalleFactura = async (client, data) => {
    const query = `
    INSERT INTO detalle_factura (
      pxfa_codigo,
      fac_codigo,
      prd_codigo,
      pxfa_cantidad,
      pxfa_subtotal
    )
    SELECT
      $1,
      $2,
      $3,
      $4,
      p.prd_precio_venta * $5
    FROM producto p
    JOIN factura f ON f.fac_codigo = $2
    WHERE p.prd_codigo = $3
      AND f.fac_estado = 'PEN'
  `;

    const cantidad = Number(data.pxfa_cantidad);

    const { rowCount } = await client.query(query, [
        data.pxfa_codigo,   // $1
        data.fac_codigo,    // $2
        data.prd_codigo,    // $3
        cantidad,           // $4 → INTEGER
        cantidad            // $5 → NUMERIC
    ]);


    return rowCount;
};

/* =====================================================
   RECALCULAR TOTALES
===================================================== */
const recalcTotalesFactura = async (client, facCodigo) => {
    const query = `
    UPDATE factura
    SET
      fac_subtotal = COALESCE((
        SELECT SUM(pxfa_subtotal)
        FROM detalle_factura
        WHERE fac_codigo = $1
      ), 0),
      fac_iva = COALESCE((
        SELECT SUM(pxfa_subtotal)
        FROM detalle_factura
        WHERE fac_codigo = $1
      ), 0) * $2,
      fac_total = COALESCE((
        SELECT SUM(pxfa_subtotal)
        FROM detalle_factura
        WHERE fac_codigo = $1
      ), 0) * (1 + $2)
    WHERE fac_codigo = $1
      AND fac_estado = 'PEN'
  `;
    await client.query(query, [facCodigo, IVA_RATE]);
};

/* =====================================================
   ACTUALIZAR DETALLE
===================================================== */
const updateDetalleFactura = async (pool, data) => {
    const query = `
    UPDATE detalle_factura d
    SET
      pxfa_cantidad = $2,
      pxfa_subtotal = p.prd_precio_venta * $2
    FROM producto p
    JOIN factura f ON f.fac_codigo = d.fac_codigo
    WHERE d.pxfa_codigo = $1
      AND p.prd_codigo = d.prd_codigo
      AND f.fac_estado = 'PEN'
  `;
    const { rowCount } = await pool.query(query, [
        data.pxfa_codigo,
        data.pxfa_cantidad
    ]);
    return rowCount;
};

/* =====================================================
   ELIMINAR DETALLE
===================================================== */
const deleteDetalleFactura = async (pool, pxfaCodigo) => {
    const query = `
    DELETE FROM detalle_factura d
    USING factura f
    WHERE d.fac_codigo = f.fac_codigo
      AND d.pxfa_codigo = $1
      AND f.fac_estado = 'PEN'
  `;
    const { rowCount } = await pool.query(query, [pxfaCodigo]);
    return rowCount;
};

module.exports = {
    getAllFacturas,
    getFacturaByCodigo,
    getDetalleByFactura,
    insertDetalleFactura,
    recalcTotalesFactura,
    updateDetalleFactura,
    deleteDetalleFactura
};
