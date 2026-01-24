const pagarCarrito = async (pool, email, crr_codigo) => {
  const query = `SELECT fn_pagar_carrito($1::CHAR(60), $2::CHAR(10)) AS fac_codigo`;
  const result = await pool.query(query, [email, crr_codigo]);
  return result.rows[0]?.fac_codigo;
};

module.exports = { pagarCarrito };
