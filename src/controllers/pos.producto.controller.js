const { getConnectionWithCredentials } = require('../config/db');
const {
    getProductoForSelect
} = require('../models/producto.model');

const connectFromJWT = (req) => {
    const { usuario, password } = req.user;
    return getConnectionWithCredentials(usuario, password);
};

// Get Type
const getAsType = async (req, res) => {
    const pool = connectFromJWT(req);

    try {
        const result = await getProductoForSelect(pool);

        if (!result.length) {
            return res.status(404).json({ message: 'No se encontraron productos' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

module.exports = {
    getAsType
};