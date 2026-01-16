const { getConnectionWithCredentials } = require('../config/db_pos.js');
const {
    createProveedor,
    updateProveedor,
    getAllProveedor,
    getProveedorByID,
    deleteProveedor
} = require('../models/proveedor.model');

const { validateProveedorDTO } = require('../dtos/proveedor.dto');

const connectFromJWT = (req) => {
    const { usuario, password } = req.user;
    return getConnectionWithCredentials(usuario, password);
};

const create = async (req, res) => {
    const errors = validateProveedorDTO(req.body);
    if (errors.length) {
        return res.status(400).json({ errors });
    }

    const pool = connectFromJWT(req);
    try {
        const result = await createProveedor(pool, req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

const update = async (req, res) => {
    const errors = validateProveedorDTO(req.body, true);
    if (errors.length) {
        return res.status(400).json({ errors });
    }

    const pool = connectFromJWT(req);
    try {
        const result = await updateProveedor(pool, req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

const getAll = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const result = await getAllProveedor(pool);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

const getByID = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const result = await getProveedorByID(pool, req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

const remove = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        await deleteProveedor(pool, req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

module.exports = {
    create,
    update,
    getAll,
    getByID,
    remove
};
