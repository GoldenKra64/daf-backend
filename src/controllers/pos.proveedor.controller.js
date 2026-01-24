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
    // Soportar ambas variantes del payload (user o usuario)
    const usuario = req.user.usuario || req.user.user;
    const password = req.user.password;
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

    const pool = connectFromJWT(req);
    try {
        const result = await createProveedor(pool, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('❌ ERROR CREATE PROVEEDOR:', error.code, error.message);

        let message = 'Error interno al crear el proveedor';
        let detail = error.message;
        let status = 500;

        // Manejo amigable de errores de BD
        if (error.code === '23505') {
            message = 'Ese RUC o Razón Social ya se encuentra registrado.';
            status = 400;
        } else if (error.code === '23502') {
            message = 'Faltan campos obligatorios requeridos por la base de datos (Ej: Código).';
            status = 400;
        } else if (error.code === '23503') {
            message = 'La ciudad seleccionada no es válida.';
            status = 400;
        }

        return res.status(status).json({ message, detail, code: error.code });
    } finally {
        await pool.end();
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

    const pool = connectFromJWT(req);
    try {
        const result = await updateProveedor(pool, req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('ERROR UPDATE PROVEEDOR:', error);
        res.status(500).json({ message: 'Error al actualizar', detail: error.message });
    } finally {
        await pool.end();
    }
};

/**
 * GET ALL
 */
const getAll = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const result = await getAllProveedor(pool);
        res.status(200).json(result);
    } catch (error) {
        console.error('ERROR GET ALL PROVEEDOR:', error);
        res.status(500).json({ message: 'Error al obtener listado', detail: error.message });
    } finally {
        await pool.end();
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
