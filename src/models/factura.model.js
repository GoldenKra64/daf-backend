/* ======================================================
   MODELO FACTURA (POS) — PRODUCCIÓN
   - El controller maneja pool / transacciones
   - El modelo SOLO ejecuta SQL
====================================================== */

/* =========================
   FACTURAS - CABECERA
========================= */

async function getAllFacturas(pool, limit = 10, offset = 0, search = '') {
  const searchTerm = `%${search.toLowerCase().trim()}%`;
  const query = `
    SELECT
      f.fac_codigo,
      f.fac_fecha,
      f.fac_estado,
      f.fac_total,
      c.cli_codigo,
      c.cli_nombre
    FROM factura f
    JOIN cliente c ON c.cli_codigo = f.cli_codigo
    WHERE (LOWER(f.fac_codigo) LIKE $3 OR LOWER(c.cli_nombre) LIKE $3)
    ORDER BY f.fac_fecha DESC
    LIMIT $1 OFFSET $2
  `;
  const { rows } = await pool.query(query, [limit, offset, searchTerm]);
  return rows;
}

async function countAllFacturas(pool, search = '') {
  const searchTerm = `%${search.toLowerCase().trim()}%`;
  const query = `
    SELECT COUNT(*) 
    FROM factura f
    JOIN cliente c ON c.cli_codigo = f.cli_codigo
    WHERE (LOWER(f.fac_codigo) LIKE $1 OR LOWER(c.cli_nombre) LIKE $1)
  `;
  const { rows } = await pool.query(query, [searchTerm]);
  return parseInt(rows[0].count);
}

async function getFacturaByCodigo(pool, facCodigo) {

  // 1️⃣ CABECERA
  const facturaQuery = `
    SELECT
      f.fac_codigo,
      f.fac_fecha,
      f.fac_estado,
      f.fac_subtotal,
      f.fac_iva,
      f.fac_total,
      f.fac_descripcion,
      c.cli_codigo,
      c.cli_nombre,
      c.cli_ruc_ced
    FROM factura f
    JOIN cliente c ON c.cli_codigo = f.cli_codigo
    WHERE f.fac_codigo = $1
  `;
  const facturaResult = await pool.query(facturaQuery, [facCodigo]);

  if (facturaResult.rowCount === 0) {
    return null;
  }

  // 2️⃣ DETALLE (AQUÍ ESTABA EL FALLO)
  const detalleQuery = `
    SELECT
      d.pxfa_codigo,
      d.prd_codigo,
      d.pxfa_cantidad,
      d.pxfa_subtotal,
      p.prd_precio_venta
    FROM detalle_factura d
    JOIN producto p ON p.prd_codigo = d.prd_codigo
    WHERE d.fac_codigo = $1
  `;
  const detalleResult = await pool.query(detalleQuery, [facCodigo]);

  // 3️⃣ RESPUESTA FINAL
  return {
    factura: facturaResult.rows[0],
    detalle: detalleResult.rows
  };
}


async function createFactura(pool, data) {
  const query = `
    INSERT INTO factura (
      fac_codigo,
      cli_codigo,
      fac_descripcion,
      fac_estado,
      fac_subtotal,
      fac_iva,
      fac_total,
      fac_fecha
    )
    VALUES (
      next_fac_codigo(),
      $1,
      $2,
      'PEN',
      0,
      0,
      0,
      $3
    )
    RETURNING fac_codigo
  `;
  const { rows } = await pool.query(query, [
    data.cli_codigo,
    data.fac_descripcion,
    data.fac_fecha || new Date()
  ]);
  return rows[0];
}

/* =========================
   FACTURAS - DETALLE
========================= */
/*Tareas de Migración de Lógica de Anulación*/

async function insertDetalleFactura(pool, data) {
  const query = `
    INSERT INTO detalle_factura (
      pxfa_codigo,
      fac_codigo,
      prd_codigo,
      pxfa_cantidad,
      prd_precio_venta,
      pxfa_subtotal
    )
    SELECT
      next_pxfa_codigo(),
      f.fac_codigo,
      p.prd_codigo,
      $1::INTEGER,
      p.prd_precio_venta,
      p.prd_precio_venta * $1::NUMERIC
    FROM producto p
    JOIN factura f ON f.fac_codigo = $2
    WHERE p.prd_codigo = $3
      AND TRIM(f.fac_estado) = 'PEN'
  `;
  await pool.query(query, [
    data.pxfa_cantidad, // $1
    data.fac_codigo,    // $2
    data.prd_codigo     // $3
  ]);
}

async function recalcTotalesFactura(pool, facCodigo) {
  const query = `
    UPDATE factura f
    SET
      fac_subtotal = COALESCE((
        SELECT SUM(d.pxfa_subtotal)
        FROM detalle_factura d
        WHERE d.fac_codigo = f.fac_codigo
      ), 0),
      fac_iva = 0,
      fac_total = COALESCE((
        SELECT SUM(d.pxfa_subtotal)
        FROM detalle_factura d
        WHERE d.fac_codigo = f.fac_codigo
      ), 0)
    WHERE f.fac_codigo = $1
      AND TRIM(f.fac_estado) = 'PEN'
  `;
  await pool.query(query, [facCodigo]);
}

async function getDetalleFactura(pool, facCodigo) {
  const query = `
    SELECT
  d.pxfa_codigo,          -- 🔴 CLAVE PARA DELETE
  d.prd_codigo,
  d.pxfa_cantidad,
  d.prd_precio_venta
FROM detalle_factura d
WHERE d.fac_codigo = $1

  `;
  const { rows } = await pool.query(query, [facCodigo]);
  return rows;
}

