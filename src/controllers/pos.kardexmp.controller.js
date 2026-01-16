const { getConnectionWithCredentials } = require('../config/db_pos.js');
const {
  createKardexMP,
  updateKardexMP,
  getAllKardexMP,
  getKardexMPByName,
  getKardexMPByID,
  deleteKardexMP,
  getCountKardexMP
} = require('../models/kardexmp.model');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

// CREATE
const create = async (req, res) => {

  if (req.body == null) {
    return res.status(400).json({ message: "La solicitud no puede ser vacia" });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await createKardexMP(pool, req.body);
    res.status(201).json();
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// UPDATE
const update = async (req, res) => {
  if (req.body == null) {
    return res.status(400).json({ message: "La solicitud no puede ser vacia" });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await updateKardexMP(pool, req.params.id, req.body);
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
    const result = await getAllKardexMP(pool, page);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron registros de Kardex' });
    }
    const count = await getCountKardexMP(pool);

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
    const result = await getKardexMPByName(pool, name, page);
    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron materias primas con ese nombre' });
    }
    const count = await getCountKardexMP(pool);

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
    const result = await getKardexMPByID(pool, id);

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
    const result = await deleteKardexMP(pool, id);
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
  getByID,
  remove,
};