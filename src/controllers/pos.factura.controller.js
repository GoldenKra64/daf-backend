const { getFacturaConnectionWithCredentials } = require('../config/db.factura.js');
const FacturaModel = require('../models/factura.model');

const getCredsFromJWT = (req) => {
  const usuario = req.user?.usuario || req.user?.user; // compat
  const password = req.user?.password;
  return { usuario, password };
};


/* =====================================================
   1️⃣ LISTAR LAS FACTURAS
===================================================== */
const getAllFacturas = async (req, res) => {
    try {
        const { usuario, password } = req.user;
        const pool = getConnectionWithCredentials(usuario, password);

        // Paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const [facturas, total] = await Promise.all([
            FacturaModel.getAllFacturas(pool, limit, offset, search),
            FacturaModel.countAllFacturas(pool, search)
        ]);

        return res.json({
            data: facturas,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener facturas' });
    } finally {
        await pool.end();
    }
};

/* =====================================================
   2️⃣ OBTENER FACTURA + DETALLE
===================================================== */
const getFacturaByCodigo = async (req, res) => {
    const { facCodigo } = req.params;

    try {
        const { usuario, password } = req.user;
        const pool = getConnectionWithCredentials(usuario, password);

        const factura = await FacturaModel.getFacturaByCodigo(pool, facCodigo);
        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        const detalle = await FacturaModel.getDetalleFactura(pool, facCodigo);
        return res.json({ factura, detalle });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener factura' });
    } finally {
        await pool.end();
    }
};

/* =====================================================
   3️⃣ CREAR FACTURA (PEN)
===================================================== */
const createFactura = async (req, res) => {


    try {
        const { cli_codigo, fac_descripcion } = req.body;
        const { usuario, password } = req.user;

        const pool = getConnectionWithCredentials(usuario, password);

        const result = await FacturaModel.createFactura(pool, {
            cli_codigo,
            fac_descripcion
        });

        return res.status(201).json(result);

    } catch (error) {
        console.error('ERROR CREATE FACTURA:', error);
        return res.status(500).json({ message: 'Error al crear factura' });
    } finally {
        await pool.end();
    }
};

/* =====================================================
   4️⃣ AGREGAR DETALLE
===================================================== */
const addDetalleFactura = async (req, res) => {
    try {
        const { fac_codigo, prd_codigo, pxfa_cantidad } = req.body;
        const { usuario, password } = req.user;

        const pool = getConnectionWithCredentials(usuario, password);

        // 🔎 Contexto REAL de la conexión
        const ctx = await pool.query(`
      SELECT current_database() AS db, current_user AS usr
    `);

        await FacturaModel.insertDetalleFactura(pool, {
            fac_codigo,
            prd_codigo,
            pxfa_cantidad
        });

        // 🔎 Verificación inmediata en BD (MISMA conexión)
        const check = await pool.query(
            `SELECT * 
         FROM detalle_factura 
        WHERE fac_codigo = $1 
        ORDER BY pxfa_codigo DESC`,
            [fac_codigo]
        );
        await FacturaModel.recalcTotalesFactura(pool, fac_codigo);

        const fullData = await FacturaModel.getFacturaByCodigo(pool, fac_codigo);

        return res.json({
            message: 'Detalle agregado correctamente',
            factura: fullData.factura,
            detalle: fullData.detalle
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Producto ya en lista' });
        }
        console.error('❌ ERROR ADD DETALLE:', error);
        return res.status(400).json({ message: error.message });
    } finally {
        await pool.end();
    }
};


/* =====================================================
   5️⃣ APROBAR FACTURA (TRANSACCIONAL)
===================================================== */
const aprobarFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const { usuario, password } = req.user;

    const pool = getConnectionWithCredentials(usuario, password);

    try {
        // Toda la lógica de negocio (Referencia, Kardex, Stock, Estado) 
        // ahora reside en el Stored Procedure 'aprobar_factura'
        await FacturaModel.aprobarFactura(pool, facCodigo);

        // Obtener datos actualizados para responder al frontend
        const fullData = await FacturaModel.getFacturaByCodigo(pool, facCodigo);

        res.json({
            message: 'Factura aprobada correctamente',
            factura: fullData.factura,
            detalle: fullData.detalle
        });

    } catch (error) {
        console.error('ERROR APROBAR FACTURA (SP):', error);

        let message = 'No se pudo aprobar la factura. Por favor, intente de nuevo.';

        if (error.message.includes('estado PENDIENTE')) {
            message = 'Esta factura ya no está pendiente y no puede ser aprobada.';
        } else if (error.message.includes('Stock insuficiente')) {
            message = error.message;
        } else if (error.message.includes('no existe')) {
            message = 'La factura solicitada no existe.';
        }

        res.status(400).json({ message });
    } finally {
        await pool.end();
    }
};


