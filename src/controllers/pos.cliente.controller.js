// Importación de dependencias y modelo
const { pool } = require('../config/db');
const modeloCliente = require('../models/cliente.model');
const { validateClienteDTO } = require('../dtos/cliente.dto');

/**
 * Crear un nuevo cliente
 * Método: POST
 */
const create = async (req, res) => {
    try {
        // 1. Validar datos de entrada
        const errors = validateClienteDTO(req.body);
        if (errors.length) return res.status(400).json({ errors });

        // 2. Preparar datos por defecto
        // YA NO GENERAMOS CÓDIGO AQUÍ. LA BD LO HACE (CLI0000X).
        const ciudad = req.body.ct_codigo || 'CT001';
        const celular = req.body.cli_celular || '0999999999';

        // 3. Crear cliente usando el modelo
        const result = await modeloCliente.createCliente(pool, {
            ...req.body,
            // cli_codigo viaja como undefined/null al modelo
            ct_codigo: ciudad,
            cli_celular: celular
        });

        res.status(201).json({
            message: "Cliente creado exitosamente",
            data: result
        });

    } catch (error) {
        console.error("Error en createCliente:", error.message);
        res.status(500).json({ message: "Error interno al crear cliente", detail: error.message });
    }
};

/**
 * Obtener todos los clientes con paginación
 * Método: GET
 */
const getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const result = await modeloCliente.getAllClientes(pool, page);

        res.status(200).json({
            message: "Listado obtenido correctamente",
            count: result.length,
            data: result
        });
    } catch (error) {
        console.error("Error en getAllClientes:", error.message);
        res.status(500).json({ message: "Error al obtener clientes" });
    }
};

/**
 * Obtener cliente por ID
 * Método: GET /:id
 */
const getByID = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await modeloCliente.getClienteByID(pool, id);

        if (!result) return res.status(404).json({ message: "Cliente no encontrado" });

        res.status(200).json(result);
    } catch (error) {
        console.error("Error en getClienteByID:", error.message);
        res.status(500).json({ message: "Error al buscar cliente" });
    }
};

/**
 * Actualizar cliente existente
 * Método: PUT /:id
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar datos (modo actualización)
        const errors = validateClienteDTO(req.body, true);
        if (errors.length) return res.status(400).json({ errors });

        const result = await modeloCliente.updateCliente(pool, id, req.body);

        if (!result) return res.status(404).json({ message: "Cliente no encontrado para actualizar" });

        res.status(200).json({ message: "Cliente actualizado correctamente", data: result });
    } catch (error) {
        console.error("Error en updateCliente:", error.message);
        res.status(500).json({ message: "Error al actualizar cliente" });
    }
};

/**
 * Eliminación lógica de cliente (Estado -> INA)
 * Método: DELETE /:id
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await modeloCliente.deleteCliente(pool, id);
        res.status(200).json({ message: "Cliente eliminado correctamente" });
    } catch (error) {
        console.error("Error en deleteCliente:", error.message);
        res.status(500).json({ message: "Error al eliminar cliente" });
    }
};

/**
 * Buscar clientes por nombre aproximado
 * Método: GET /search?name=...
 */
const getByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: "El parámetro 'name' es requerido" });

        const result = await modeloCliente.getClienteByName(pool, name);
        res.status(200).json({ data: result });
    } catch (error) {
        console.error("Error en getByName:", error.message);
        res.status(500).json({ message: "Error en la búsqueda" });
    }
};

/**
 * Obtener lista simplificada para selectores/combos
 * Método: GET /type
 */
const getAsType = async (req, res) => {
    try {
        const result = await modeloCliente.getClienteForSelect(pool);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error en getAsType:", error.message);
        res.status(500).json({ message: "Error al obtener lista de tipos" });
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