const { getConnection } = require("../config/db_ecom.js");
const { 
  upsertDetalles,
  getCarritoByEmail,
  countDetallesCarrito,
  countDetallesCarritoFilter,
  getDetallesCarrito,
  searchDetallesCarrito,
  updateCantidadProducto,
  deleteProductoCarrito } = require("../models/carrito.model.js");

const addProductoOnCarrito = async (req, res) => {
  try {
    const { email } = req.user;
    const { prd_codigo } = req.body;
    const pool = await getConnection();
    const carrito = await getCarritoByEmail(pool, email);

    if (!carrito) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    await upsertDetalles(pool, carrito.crr_codigo, prd_codigo);

    res.status(201).json({
      message: "Producto añadido al carrito",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error al añadir el producto al carrito",
    });
  }
}
const getCarrito = async (req, res) => {
  try {
    const { email } = req.user;
    const page = Number(req.query.page) || 1;

    const pool = await getConnection();
    const carrito = await getCarritoByEmail(pool, email);

    const count = await countDetallesCarrito(pool, carrito.crr_codigo);

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const detalles = await getDetallesCarrito(
      pool,
      carrito.crr_codigo,
      page
    );

    res.json({
        page: page,
        limit: Number(process.env.PAGINATION_LIMIT),
        totalPages: Math.ceil(count.count / process.env.PAGINATION_LIMIT),
        carrito,
        detalles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

const searchCarritoDetalles = async (req, res) => {
  try {
    const { email } = req.user;
    const { name } = req.query;
    const page = Number(req.query.page) || 1;

    if (!name) {
      return res.status(400).json({ message: "Parámetro name requerido" });
    }

    const pool = await getConnection();
    const carrito = await getCarritoByEmail(pool, email);

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    const count = await countDetallesCarritoFilter(
        pool,
        carrito.crr_codigo,
        name
    );

    const detalles = await searchDetallesCarrito(
        pool,
        carrito.crr_codigo,
        name,
        page
    );

    res.json({
        page,
        limit: Number(process.env.PAGINATION_LIMIT),
        totalPages: Math.ceil(count.count / process.env.PAGINATION_LIMIT),
        filtros: { name },
        detalles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar productos" });
  }
};

const updateCantidad = async (req, res) => {
  try {
    const { email } = req.user;
    const { prd_codigo, cantidad } = req.body;

    if (!prd_codigo || cantidad == null) {
      return res.status(400).json({
        message: "prd_codigo y cantidad son requeridos",
      });
    }

    const pool = await getConnection();
    const carrito = await getCarritoByEmail(pool, email);

    if (!carrito) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    await updateCantidadProducto(
      pool,
      carrito.crr_codigo,
      prd_codigo,
      cantidad
    );

    res.json({
      message: "Cantidad actualizada correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al actualizar cantidad",
    });
  }
};

const deleteDetalle = async (req, res) => {
  try {
    const { email } = req.user;
    const { prd_codigo } = req.params;

    if (!prd_codigo) {
      return res.status(400).json({
        message: "prd_codigo es requerido",
      });
    }

    const pool = await getConnection();
    const carrito = await getCarritoByEmail(pool, email);

    if (!carrito) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    await deleteProductoCarrito(
      pool,
      carrito.crr_codigo,
      prd_codigo
    );

    res.json({
      message: "Producto eliminado del carrito",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al eliminar producto",
    });
  }
};


module.exports = {
  addProductoOnCarrito,
  getCarrito,
  searchCarritoDetalles,
  updateCantidad,
  deleteDetalle,
};