const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware.js");
const { validateCard, checkout } = require('../controllers/ecom.pagos.controller');

// Validación Luhn (puede ser pública o con auth; te la dejo pública)
router.post('/validate', validateCard);

// Pago real: requiere usuario logeado
router.post('/checkout', authMiddleware, checkout);

module.exports = router;
