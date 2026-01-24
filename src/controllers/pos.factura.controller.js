const { getConnectionWithCredentials } = require('../config/db_pos.js');
const FacturaModel = require('../models/factura.model');

/* =====================================================
   1️⃣ LISTAR LAS FACTURAS
===================================================== */
const getAllFacturas = async (req, res) => {
    try {
        const { user, password } = req.user;
        const pool = getConnectionWithCredentials(user, password);

        const facturas = await FacturaModel.getAllFacturas(pool);
        return res.json(facturas);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener facturas' });
    }
};

/* =====================================================
   2️⃣ OBTENER FACTURA + DETALLE
===================================================== */
const getFacturaByCodigo = async (req, res) => {
    const { facCodigo } = req.params;

    try {
        const { user, password } = req.user;
        const pool = getConnectionWithCredentials(user, password);

        const factura = await FacturaModel.getFacturaByCodigo(pool, facCodigo);
        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        const detalle = await FacturaModel.getDetalleFactura(pool, facCodigo);
        return res.json({ factura, detalle });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener factura' });
    }
};

/* =====================================================
   3️⃣ CREAR FACTURA (PEN)
===================================================== */
const createFactura = async (req, res) => {
    console.log('HEADERS:', req.headers['content-type'])
    console.log('REQ.BODY:', req.body)

    try {
        const { cli_codigo, fac_descripcion } = req.body;
        const { user, password } = req.user;

        const pool = getConnectionWithCredentials(user, password);

        const result = await FacturaModel.createFactura(pool, {
            cli_codigo,
            fac_descripcion
        });

        return res.status(201).json(result);

    } catch (error) {
        console.error('ERROR CREATE FACTURA:', error);
        return res.status(500).json({ message: 'Error al crear factura' });
    }
};

/* =====================================================
   4️⃣ AGREGAR DETALLE
===================================================== */
const addDetalleFactura = async (req, res) => {
    try {
        console.log('--- ADD DETALLE FACTURA ---');

        console.log('REQ.BODY:', req.body);
        console.log('REQ.USER:', req.user);

        const { fac_codigo, prd_codigo, pxfa_cantidad } = req.body;
        const { user, password } = req.user;

        console.log('fac_codigo:', fac_codigo);
        console.log('prd_codigo:', prd_codigo);
        console.log('pxfa_cantidad:', pxfa_cantidad);

        const pool = getConnectionWithCredentials(user, password);

        // 🔎 Contexto REAL de la conexión
        const ctx = await pool.query(`
      SELECT current_database() AS db, current_user AS usr
    `);
        console.log('DB CONTEXT:', ctx.rows[0]);

        console.log('➡️ Ejecutando insertDetalleFactura...');
        await FacturaModel.insertDetalleFactura(pool, {
            fac_codigo,
            prd_codigo,
            pxfa_cantidad
        });
        console.log('✅ insertDetalleFactura ejecutado');

        // 🔎 Verificación inmediata en BD (MISMA conexión)
        const check = await pool.query(
            `SELECT * 
         FROM detalle_factura 
        WHERE fac_codigo = $1 
        ORDER BY pxfa_codigo DESC`,
            [fac_codigo]
        );
        console.log('ROWS AFTER INSERT:', check.rows);

        console.log('➡️ Recalculando totales...');
        await FacturaModel.recalcTotalesFactura(pool, fac_codigo);
        console.log('✅ Totales recalculados');

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
    }
};


/* =====================================================
   5️⃣ APROBAR FACTURA (TRANSACCIONAL)
===================================================== */
const aprobarFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const { user, password } = req.user;

    const pool = getConnectionWithCredentials(user, password);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insertar transacción (EGR)
        const trnCod = await FacturaModel.insertTransaccion(client, {
            tipo: 'EGR',
            referencia: facCodigo
        });

        // 2. Obtener detalle
        const detalles = await FacturaModel.getDetalleFactura(client, facCodigo);
        if (detalles.length === 0) {
            throw new Error('Factura sin detalle');
        }

        // 3. Kardex + stock
        for (const item of detalles) {
            const updated = await FacturaModel.updateStockProducto(
                client,
                item.prd_codigo,
                item.pxfa_cantidad
            );

            if (updated === 0) {
                throw new Error(`Stock insuficiente para ${item.prd_codigo}`);
            }

            await FacturaModel.insertKardexProducto(client, {
                trn_cod: trnCod,
                prd_codigo: item.prd_codigo,
                cantidad: item.pxfa_cantidad,
                accion: 'EGR'
            });
        }

        // 4. Cambiar estado factura
        const ok = await FacturaModel.aprobarFactura(client, facCodigo);
        if (ok === 0) {
            throw new Error('Factura no está en estado PEN');
        }

        await client.query('COMMIT');

        const fullData = await FacturaModel.getFacturaByCodigo(pool, facCodigo);
        res.json({
            message: 'Factura aprobada correctamente',
            factura: fullData.factura,
            detalle: fullData.detalle
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('ERROR APROBAR FACTURA:', error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
        await pool.end();
    }
};


/* =====================================================
   6️⃣ ANULAR FACTURA
===================================================== */
const anularFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const { user, password } = req.user;

    const pool = getConnectionWithCredentials(user, password);

    try {
        await FacturaModel.anularFacturaCompleta(pool, facCodigo);
        return res.json({ message: 'Factura anulada correctamente' });

    } catch (error) {
        console.error('ERROR ANULAR FACTURA (BACKEND):', error);
        return res.status(400).json({
            message: error.message,
            stack: error.stack
        });
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
    const { user, password } = req.user;

    const pool = getConnectionWithCredentials(user, password);
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

    const { user, password } = req.user;
    const pool = getConnectionWithCredentials(user, password);
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
    deleteDetalleFactura
};
