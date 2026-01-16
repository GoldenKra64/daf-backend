const express = require('express');

const router = express.Router();

const controller = require('../controllers/ecom.ciudad.controller');

router.get('/', controller.getAll);

module.exports = router;