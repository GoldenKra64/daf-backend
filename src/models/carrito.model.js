const countDetallesCarrito = async (pool, crr_codigo) => {
    const result = await pool.query(`
        SELECT COUNT(*) 
        FROM productoxcarrito 
        WHERE crr_codigo = $1
        `,
        [crr_codigo]
    );
    return result.rows[0];
}

const countDetallesCarritoFilter = async (
  pool,
  crr_codigo,
  name
) => {
  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM productoxcarrito pxca
    INNER JOIN producto p
      ON p.prd_codigo = pxca.prd_codigo
    WHERE pxca.crr_codigo = $1
      AND p.prd_nombre ILIKE $2
    `,
    [crr_codigo, `%${name}%`]
  );

  return result.rows[0];
};

const getCarritoByCodigo = async (pool, crr_codigo) => {
  const result = await pool.query(
    `
    SELECT
      crr_codigo,
      usr_email,
      crr_subtotal,
      crr_total,
      crr_fecha_actualizacion
    FROM carrito
    WHERE crr_codigo = $1
    `,
    [crr_codigo]
  );

  return result.rows[0];
};

const getCarritoByEmail = async (pool, email) => {
  const result = await pool.query(
    `
    SELECT crr_codigo, crr_subtotal, crr_total
    FROM carrito
    WHERE TRIM(usr_email) = TRIM($1)
    `,
    [email]
  );

  return result.rows[0];
};

const getDetallesCarrito = async (
  pool,
  crr_codigo,
  page = 1,
  limit = Number(process.env.PAGINATION_LIMIT)
) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT
      pxca.crr_codigo,
      p.prd_codigo,
      p.prd_nombre,
      p.prd_desc_corta,
      p.prd_img,
      pxca.pxca_cantidad,
      pxca.pxca_subtotal
    FROM productoxcarrito pxca
    INNER JOIN producto p
      ON p.prd_codigo = pxca.prd_codigo
    WHERE pxca.crr_codigo = $1
    ORDER BY p.prd_nombre
    LIMIT $2 OFFSET $3
    `,
    [crr_codigo, limit, offset]
  );

  return result.rows;
};

const searchDetallesCarrito = async (
  pool,
  crr_codigo,
  name,
  page = 1,
  limit = Number(process.env.PAGINATION_LIMIT)
) => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT
      pxca.crr_codigo,
      p.prd_codigo,
      p.prd_nombre,
      p.prd_desc_corta,
      p.prd_img,
      pxca.pxca_cantidad,
      pxca.pxca_subtotal
    FROM productoxcarrito pxca
    INNER JOIN producto p
      ON p.prd_codigo = pxca.prd_codigo
    WHERE pxca.crr_codigo = $1
      AND p.prd_nombre ILIKE $2
    ORDER BY p.prd_nombre
    LIMIT $3 OFFSET $4
    `,
    [crr_codigo, `%${name}%`, limit, offset]
  );

  return result.rows;
};


const updateCantidadProducto = async (
    pool,
    crr_codigo,
    prd_codigo,
    cantidad,
    ) => {
  await pool.query(
    `
    UPDATE productoxcarrito
    SET
      pxca_cantidad = $1
    WHERE crr_codigo = $2
      AND prd_codigo = $3
    `,
    [cantidad, crr_codigo, prd_codigo]
  );
};

const deleteProductoCarrito = async (pool, crr_codigo, prd_codigo) => {
  await pool.query(
    `
    DELETE FROM productoxcarrito
    WHERE crr_codigo = $1
      AND prd_codigo = $2
    `,
    [crr_codigo, prd_codigo]
  );
};

module.exports = {
    getCarritoByCodigo,
    getCarritoByEmail,
    getDetallesCarrito,
    countDetallesCarrito,
    countDetallesCarritoFilter,
    searchDetallesCarrito,
    updateCantidadProducto,
    deleteProductoCarrito
};