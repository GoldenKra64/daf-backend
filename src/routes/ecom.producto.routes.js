const express = require('express');
const router = express.Router();
const controller = require('../controllers/ecom.producto.controller');

// GET /api/ecom/producto
// Query params: q, cat, minPrice, maxPrice, page
router.get('/', controller.list);

// GET /api/ecom/producto/:id
router.get('/:id', controller.getOne);

module.exports = router;
