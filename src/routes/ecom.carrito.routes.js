const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware.js");
const carritoController = require("../controllers/ecom.carrito.controller.js");

router.post(
  "/",
  authMiddleware,
  carritoController.addProductoOnCarrito
);

router.get(
  "/",
  authMiddleware,
  carritoController.getCarrito
);

router.get(
  "/name",
  authMiddleware,
  carritoController.searchCarritoDetalles
);

router.put(
  "/detalle",
  authMiddleware,
  carritoController.updateCantidad
);

router.delete(
  "/detalle/:prd_codigo",
  authMiddleware,
  carritoController.deleteDetalle
);

module.exports = router;