<<<<<<< HEAD
const { getConnectionWithCredentials } = require('../config/db_pos.js');
const {
    createProveedor,
    updateProveedor,
    getAllProveedor,
    getProveedorByID,
    deleteProveedor
} = require('../models/proveedor.model');

const { validateProveedorDTO } = require('../dtos/proveedor.dto');

const connectFromJWT = () => {
    return getConnectionWithCredentials();
};

const create = async (req, res) => {
    const errors = validateProveedorDTO(req.body);
    if (errors.length) {
        return res.status(400).json({ errors });
    }

    const pool = connectFromJWT();
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

    const pool = connectFromJWT();
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
    const pool = connectFromJWT();
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
    const pool = connectFromJWT();
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
    const pool = connectFromJWT();
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
=======
// src/controllers/pos.proveedor.controller.js
const ProveedorModel = require('../models/proveedor.model');
const { validateProveedorDTO } = require('../dtos/proveedor.dto');

const ProveedorController = {

    async list(req, res) {
        try {
            const { usuario, password } = req.user;
            const data = await ProveedorModel.findAll(usuario, password);
            res.json(data);
        } catch (error) {
            console.error('ERROR LISTAR PROVEEDORES:', error);
            res.status(500).json({ message: 'Error al listar proveedores' });
        }
    },

    async findById(req, res) {
        try {
            const { usuario, password } = req.user;

            const proveedor = await ProveedorModel.findById(
                req.params.id,
                usuario,
                password
            );

            if (!proveedor) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            res.json(proveedor);
        } catch (error) {
            console.error('ERROR OBTENER PROVEEDOR:', error);
            res.status(500).json({ message: 'Error al obtener proveedor' });
        }
    },

    async create(req, res) {
        try {
            const { usuario, password } = req.user;

            const errors = validateProveedorDTO(req.body);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const exists = await ProveedorModel.existsByRuc(
                req.body.prv_ruc,
                usuario,
                password
            );

            if (exists) {
                return res.status(400).json({
                    message: 'El RUC del proveedor ya existe',
                });
            }

            const proveedor = await ProveedorModel.create(
                req.body,
                usuario,
                password
            );

            res.status(201).json(proveedor);

        } catch (error) {
            console.error('ERROR CREAR PROVEEDOR:', error);
            res.status(500).json({ message: 'Error al crear proveedor' });
        }
    },

    async update(req, res) {
        try {
            const { usuario, password } = req.user;

            const proveedor = await ProveedorModel.update(
                req.params.id,
                req.body,
                usuario,
                password
            );

            res.json(proveedor);

        } catch (error) {
            console.error('ERROR ACTUALIZAR PROVEEDOR:', error);
            res.status(500).json({ message: 'Error al actualizar proveedor' });
        }
    },

    async remove(req, res) {
        try {
            const { usuario, password } = req.user;

            await ProveedorModel.softDelete(
                req.params.id,
                usuario,
                password
            );

            res.json({ message: 'Proveedor inactivado correctamente' });

        } catch (error) {
            console.error('ERROR ELIMINAR PROVEEDOR:', error);
            res.status(500).json({ message: 'Error al eliminar proveedor' });
        }
    }
};

module.exports = ProveedorController;
>>>>>>> f14ea63 (Interfaz de Proveedor)
