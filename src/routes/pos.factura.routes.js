const express = require('express');
const router = express.Router();

const {
    getAllFacturas,
    getFacturaByCodigo,
    createFactura,
    addDetalleFactura,
    updateDetalleFactura,
    deleteDetalleFactura,
    aprobarFactura,
    anularFactura
} = require('../controllers/pos.factura.controller');

const { verifyToken } = require('../middlewares/pos.auth.middleware');

/* =====================================================
   FACTURAS - CABECERA
===================================================== */

// Listar facturas
router.get('/factura', verifyToken, getAllFacturas);

// Obtener factura + detalle
router.get('/factura/:facCodigo', verifyToken, getFacturaByCodigo);

// Crear factura (estado PEN)
router.post('/factura', verifyToken, createFactura);

// Aprobar factura
router.put('/factura/:facCodigo/aprobar', verifyToken, aprobarFactura);


// Anular factura
router.put('/factura/:facCodigo/anular', verifyToken, anularFactura);

/* =====================================================
   FACTURAS - DETALLE
===================================================== */

// Agregar producto al detalle
router.post('/factura/detalle', verifyToken, addDetalleFactura);


// Actualizar cantidad del detalle
router.put('/factura/detalle/:pxfaCodigo', verifyToken, updateDetalleFactura);

// Eliminar producto del detalle
router.delete('/factura/detalle/:pxfaCodigo', verifyToken, deleteDetalleFactura);

module.exports = router;
