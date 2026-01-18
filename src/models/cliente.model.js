// 1. Crear Cliente (Usando Stored Procedure con Auto-Code)
const createCliente = async (pool, data) => {
  const query = `
        CALL sp_crear_cliente($1, $2, $3, $4, $5, $6, $7, $8)
    `;

  const values = [
    data.ct_codigo, null, data.cli_nombre, data.cli_ruc_ced,
    data.cli_telefono, data.cli_mail, data.cli_direccion, data.cli_celular
  ];

  await pool.query(query, values);

  return { ...data, cli_codigo: 'GENERATED_BY_DB', cli_estado: estado };
};

// 2. Actualizar Cliente
const updateCliente = async (pool, id, data) => {
  const query = `
        UPDATE public.cliente
        SET 
            cli_nombre = COALESCE($1, cli_nombre),
            cli_telefono = COALESCE($2, cli_telefono),
            cli_mail = COALESCE($3, cli_mail),
            cli_direccion = COALESCE($4, cli_direccion),
            cli_celular = COALESCE($5, cli_celular),
            cli_ruc_ced = COALESCE($6, cli_ruc_ced),
            ct_codigo = COALESCE($7, ct_codigo)
        WHERE cli_codigo = $8
        RETURNING *;
    `;

  const values = [
    data.cli_nombre, data.cli_telefono, data.cli_mail,
    data.cli_direccion, data.cli_celular, data.cli_ruc_ced, data.ct_codigo, id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// 3. Obtener Todos (Paginado)
const getAllClientes = async (pool, page = 1) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  const query = `
        SELECT * FROM public.cliente
        ORDER BY cli_nombre ASC
        LIMIT $1 OFFSET $2
    `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// 4. Obtener por ID
const getClienteByID = async (pool, id) => {
  const query = `SELECT * FROM public.cliente WHERE cli_codigo = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// 5. Obtener por Nombre
const getClienteByName = async (pool, name) => {
  const query = `
        SELECT * FROM public.cliente 
        WHERE cli_nombre ILIKE $1 
        LIMIT 10
    `;
  const result = await pool.query(query, [`%${name}%`]);
  return result.rows;
};

// 6. Eliminar (Borrado Lógico)
const deleteCliente = async (pool, id) => {
  const query = `UPDATE public.cliente SET cli_estado = 'INA', cli_fecha_alta = CURRENT_TIMESTAMP WHERE cli_codigo = $1`;
  await pool.query(query, [id]);
  return true;
};

// 7. Obtener para Selectores
const getClienteForSelect = async (pool) => {
  const query = `SELECT cli_codigo, cli_nombre FROM public.cliente WHERE cli_estado = 'ACT'`;
  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createCliente,
  updateCliente,
  getAllClientes,
  getClienteByID,
  getClienteByName,
  deleteCliente,
  getClienteForSelect
};