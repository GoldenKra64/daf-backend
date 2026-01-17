const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.categoria.controller');

router.get('/', verifyToken, controller.getAll);

module.exports = router;
