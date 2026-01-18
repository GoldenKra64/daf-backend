const express = require('express');
const router = express.Router();

const controller = require('../controllers/pos.ciudad.controller');
const { verifyToken } = require('../middlewares/pos.auth.middleware');

router.get('/', verifyToken, controller.list);

module.exports = router;
