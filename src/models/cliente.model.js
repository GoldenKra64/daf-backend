// 1. Crear Cliente (Usando Stored Procedure con Auto-Code)
const createCliente = async (pool, data) => {
  // Nota: data.cli_codigo viene vacío, el SP lo genera.
  const estado = data.cli_estado || 'ACT';
  const celular = data.cli_celular || '0999999999';
  const direccion = data.cli_direccion || 'Sin dirección';
  const ciudad = data.ct_codigo || 'UIO';

  // Usamos CALL sp_crear_cliente(NULL, ...)
  // El primer parámetro es INOUT p_new_codigo.
  const query = `
        CALL sp_crear_cliente($1, $2, $3, $4, $5, $6, $7, $8)
    `;

  const values = [
    ciudad, null, data.cli_nombre, data.cli_ruc_ced,
    data.cli_telefono, data.cli_mail, direccion, celular
  ];

  await pool.query(query, values);

  // Retornamos un mensaje indicando que la BD generó el código
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
            cli_celular = COALESCE($5, cli_celular)
        WHERE cli_codigo = $6
        RETURNING *;
    `;

  const values = [
    data.cli_nombre, data.cli_telefono, data.cli_mail,
    data.cli_direccion, data.cli_celular, id
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