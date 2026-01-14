const { getConnectionWithCredentials } = require('../config/db');
const {
  createMateriaPrima,
  updateMateriaPrima,
  getAllMateriaPrima,
  getMateriaPrimaByName,
  getMateriaPrimaByID,
  deleteMateriaPrima,
  getCountMateriaPrima,
  getMateriaPrimaForSelect
} = require('../models/materiaprima.model');

const { validateMateriaPrimaDTO } = require('../dtos/materiaprima.dto');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

// CREATE
const create = async (req, res) => {
  const errors = validateMateriaPrimaDTO(req.body);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await createMateriaPrima(pool, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// UPDATE
const update = async (req, res) => {
  const errors = validateMateriaPrimaDTO(req.body, true);

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await updateMateriaPrima(pool, req.params.id, req.body);
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
    const result = await getAllMateriaPrima(pool, page);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron materias primas' });
    }

    const count = await getCountMateriaPrima(pool);

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
    const result = await getMateriaPrimaByName(pool, name, page);
    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron materias primas con ese nombre' });
    }
    const count = await getCountMateriaPrima(pool);

    res.status(200).json({
      page,
      limit: process.env.PAGINATION_LIMIT,
      count: count,
      data: result
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
    const result = await getMateriaPrimaByID(pool, id);

    if (!result) {
      return res.status(404).json({ message: 'No se encontraron materias primas' });
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
    console.log('Eliminando materia prima');
    const result = await deleteMateriaPrima(pool, id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// Get Type
const getAsType = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await getMateriaPrimaForSelect(pool);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron materias primas' });
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
  getAsType
};