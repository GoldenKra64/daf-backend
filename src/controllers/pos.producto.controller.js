const { getConnectionWithCredentials } = require('../config/db_pos.js');
const {
  createProducto,
  updateProducto,
  getAllProducto,
  getProductoByName,
  getProductoByID,
  deleteProducto,
  getCountProducto,
  getProductoForSelect,
} = require('../models/producto.model');

const { validateProductoDTO } = require('../dtos/producto.dto');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

// CREATE
const create = async (req, res) => {
  const errors = validateProductoDTO(req.body);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await createProducto(pool, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// UPDATE
const update = async (req, res) => {
  const errors = validateProductoDTO(req.body, true);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await updateProducto(pool, req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// READ ALL
const getAll = async (req, res) => {
  const pool = connectFromJWT(req);
  const page = parseInt(req.query.page) || 1;

  try {
    const result = await getAllProducto(pool, page);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron productos' });
    }

    const count = await getCountProducto(pool);

    res.status(200).json({
      page,
      limit: process.env.PAGINATION_LIMIT,
      count: count,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// Get Parameter
const getByName = async (req, res) => {
  if (req.query.name === undefined) {
    return res.status(400).json({ message: 'El parámetro name es requerido' });
  }

  const pool = connectFromJWT(req);
  const { name } = req.query;
  const page = parseInt(req.query.page) || 1;

  try {
    const result = await getProductoByName(pool, name, page);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron productos con ese nombre' });
    }

    const count = await getCountProducto(pool);

    res.status(200).json({
      page,
      limit: process.env.PAGINATION_LIMIT,
      count: count,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// Get Unique
const getByID = async (req, res) => {
  if (req.params.id === undefined) {
    return res.status(400).json({ message: 'El parámetro id es requerido' });
  }

  const pool = connectFromJWT(req);
  const { id } = req.params;

  try {
    const result = await getProductoByID(pool, id);

    if (!result) {
      return res.status(404).json({ message: 'No se encontraron productos' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// DELETE
const remove = async (req, res) => {
  const pool = connectFromJWT(req);
  const { id } = req.params;

  try {
    await deleteProducto(pool, id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// Get Type (para SELECT)
const getAsType = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await getProductoForSelect(pool);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron productos' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

module.exports = {
  create,
  update,
  getAll,
  getByName,
  getByID,
  remove,
  getAsType,
};
