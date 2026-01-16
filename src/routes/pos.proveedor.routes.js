<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.proveedor.controller');

// ENDPOINTS
router.post('/', verifyToken, controller.create);
router.get('/', verifyToken, controller.getAll);
router.get('/:id', verifyToken, controller.getByID);
=======
// src/routes/pos.proveedor.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/pos.proveedor.controller');
const { verifyToken } = require('../middlewares/pos.auth.middleware');

router.get('/', verifyToken, controller.list);
router.get('/:id', verifyToken, controller.findById);
router.post('/', verifyToken, controller.create);
>>>>>>> f14ea63 (Interfaz de Proveedor)
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;
