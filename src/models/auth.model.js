const AuthModel = {

  createUser: async (pool, data) => {
    try {
      if (!data.cliente) {
        await pool.query("CALL sp_registrar_usuario_cliente_existente($1,$2,$3)", [
          data.email, data.password, data.cli_ruc_ced
        ]);
      } else {
        await pool.query("CALL sp_registrar_usuario_cliente_nuevo($1,$2,$3,$4,$5,$6,$7,$8)", [
          data.email, data.password, data.cli_ruc_ced, data.cliente.cli_nombre, data.cliente.ct_codigo,
          data.cliente.cli_telefono, data.cliente.cli_celular, data.cliente.cli_direccion
        ]);
      }

      await pool.query('COMMIT');

    } catch (err) {
      await pool.query('ROLLBACK');
      console.error("Error en createUser");
      throw err.message;
    }
  },


  findUserByEmail: async (pool, data) => {
    const sql = `
      SELECT u.usr_email,
             u.usr_password,
             u.usr_fecha_registro,
             c.cli_codigo
    FROM usuario_app u 
    INNER JOIN cliente c ON c.usr_email = u.usr_email
    WHERE u.usr_email = $1
    `;
    const { rows } = await pool.query(sql, [data.email]);
    return rows[0];
  },

  verifyPassword: async (pool, data) => {
    const query = `
    SELECT 1
    FROM usuario_app
    WHERE usr_email = $1
      AND usr_password = encode(digest($2, 'sha256'), 'hex')
    LIMIT 1
  `;

    const values = [data.email, data.password];
    const result = await pool.query(query, values);

    return result.rowCount > 0;
  },


  updatePassword: async (pool, { email, newPassword }) => {
    const sql = `
      UPDATE usuario_app
      SET usr_password = encode(digest($1, 'sha256'), 'hex')
      WHERE usr_email = $2
    `;

    const result = await pool.query(sql, [newPassword, email]);

    if (result.rowCount === 0) {
      throw new Error("Usuario no encontrado");
    }
  },

  deleteUser: async (pool, data) => {
    await pool.query(`UPDATE cliente SET usr_email = NULL WHERE usr_email = $1`, [data.email]);
    await pool.query(`DELETE FROM usuario_app WHERE usr_email = $1`, [data.email]);
  },

  getProfile: async (pool, data) => {
    const sql = `
      SELECT 
        u.usr_email,
        u.usr_fecha_registro,
        c.cli_ruc_ced,
        c.cli_nombre,
        c.cli_telefono,
        c.cli_celular,
        c.cli_direccion,
        c.cli_estado
      FROM usuario_app u
      LEFT JOIN cliente c ON c.usr_email = u.usr_email
      WHERE u.usr_email = $1
    `;
    const { rows } = await pool.query(sql, [data.email]);
    return rows[0];
  },
  clientExists: async (pool, cli_ruc_ced) => {
    const sql = `
      SELECT 1 
      FROM cliente
      WHERE cli_ruc_ced = $1
    `;

    const { rows } = await pool.query(sql, [cli_ruc_ced])
    return rows[0]
  },

  isClientAvailable: async (pool, cli_ruc_ced) => {
    const sql = `
      SELECT 1 
      FROM cliente
      WHERE cli_ruc_ced = $1 AND usr_email IS NULL
    `;

    const { rows } = await pool.query(sql, [cli_ruc_ced]);
    return rows[0];
  }
};

module.exports = { AuthModel };