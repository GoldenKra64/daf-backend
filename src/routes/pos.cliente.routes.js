const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/pos.cliente.controller');

// Middleware de protección para todas las rutas
router.use(verifyToken);

// Definición de rutas CRUD para Cliente

router.post('/', verifyToken, clienteController.create);

router.get('/', verifyToken, clienteController.getAll);
router.get('/type', verifyToken, clienteController.getAsType);
router.get('/search', verifyToken, clienteController.getByName);
router.get('/:id', verifyToken, clienteController.getByID);
router.put('/:id', verifyToken, clienteController.update);

router.delete('/:id', verifyToken, clienteController.remove);

module.exports = router;