const {
  createEstandar,
  getEstandarById,
  getAllEstandares,
  upsertDetalles,
  deleteDetalle,
  approveHeader,
  anuHeader
} = require('../models/estandar.model');

const { getConnectionWithCredentials } = require('../config/db');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

// CREATE CABECERA + DETALLES
const create = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await createEstandar(pool, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// GET CABECERA + DETALLES
const getAll = async (req, res) => {
  const pool = connectFromJWT(req);
  const page = parseInt(req.query.page) || 1;

  try {
    const result = await getAllEstandares(pool, page);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

const getById = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await getEstandarById(pool, req.params.est_cod);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// ADD DETALLE
const createDetalle = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const { detalles } = req.body;

    if (!Array.isArray(detalles)) {
      return res.status(400).json({
        message: 'detalles debe ser un arreglo'
      });
    }

    await upsertDetalles(pool, req.params.est_cod, detalles);
    res.status(201).json({ message: 'Detalle agregado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// DELETE DETALLE (HARD DELETE)
const deleteDetalleById = async (req, res) => {
  const pool = connectFromJWT(req);

  const { materiasprimas } = req.body;

  try {
    await deleteDetalle(pool, req.params.est_cod, materiasprimas);
    return res.status(200).json({ message: 'Detalle eliminado ' + materiasprimas.length + ' registros' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

const approveCabeceraEstandar = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await approveHeader(pool, req.params.est_cod);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
}

const anuCabeceraEstandar = async (req, res) => {
  const pool = connectFromJWT(req);

  try {
    const result = await anuHeader(pool, req.params.est_cod);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
}

module.exports = {
  create,
  getById,
  getAll,
  createDetalle,
  deleteDetalleById,
  approveCabeceraEstandar,
  anuCabeceraEstandar
};