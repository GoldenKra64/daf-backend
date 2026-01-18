const CiudadModel = require('../models/ciudad.model');

const CiudadController = {
    async list(req, res) {
        try {
            const data = await CiudadModel.findAll();
            res.json(data);
        } catch (error) {
            console.error('ERROR CIUDADES:', error);
            res.status(500).json({ message: 'Error al listar ciudades' });
        }
    }
};

module.exports = CiudadController;
