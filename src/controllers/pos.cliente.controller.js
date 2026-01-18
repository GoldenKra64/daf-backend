// Importación de dependencias y modelo
const { getConnectionWithCredentials } = require('../config/db_pos');
const modeloCliente = require('../models/cliente.model');
const { validateClienteDTO } = require('../dtos/cliente.dto');

const connectFromJWT = (req) => {
    const { usuario, password } = req.user;
    return getConnectionWithCredentials(usuario, password);
};

/**
 * Crear un nuevo cliente
 * Método: POST
 */
const create = async (req, res) => {
    // 1. Validar datos de entrada
    const errors = validateClienteDTO(req.body);
    if (errors.length) return res.status(400).json({ errors });

    const pool = connectFromJWT(req);

    try {
        const result = await modeloCliente.createCliente(pool, {
            ...req.body
        });

        res.status(201).json({
            message: "Cliente creado exitosamente",
            data: result
        });

    } catch (error) {
        console.error("Error en createCliente:", error.message);
        res.status(500).json({ message: "Error interno al crear cliente", detail: error.message });
    } finally {
        await pool.end();
    }
};

/**
 * Obtener todos los clientes con paginación
 * Método: GET
 */
const getAll = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await modeloCliente.getAllClientes(pool, page);

        res.status(200).json({
            message: "Listado obtenido correctamente",
            count: result.length,
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

/**
 * Obtener cliente por ID
 * Método: GET /:id
 */
const getByID = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const { id } = req.params;
        const result = await modeloCliente.getClienteByID(pool, id);

        if (!result) return res.status(404).json({ message: "Cliente no encontrado" });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error en getClienteByID:", error.message);
        res.status(500).json({ message: "Error al buscar cliente" });
    } finally {
        await pool.end();
    }
};

/**
 * Actualizar cliente existente
 * Método: PUT /:id
 */
const update = async (req, res) => {
    // Validar datos (modo actualización)
    const errors = validateClienteDTO(req.body, true);
    if (errors.length) return res.status(400).json({ errors });

    const pool = connectFromJWT(req);

    try {
        const { id } = req.params;
        const result = await modeloCliente.updateCliente(pool, id, req.body);

        if (!result) return res.status(404).json({ message: "Cliente no encontrado para actualizar" });

        res.status(200).json({ message: "Cliente actualizado correctamente", data: result });
    } catch (error) {
        console.error("Error en updateCliente:", error.message);
        res.status(500).json({ message: "Error al actualizar cliente" });
    } finally {
        await pool.end();
    }
};

/**
 * Eliminación lógica de cliente (Estado -> INA)
 * Método: DELETE /:id
 */
const remove = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const { id } = req.params;
        await modeloCliente.deleteCliente(pool, id);
        res.status(200).json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        console.error("Error en deleteCliente:", error.message);
        res.status(500).json({ message: "Error al eliminar cliente" });
    } finally {
        await pool.end();
    }
};

/**
 * Buscar clientes por nombre aproximado
 * Método: GET /search?name=...
 */
const getByName = async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "El parámetro 'name' es requerido" });

    const pool = connectFromJWT(req);
    try {
        const result = await modeloCliente.getClienteByName(pool, name);
        res.status(200).json({ data: result });
    } catch (error) {
        console.error("Error en getByName:", error.message);
        res.status(500).json({ message: "Error en la búsqueda" });
    } finally {
        await pool.end();
    }
};

/**
 * Obtener lista simplificada para selectores/combos
 * Método: GET /type
 */
const getAsType = async (req, res) => {
    const pool = connectFromJWT(req);
    try {
        const result = await modeloCliente.getClienteForSelect(pool);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error en getAsType:", error.message);
        res.status(500).json({ message: "Error al obtener lista de tipos" });
    } finally {
        await pool.end();
    }
};

module.exports = {
    create,
    getAll,
    getByID,
    update,
    remove,
    getByName,
    getAsType
};