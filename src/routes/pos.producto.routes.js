const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.producto.controller');

router.get('/type', verifyToken, controller.getAsType);

module.exports = router;