/* =========================
   FACTURA - APROBACIÓN
========================= */

async function aprobarFactura(pool, facCodigo) {
  const query = `CALL aprobar_factura($1)`;
  await pool.query(query, [facCodigo]);
  return 1; // El SP se encarga de la lógica y arroja error si falla
}

/* =========================
   TRANSACCIÓN + KARDEX
========================= */

async function insertTransaccion(client, { tipo, referencia }) {
  const query = `
    INSERT INTO transaccion (
      trn_cod,
      trn_tipo,
      trn_descripcion
    )
    VALUES (
      next_trn_cod(),
      $1,
      $2
    )
    RETURNING trn_cod
  `;

  const { rows } = await client.query(query, [
    tipo,
    `Factura ${referencia}`
  ]);

  return rows[0].trn_cod;
}


async function insertKardexProducto(pool, data) {
  const krdCodigo = await nextKrdPrdCodigo(pool);

  await pool.query(`
    INSERT INTO kardex_prd (
      krd_prd_codigo,
      trn_cod,
      prd_codigo,
      krd_prd_cantidad,
      krd_prd_fecha,
      krd_prd_accion
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      NOW(),
      $5
    )
  `, [
    krdCodigo,           // ← NUNCA NULL
    data.trn_cod,        // TRNxxxx
    data.prd_codigo,     // PRDxxxx
    data.cantidad,       // integer
    data.accion          // 'ING' o 'EGR'
  ]);
}




async function updateStockProducto(client, prdCodigo, cantidad, operacion) {
  const operador = operacion === 'SUMA' ? '+' : '-';

  const query = `
    UPDATE producto
    SET prd_stock = prd_stock ${operador} $1
    WHERE prd_codigo = $2
  `;

  await client.query(query, [cantidad, prdCodigo]);
}


async function updateDetalleFactura(client, data) {
  const query = `
    UPDATE detalle_factura d
SET
  pxfa_cantidad = $1, 
  pxfa_subtotal = d.prd_precio_venta * $2
FROM factura f
WHERE d.pxfa_codigo = $3
  AND f.fac_codigo = d.fac_codigo
  AND TRIM(f.fac_estado) = 'PEN'
RETURNING d.fac_codigo;

  `;

  const values = [
    data.pxfa_cantidad,               // $1 → INTEGER
    Number(data.pxfa_cantidad),       // $2 → NUMERIC
    data.pxfa_codigo                  // $3
  ];

  const { rows } = await client.query(query, values);

  return rows[0] || null;
}


async function deleteDetalleFactura(client, pxfaCodigo) {
  const facQuery = `
    SELECT f.fac_codigo
    FROM detalle_factura d
    JOIN factura f ON f.fac_codigo = d.fac_codigo
     WHERE TRIM(d.pxfa_codigo) = TRIM($1)
      AND TRIM(f.fac_estado) = 'PEN' 
  `;

  const facResult = await client.query(facQuery, [pxfaCodigo]);
  if (facResult.rowCount === 0) return null;

  const facCodigo = facResult.rows[0].fac_codigo;

  const deleteQuery = `
    DELETE FROM detalle_factura
    WHERE TRIM(pxfa_codigo) = TRIM($1)
    RETURNING fac_codigo;
  `;
  const delResult = await client.query(deleteQuery, [pxfaCodigo]);
  if (delResult.rowCount === 0) return null;


  await recalcTotalesFactura(client, facCodigo);

  return facCodigo;
}


// Obtener fac_codigo a partir del pxfa_codigo
async function getFacCodigoByPxfa(client, pxfaCodigo) {
  const result = await client.query(
    `
        SELECT fac_codigo
        FROM detalle_factura
        WHERE TRIM(pxfa_codigo) = TRIM($1)
        `,
    [pxfaCodigo]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].fac_codigo;
}


async function anularFacturaCompleta(pool, facCodigo) {
  const query = `CALL anular_factura($1)`;
  await pool.query(query, [facCodigo]);
}

async function anularFactura(pool, facCodigo) {
  return anularFacturaCompleta(pool, facCodigo);
}

async function nextKrdPrdCodigo(pool) {
  const { rows } = await pool.query(`
    SELECT
      'KRD' || LPAD(
        (COALESCE(MAX(SUBSTRING(krd_prd_codigo, 4)::int), 0) + 1)::text,
        4,
        '0'
      ) AS codigo
    FROM kardex_prd
  `);

  return rows[0].codigo;
}


async function deleteFactura(pool, facCodigo) {
  const query = `
    DELETE FROM factura 
    WHERE TRIM(fac_codigo) = TRIM($1) 
      AND TRIM(fac_estado) = 'PEN'
  `;
  const result = await pool.query(query, [facCodigo]);
  return result.rowCount > 0;
}

/* =========================
   EXPORTS (SOLO SQL)
========================= */

module.exports = {
  // cabecera
  getAllFacturas,
  countAllFacturas,
  getFacturaByCodigo,
  createFactura,
  deleteFactura,

  // detalle
  insertDetalleFactura,
  updateDetalleFactura,
  deleteDetalleFactura,
  recalcTotalesFactura,
  getDetalleFactura,

  // movimientos
  insertTransaccion,
  insertKardexProducto,
  updateStockProducto,

  // negocio
  aprobarFactura,
  anularFactura,
  anularFacturaCompleta
};



