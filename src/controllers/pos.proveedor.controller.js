const pool = require('../config/db.proveedor');


const {
    createProveedor,
    updateProveedor,
    getAllProveedor,
    getProveedorByID,
    deleteProveedor
} = require('../models/proveedor.model');

const { validateProveedorDTO } = require('../dtos/proveedor.dto');

/**
 * CREATE
 */
const create = async (req, res) => {
    console.log('🧪 CREATE /api/pos/proveedor');
    console.log('🧪 BODY RECIBIDO:', JSON.stringify(req.body, null, 2));
    const errors = validateProveedorDTO(req.body, false);

    if (errors.length) {
        return res.status(400).json({ errors });
    }

    try {
        const result = await createProveedor(pool, req.body);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('ERROR CREATE PROVEEDOR:', error);

        // 🔴 RUC duplicado
        if (error.code === '23505' && error.constraint === 'uk_proveedor_prv_ruc') {
            return res.status(409).json({
                message: 'Ya existe un proveedor registrado con ese RUC'
            });
        }

        // 🔴 Otros errores de BD
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
 * DELETE (soft o hard según modelo)
 */
const remove = async (req, res) => {
    try {
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
    remove
};
