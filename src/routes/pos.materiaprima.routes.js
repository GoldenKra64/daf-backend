const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.materiaprima.controller');

// ENDPOINTS
router.get('/', verifyToken, controller.getAll);
router.get('/', verifyToken, controller.getByName);
router.get('/:id', verifyToken, controller.getByID);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;