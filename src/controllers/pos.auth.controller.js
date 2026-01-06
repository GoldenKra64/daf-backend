const jwt = require('jsonwebtoken');
const { getConnectionWithCredentials } = require('../config/db');

const login = async (req, res) => {
  const { user, password } = req.body;

  if (!user || !password) {
    return res.status(400).json({
      message: 'user y password son requeridos',
    });
  }

  let pool;

  try {
    pool = getConnectionWithCredentials(user, password);

    const result = await pool.query('SELECT current_user');

    const role = result.rows[0].current_user;

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
      token,
      role,
    });

  } catch (error) {
    return res.status(401).json({
      message: 'Credenciales incorrectas',
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