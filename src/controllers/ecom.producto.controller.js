const productoModel = require('../models/ecom.producto.model');

/**
 * Listar productos con filtros y paginación
 */
const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(process.env.PAGINATION_LIMIT) || 20;
    const offset = (page - 1) * limit;

    const filters = {
      q: req.query.q,
      cat: req.query.cat,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      limit,
      offset
    };

    const products = await productoModel.getPublicProducts(filters);
    
    // Obtener total del window function del primer row (si existe)
    const totalCount = products.length > 0 ? parseInt(products[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Limpiar el campo total_count de cada objeto para no ensuciar el JSON
    const cleanProducts = products.map(p => {
      const { total_count, ...rest } = p;
      return rest;
    });

    res.json({
      data: cleanProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });

  } catch (error) {
    console.error("Error en listado de productos públicos:", error.message);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

/**
 * Obtener detalle de un producto
 */
const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productoModel.getPublicProductByID(id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);

  } catch (error) {
    console.error("Error al obtener detalle de producto:", error.message);
    res.status(500).json({ message: "Error al obtener detalle del producto" });
  }
};

module.exports = {
  list,
  getOne
};
