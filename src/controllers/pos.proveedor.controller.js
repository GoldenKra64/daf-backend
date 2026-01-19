const { getConnectionWithCredentials } = require('../config/db_pos.js');

const {
    createProveedor,
    updateProveedor,
    getAllProveedor,
    getProveedorByID,
    searchProveedor,
    deleteProveedor
} = require('../models/proveedor.model');

const { validateProveedorDTO } = require('../dtos/proveedor.dto');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

/**
 * CREATE
 */
const create = async (req, res) => {
    const errors = validateProveedorDTO(req.body, false);

    if (errors.length) {
        return res.status(400).json({ errors });
    }

    try {
        const pool = connectFromJWT(req);
        const result = await createProveedor(pool, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: 'Error interno al crear el proveedor'
        });
    }

};

/**
 * UPDATE
 */
const update = async (req, res) => {
    const errors = validateProveedorDTO(req.body, true);
    if (errors.length) {
        return res.status(400).json({ errors });
    }

    try {
        const pool = connectFromJWT(req);
        const result = await updateProveedor(pool, req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('ERROR UPDATE PROVEEDOR:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET ALL
 */
const getAll = async (req, res) => {
    try {
        const pool = connectFromJWT(req);
        const result = await getAllProveedor(pool);
        res.status(200).json(result);
    } catch (error) {
        console.error('ERROR GET ALL PROVEEDOR:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET BY ID
 */
const getByID = async (req, res) => {
    try {
        const pool = connectFromJWT(req);
        const result = await getProveedorByID(pool, req.params.id);
        if (!result) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('ERROR GET PROVEEDOR BY ID:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * SEARCH by Name/RUC
 */
const search = async (req, res) => {
    const { q } = req.query; // ?q=...

    if (!q) {
        return res.status(400).json({ message: 'Parámetro q es requerido' });
    }

    try {
        const pool = connectFromJWT(req);
        const result = await searchProveedor(pool, q);
        res.status(200).json(result);
    } catch (error) {
        console.error('ERROR SEARCH PROVEEDOR:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE (soft o hard según modelo)
 */
const remove = async (req, res) => {
    try {
        const pool = connectFromJWT(req);
        await deleteProveedor(pool, req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('ERROR DELETE PROVEEDOR:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    create,
    update,
    getAll,
    getByID,
    search,
    remove
};
