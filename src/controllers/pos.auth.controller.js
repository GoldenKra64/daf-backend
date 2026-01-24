const jwt = require('jsonwebtoken');
const { getConnectionWithCredentials } = require('../config/db_pos.js');

const login = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({
      message: 'user y password son requeridos',
    });
  }

  try {
    // Intentamos conectar a la BD con las credenciales que manda Postman
    pool = getConnectionWithCredentials(user, password);

    // Verificamos todos los roles a los que pertenece el usuario
    const result = await pool.query(`
      SELECT r.rolname
      FROM pg_roles r
      JOIN pg_auth_members m ON r.oid = m.roleid
      JOIN pg_roles u ON u.oid = m.member
      WHERE u.rolname = (SELECT CURRENT_USER)
    `);

    // Extraemos todos los nombres de roles en un array
    const role = result.rows[0] ? result.rows[0].rolname : 'usuario';

    const token = jwt.sign(
      {
        usuario: user,
        password: password,
        role: role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      role,
    });

  } catch (error) {
    return res.status(401).json({
      message: 'Credenciales incorrectas o error de conexión',
      detail: error.message
    });

  } finally {
    if (pool) {
      await pool.end();
    }
  }
};

module.exports = {
  login,
};