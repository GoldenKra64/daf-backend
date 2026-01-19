const { getConnectionWithCredentials } = require('../config/db_pos.js');
const {
  createOrdenCompra,
  getOrdenCompraByID,
  getDetallesByOC,
  getAllOrdenCompra,
  getCountOrdenCompra,
  getOrdenCompraByProveedor,
  searchOrdenCompraBySupplier,
  getCountBySupplierSearch,
  upsertDetalleOC,
  deleteDetalleOC,
  aprobarOC,
  anularOC,
} = require('../models/ordencompra.model');

const connectFromJWT = (req) => {
  const { usuario, password } = req.user;
  return getConnectionWithCredentials(usuario, password);
};

// CREATE cabecera
const create = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "La solicitud no puede ser vacia" });
  }
  if (!req.body.prv_codigo) {
    return res.status(400).json({ message: "prv_codigo es requerido" });
  }

  const pool = connectFromJWT(req);

  try {
    const result = await createOrdenCompra(pool, req.body);
    // opcional: devolver cabecera completa
    const cabecera = await getOrdenCompraByID(pool, result.oc_codigo);

    res.status(201).json({
      oc_codigo: result.oc_codigo,
      cabecera
    });
  } catch (error) {
    // Postgres: check/fk/raise exception
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// READ ALL (opcional filtrar por estado ?estado=PEN)
const getAll = async (req, res) => {
  const pool = connectFromJWT(req);
  const page = parseInt(req.query.page) || 1;
  const estado = req.query.estado || null;
  const searchTerm = req.query.q; // Parámetro de búsqueda

  try {
    let result, count;

    if (searchTerm) {
      // Búsqueda por nombre o RUC de proveedor
      result = await searchOrdenCompraBySupplier(pool, searchTerm, page, estado);
      count = await getCountBySupplierSearch(pool, searchTerm, estado);
    } else {
      // Listado normal
      result = await getAllOrdenCompra(pool, page, estado);
      count = await getCountOrdenCompra(pool, estado);
    }

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron órdenes de compra' });
    }

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

// READ ONE + detalles
const getByID = async (req, res) => {
  if (req.params.id === undefined) {
    return res.status(400).json({ message: 'El parámetro id es requerido' });
  }

  const pool = connectFromJWT(req);
  const { id } = req.params;

  try {
    const cabecera = await getOrdenCompraByID(pool, id);

    if (!cabecera) {
      return res.status(404).json({ message: 'No se encontró la orden de compra' });
    }

    const detalles = await getDetallesByOC(pool, id);

    res.status(200).json({ cabecera, detalles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// SEARCH por proveedor: /search?prv=PRV000...&page=1
const getByProveedor = async (req, res) => {
  if (req.query.prv === undefined) {
    return res.status(400).json({ message: 'El parámetro prv es requerido' });
  }

  const pool = connectFromJWT(req);
  const { prv } = req.query;
  const page = parseInt(req.query.page) || 1;

  try {
    const result = await getOrdenCompraByProveedor(pool, prv, page);

    if (!result.length) {
      return res.status(404).json({ message: 'No se encontraron órdenes para ese proveedor' });
    }

    // Count total sin paginación (opcional)
    const count = await getCountOrdenCompra(pool);

    res.status(200).json({
      page,
      limit: process.env.PAGINATION_LIMIT,
      count,
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// UPSERT detalle (insert/update cantidad)
const upsertDetalle = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "La solicitud no puede ser vacia" });
  }

  const { id } = req.params; // oc_codigo
  const { mp_codigo, pxoc_cantidad } = req.body;

  if (!mp_codigo || pxoc_cantidad === undefined) {
    return res.status(400).json({ message: "mp_codigo y pxoc_cantidad son requeridos" });
  }

  const pool = connectFromJWT(req);

  try {
    const det = await upsertDetalleOC(pool, {
      oc_codigo: id,
      mp_codigo,
      pxoc_cantidad
    });

    const cabecera = await getOrdenCompraByID(pool, id);
    const detalles = await getDetallesByOC(pool, id);

    res.status(200).json({ cabecera, detalle_actualizado: det, detalles });
  } catch (error) {
    // Aquí caerán las reglas del trigger: OC no está PEN, cantidad inválida, etc.
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// DELETE detalle
const removeDetalle = async (req, res) => {
  const pool = connectFromJWT(req);
  const { id, mp } = req.params; // id=oc_codigo, mp=mp_codigo

  try {
    const deleted = await deleteDetalleOC(pool, id, mp);

    if (!deleted) {
      return res.status(404).json({ message: 'Detalle no encontrado' });
    }

    const cabecera = await getOrdenCompraByID(pool, id);
    const detalles = await getDetallesByOC(pool, id);

    res.status(200).json({ message: 'Detalle eliminado', cabecera, detalles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// Aprobar OC (dispara sincronización + kardex + stock)
const aprobar = async (req, res) => {
  const pool = connectFromJWT(req);
  const { id } = req.params;

  try {
    const result = await aprobarOC(pool, id);

    if (!result) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    const cabecera = await getOrdenCompraByID(pool, id);
    const detalles = await getDetallesByOC(pool, id);

    res.status(200).json({ message: 'Orden aprobada', cabecera, detalles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

// Anular OC
const anular = async (req, res) => {
  const pool = connectFromJWT(req);
  const { id } = req.params;

  try {
    const result = await anularOC(pool, id);

    if (!result) {
      return res.status(404).json({ message: 'Orden de compra no encontrada' });
    }

    const cabecera = await getOrdenCompraByID(pool, id);
    const detalles = await getDetallesByOC(pool, id);

    res.status(200).json({ message: 'Orden anulada', cabecera, detalles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await pool.end();
  }
};

module.exports = {
  create,
  getAll,
  getByID,
  getByProveedor,
  upsertDetalle,
  removeDetalle,
  aprobar,
  anular
};
