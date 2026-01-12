const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token no proporcionado',
    });
  }

  const token = authHeader.split(' ')[1]; // Authorization: Bearer {TOKEN}

  if (!token) {
    return res.status(401).json({
      message: 'Token inválido',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { usuario, password, role }
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido o expirado',
    });
  }
};

module.exports = {
  verifyToken,
};