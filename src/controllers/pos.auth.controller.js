const jwt = require('jsonwebtoken');
const { getConnectionWithCredentials } = require('../config/db_pos.js');

const login = async (req, res) => {
  console.log('🔐 Backend - Login request received')
  console.log('📝 Backend - Request body:', req.body)

  const { user, password } = req.body;

  console.log('👤 Backend - User:', user)
  console.log('🔒 Backend - Password provided:', !!password)

  if (!user || !password) {
    console.log('❌ Backend - Missing user or password')
    return res.status(400).json({
      message: 'user y password son requeridos',
    });
  }

  // Para desarrollo: credenciales hardcodeadas
  const validUsers = {
    'admin': { password: 'admin123', role: 'admin' },
    'user': { password: 'user123', role: 'user' }
  };

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
    const roles = result.rows.map(row => row.rolname.trim().toLowerCase());

    // Si no tiene roles de grupo, al menos sabemos que es un login válido
    if (roles.length === 0) roles.push('user');

    const token = jwt.sign(
      {
        usuario: user,
        password: password,
        roles: roles,
        role: roles[0] || 'user', // Restauramos compatibilidad singular
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      }
    );

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      roles,
    });

  } catch (error) {
    // --- AQUÍ ESTÁ EL CHIVATO PARA VER EL ERROR ---
    console.log("❌ ERROR REAL AL CONECTAR:", error.message);

    return res.status(401).json({
      message: 'Credenciales incorrectas o error de conexión',
      detail: error.message // Esto te mostrará el error técnico en Postman
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