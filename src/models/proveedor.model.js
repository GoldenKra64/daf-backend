const createProveedor = async (pool, data) => {
    const query = `
    INSERT INTO proveedor (
      prv_razonsocial, prv_ruc, prv_telefono, prv_celular, 
      prv_mail, prv_direccion, ct_codigo, prv_estado, prv_fecha_alta
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
    const values = [
        data.prv_razonsocial,
        data.prv_ruc,
        data.prv_telefono,
        data.prv_celular,
        data.prv_mail,
        data.prv_direccion,
        data.ct_codigo,
        data.prv_estado || 'ACT',
        data.prv_fecha_alta || new Date()
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateProveedor = async (pool, id, data) => {
    const query = `
    UPDATE proveedor
    SET prv_razonsocial = COALESCE($1, prv_razonsocial),
        prv_ruc = COALESCE($2, prv_ruc),
        prv_telefono = COALESCE($3, prv_telefono),
        prv_celular = COALESCE($4, prv_celular),
        prv_mail = COALESCE($5, prv_mail),
        prv_direccion = COALESCE($6, prv_direccion),
        ct_codigo = COALESCE($7, ct_codigo),
        prv_estado = COALESCE($8, prv_estado)
    WHERE prv_codigo = $9
    RETURNING *;
  `;
    const values = [
        data.prv_razonsocial,
        data.prv_ruc,
        data.prv_telefono,
        data.prv_celular,
        data.prv_mail,
        data.prv_direccion,
        data.ct_codigo,
        data.prv_estado,
        id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllProveedor = async (pool) => {
    const query = `
    SELECT 
      p.prv_codigo,
      p.prv_razonsocial,
      p.prv_ruc,
      p.prv_telefono,
      p.prv_celular,
      p.prv_mail,
      p.prv_direccion,
      p.prv_estado,
      p.ct_codigo,
      c.ct_descripcion AS ciudad_nombre
    FROM proveedor p
    LEFT JOIN ciudad c 
      ON c.ct_codigo = p.ct_codigo
    ORDER BY p.prv_razonsocial ASC;
  `;

    const result = await pool.query(query);
    return result.rows;
};

const getProveedorByID = async (pool, id) => {
    const query = 'SELECT * FROM proveedor WHERE prv_codigo = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

const deleteProveedor = async (pool, id) => {
    const query = `
    UPDATE proveedor
    SET prv_estado = 'INA'
    WHERE prv_codigo = $1
    RETURNING *;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createProveedor,
    updateProveedor,
    getAllProveedor,
    getProveedorByID,
    deleteProveedor
};
