const getProductoForSelect = async (pool) => {
    const query = `
    SELECT prd_codigo, prd_nombre
    FROM producto
    ORDER BY prd_nombre
  `

    const result = await pool.query(query);
    return result.rows;
}

module.exports = {
    getProductoForSelect
};