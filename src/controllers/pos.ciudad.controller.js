const CiudadModel = require('../models/ciudad.model');
const { getConnectionWithCredentials } = require('../config/db_pos.js');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

const CiudadController = {
    async list(req, res) {
        const pool = connectFromJWT(req);
        try {
            const data = await CiudadModel.getAllQuery(pool);
            res.json(data);
        } catch (error) {
            console.error('ERROR CIUDADES:', error);
            res.status(500).json({ message: 'Error al listar ciudades' });
        } finally {
            await pool.end();
        }
    }
};

module.exports = CiudadController;
