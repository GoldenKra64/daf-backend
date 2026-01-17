const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.producto.controller');

// ENDPOINTS
router.post('/', verifyToken, controller.create);
router.get('/search', verifyToken, controller.getByName);
router.get('/type', verifyToken, controller.getAsType);
router.get('/:id', verifyToken, controller.getByID);
router.get('/', verifyToken, controller.getAll);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;