/* =====================================================
   6️⃣ ANULAR FACTURA
===================================================== */
const anularFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const { usuario, password } = req.user;

    const pool = getConnectionWithCredentials(usuario, password);

    try {
        // Lógica delegada al SP en BD
        await FacturaModel.anularFactura(pool, facCodigo);

        return res.json({
            message: 'Factura anulada correctamente'
        });

    } catch (error) {
        console.error('ERROR ANULAR FACTURA:', error);

        let message = 'No se pudo anular la factura. Por favor, intente de nuevo.';

        if (error.message.includes('no se puede anular')) {
            message = error.message;
        } else if (error.message.includes('no existe')) {
            message = 'La factura solicitada no existe.';
        }

        return res.status(400).json({ message });
    } finally {
        await pool.end();
    }
};

/* =====================================================
   7️⃣ ACTUALIZAR DETALLE
===================================================== */
const updateDetalleFactura = async (req, res) => {
    const { pxfaCodigo } = req.params;
    const { pxfa_cantidad } = req.body;
    const { usuario, password } = req.user;

    const pool = getConnectionWithCredentials(usuario, password);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const updated = await FacturaModel.updateDetalleFactura(client, {
            pxfa_codigo: pxfaCodigo,
            pxfa_cantidad
        });

        if (!updated) {
            throw new Error('No se puede modificar el detalle (factura no PEN o detalle no existe)');
        }

        await FacturaModel.recalcTotalesFactura(client, updated.fac_codigo);

        await client.query('COMMIT');

        const fullData = await FacturaModel.getFacturaByCodigo(pool, updated.fac_codigo);
        return res.json({
            message: 'Detalle actualizado correctamente',
            factura: fullData.factura,
            detalle: fullData.detalle
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('ERROR UPDATE DETALLE:', error);
        return res.status(400).json({ message: error.message });
    } finally {
        client.release();
        await pool.end();
    }
};


/* =====================================================
   8️⃣ ELIMINAR DETALLE
===================================================== */
const deleteDetalleFactura = async (req, res) => {
    const { pxfaCodigo } = req.params;

    const { usuario, password } = req.user;
    const pool = getConnectionWithCredentials(usuario, password);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const facCodigo = await FacturaModel.deleteDetalleFactura(client, pxfaCodigo);

        if (!facCodigo) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'No se puede eliminar el detalle (factura no PEN o no existe)'
            });
        }

        await client.query('COMMIT');

        const fullData = await FacturaModel.getFacturaByCodigo(pool, facCodigo);
        return res.json({
            message: 'Detalle eliminado correctamente',
            factura: fullData.factura,
            detalle: fullData.detalle
        });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Error interno al eliminar detalle' });
    } finally {
        client.release();
        await pool.end();
    }
};

/* =====================================================
   9️⃣ ELIMINAR FACTURA CABECERA (SOLO PEN)
===================================================== */
const deleteFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const { usuario, password } = req.user;

    const pool = getConnectionWithCredentials(usuario, password);

    try {
        const deleted = await FacturaModel.deleteFactura(pool, facCodigo);
        if (!deleted) {
            return res.status(400).json({
                message: 'No se pudo eliminar la factura (puede que no exista o no esté en estado PENDIENTE)'
            });
        }
        return res.json({ message: 'Factura eliminada correctamente' });
    } catch (error) {
        console.error('ERROR DELETE FACTURA:', error);
        return res.status(500).json({ message: 'Error interno al eliminar factura' });
    } finally {
        await pool.end();
    }
};

/* =====================================================
   EXPORT
===================================================== */
module.exports = {
    getAllFacturas,
    getFacturaByCodigo,
    createFactura,
    addDetalleFactura,
    aprobarFactura,
    anularFactura,
    updateDetalleFactura,
    deleteDetalleFactura,
    deleteFactura
};
