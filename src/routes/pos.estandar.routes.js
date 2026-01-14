const express = require('express');
const router = express.Router();
const controller = require('../controllers/pos.estandar.controller');
const { verifyToken } = require('../middlewares/pos.auth.middleware.js');

// CABECERA
router.post('/', verifyToken, controller.create);
router.get('/:est_cod', verifyToken, controller.getById);
router.get('/', verifyToken, controller.getAll);

router.put('/:est_cod/aprobar', verifyToken, controller.approveCabeceraEstandar);
router.put('/:est_cod/anular', verifyToken, controller.anuCabeceraEstandar);

// DETALLES
router.put('/:est_cod/detalle', verifyToken, controller.createDetalle);
router.delete('/:est_cod/detalle', verifyToken, controller.deleteDetalleById);

module.exports = router;