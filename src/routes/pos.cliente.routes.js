const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/pos.cliente.controller');

// Definición de rutas CRUD para Cliente

// 1. Crear Cliente
router.post('/', clienteController.create);

// 2. Obtener Todos (Paginado)
router.get('/', clienteController.getAll);

// 3. Tipos/Selectores (Debe ir antes de :id para evitar colisiones)
router.get('/type', clienteController.getAsType);

// 4. Búsqueda por Nombre (Debe ir antes de :id)
router.get('/search', clienteController.getByName);

// 5. Obtener por ID
router.get('/:id', clienteController.getByID);

// 6. Actualizar
router.put('/:id', clienteController.update);

// 7. Eliminar (Logico)
router.delete('/:id', clienteController.remove);

module.exports = router;