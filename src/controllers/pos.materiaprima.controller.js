const { getConnectionWithCredentials } = require('../config/db');
const {
  createMateriaPrima,
  updateMateriaPrima,
  getAllMateriaPrima,
  getMateriaPrimaByName,
  deleteMateriaPrima,
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

  try {
    const result = await getAllMateriaPrima(pool);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

const getByName = async (req, res) => {
  const pool = connectFromJWT(req);
  const { name } = req.query;

  try {
    const result = await getMateriaPrimaByName(pool, name);
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
    const result = await deleteMateriaPrima(pool, id);
    res.status(204).send();
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
  remove,
};