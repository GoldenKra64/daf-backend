const { getConnection } = require("../config/db_ecom.js");
const { 
    getCarritoByEmail,
    getDetallesCarrito,
    getCarritoByCodigo,
    updateCantidadProducto,
    deleteProductoCarrito } = require("../models/carrito.model.js");

const getCarrito = async (req, res) => {
  try {
    const { email } = req.user;
    const pool = await getConnection();

    const carrito = await getCarritoByEmail(pool, email);

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const detalles = await getDetallesCarrito(
        pool,
        carrito.crr_codigo
    );

    res.json({
      carrito,
      detalles,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

const updateCantidad = async (req, res) => {
  try {
    const { email } = req.user;
    const { prd_codigo, cantidad } = req.body;

    const pool = getConnection();

    const carrito = await getCarritoByEmail(
      pool,
      email
    );

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    await updateCantidadProducto(
      pool,
      carrito.crr_codigo,
      prd_codigo,
      cantidad
    );

    const carritoActualizado = await getCarritoByCodigo(
      pool,
      carrito.crr_codigo
    );

    const detalles = await getDetallesCarrito(
      pool,
      carrito.crr_codigo
    );

    res.json({
      carrito: carritoActualizado,
      detalles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al actualizar cantidad",
    });
  }
};

const deleteDetalle = async (req, res) => {
  try {
    const { email } = req.user;
    const { prd_codigo } = req.params;

    const pool = getConnection();

    const carrito = await getCarritoByEmail(pool, email);

    await deleteProductoCarrito(
        pool,
        carrito.crr_codigo,
        prd_codigo
    );


    const carritoActualizado = await getCarritoByCodigo(
      pool,
      carrito.crr_codigo
    );

    const detalles = await getDetallesCarrito(
      pool,
      carrito.crr_codigo
    );

    res.json({
        message: "Detalle eliminado con éxito",
        carrito: carritoActualizado,
        detalles,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto" });
  }
};

module.exports = {
  getCarrito,
  updateCantidad,
  deleteDetalle,
};