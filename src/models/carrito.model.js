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

const getDetallesCarrito = async (pool, crr_codigo) => {
  const result = await pool.query(
    `
    SELECT
        pxca.prd_codigo,
        p.prd_nombre,
        pxca_cantidad,
        pxca_subtotal
    FROM productoxcarrito pxca
    INNER JOIN producto p ON pxca.prd_codigo = p.prd_codigo
    WHERE crr_codigo = $1
    `,
    [crr_codigo]
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
    updateCantidadProducto,
    deleteProductoCarrito
};