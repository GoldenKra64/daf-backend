const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.proveedor.controller');

// ENDPOINTS
router.post('/', verifyToken, controller.create);
router.get('/', verifyToken, controller.getAll);
router.get('/:id', verifyToken, controller.getByID);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;