const express = require('express');
const router = express.Router();
const { login } = require('../controllers/pos.auth.controller.js');
const { verifyToken } = require('../middlewares/pos.auth.middleware.js');
const { getAccess } = require('../controllers/pos.access.controller.js');

// POS Routes
router.post('/login', login);
router.get('/access', verifyToken, getAccess);

module.exports = router;