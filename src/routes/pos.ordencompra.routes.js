const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.ordencompra.controller');

// ENDPOINTS
router.post('/', verifyToken, controller.create);

router.get('/search', verifyToken, controller.getByProveedor); // ?prv=...&page=1
router.get('/:id', verifyToken, controller.getByID);
router.get('/', verifyToken, controller.getAll); // ?page=1&estado=PEN

// Detalles
router.post('/:id/detalle', verifyToken, controller.upsertDetalle);     // body: { mp_codigo, pxoc_cantidad }
router.delete('/:id/detalle/:mp', verifyToken, controller.removeDetalle);

// Estado
router.post('/:id/aprobar', verifyToken, controller.aprobar);
router.post('/:id/anular', verifyToken, controller.anular);

module.exports = router;
