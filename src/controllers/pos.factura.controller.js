const pool = require('../config/db.factura');
const crypto = require('crypto');
const FacturaModel = require('../models/factura.model');

/* =====================================================
   1️⃣ LISTAR FACTURAS
===================================================== */
const getAllFacturas = async (req, res) => {
    try {
        const facturas = await FacturaModel.getAllFacturas(pool);
        res.json(facturas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener facturas' });
    }
};

/* =====================================================
   2️⃣ OBTENER FACTURA + DETALLE
===================================================== */
const getFacturaByCodigo = async (req, res) => {
    const { facCodigo } = req.params;

    try {
        const factura = await FacturaModel.getFacturaByCodigo(pool, facCodigo);

        if (!factura) {
            return res.status(404).json({ message: 'Factura no encontrada' });
        }

        const detalle = await FacturaModel.getDetalleByFactura(pool, facCodigo);

        res.json({ factura, detalle });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la factura' });
    }
};

/* =====================================================
   3️⃣ CREAR FACTURA (PEN)
===================================================== */
const createFactura = async (req, res) => {
    const { cli_codigo, fac_descripcion } = req.body;

    try {
        const query = `
      INSERT INTO factura (
        fac_codigo,
        cli_codigo,
        fac_fecha,
        fac_descripcion,
        fac_subtotal,
        fac_iva,
        fac_total,
        fac_estado
      )
      VALUES (
        next_fac_codigo(),
        $1,
        NOW(),
        $2,
        0,
        0,
        0,
        'PEN'
      )
      RETURNING fac_codigo;
    `;

        const { rows } = await pool.query(query, [
            cli_codigo,
            fac_descripcion || null
        ]);

        res.status(201).json({ fac_codigo: rows[0].fac_codigo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear factura' });
    }
};

/* =====================================================
   4️⃣ AGREGAR DETALLE
===================================================== */
const addDetalleFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const { prd_codigo } = req.body;
    const pxfa_cantidad = Number(req.body.pxfa_cantidad);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await FacturaModel.insertDetalleFactura(client, {
            pxfa_codigo: crypto.randomUUID().slice(0, 10),
            fac_codigo: facCodigo,
            prd_codigo,
            pxfa_cantidad
        });

        if (result === 0) {
            throw new Error('No se pudo insertar el detalle');
        }

        await FacturaModel.recalcTotalesFactura(client, facCodigo);

        await client.query('COMMIT');
        res.json({ message: 'Detalle agregado correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

/* =====================================================
   5️⃣ ACTUALIZAR DETALLE
===================================================== */
const updateDetalleFactura = async (req, res) => {
    const { pxfaCodigo } = req.params;
    const { pxfa_cantidad } = req.body;

    try {
        const result = await FacturaModel.updateDetalleFactura(pool, {
            pxfa_codigo: pxfaCodigo,
            pxfa_cantidad
        });

        if (result === 0) {
            return res.status(400).json({
                message: 'No se puede modificar el detalle (factura no PEN)'
            });
        }

        res.json({ message: 'Detalle actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar detalle' });
    }
};

/* =====================================================
   6️⃣ ELIMINAR DETALLE
===================================================== */
const deleteDetalleFactura = async (req, res) => {
    const { pxfaCodigo } = req.params;

    try {
        const result = await FacturaModel.deleteDetalleFactura(pool, pxfaCodigo);

        if (result === 0) {
            return res.status(400).json({
                message: 'No se puede eliminar el detalle (factura no PEN)'
            });
        }

        res.json({ message: 'Detalle eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar detalle' });
    }
};

/* =====================================================
   7️⃣ APROBAR FACTURA (TRANSACCIONAL)
===================================================== */
const approveFactura = async (req, res) => {
    const { facCodigo } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const facturaRes = await client.query(
            `SELECT fac_estado FROM factura WHERE fac_codigo = $1`,
            [facCodigo]
        );

        if (facturaRes.rowCount === 0) {
            throw new Error('Factura no existe');
        }

        if (facturaRes.rows[0].fac_estado !== 'PEN') {
            throw new Error('Solo se puede aprobar una factura en estado PEN');
        }

        const detalleRes = await client.query(
            `SELECT prd_codigo, pxfa_cantidad
       FROM detalle_factura
       WHERE fac_codigo = $1`,
            [facCodigo]
        );

        if (detalleRes.rowCount === 0) {
            throw new Error('La factura no tiene detalle');
        }

        const stockRes = await client.query(
            `SELECT 1
       FROM detalle_factura d
       JOIN producto p ON p.prd_codigo = d.prd_codigo
       WHERE d.fac_codigo = $1
         AND d.pxfa_cantidad > p.prd_stock`,
            [facCodigo]
        );

        if (stockRes.rowCount > 0) {
            throw new Error('Stock insuficiente');
        }

        const trnCod =
            'TRN' + crypto.randomUUID().replace(/-/g, '').substring(0, 9);

        await client.query(
            `INSERT INTO transaccion (trn_cod, trn_tipo, trn_descripcion)
       VALUES ($1, 'EGR', $2)`,
            [trnCod, `Factura aprobada ${facCodigo}`]
        );

        for (const item of detalleRes.rows) {
            const krdPrdCodigo =
                'KPD' + crypto.randomUUID().replace(/-/g, '').substring(0, 7);

            await client.query(
                `INSERT INTO kardex_prd (
          krd_prd_codigo,
          trn_cod,
          prd_codigo,
          krd_prd_cantidad,
          krd_prd_fecha,
          krd_prd_accion
        )
        VALUES ($1, $2, $3, $4, NOW(), 'FACTURA_APROBADA')`,
                [krdPrdCodigo, trnCod, item.prd_codigo, -item.pxfa_cantidad]
            );

            await client.query(
                `UPDATE producto
         SET prd_stock = prd_stock - $1
         WHERE prd_codigo = $2`,
                [item.pxfa_cantidad, item.prd_codigo]
            );
        }

        await client.query(
            `UPDATE factura
       SET fac_estado = 'APR',
           fac_fecha_aprobacion = NOW()
       WHERE fac_codigo = $1`,
            [facCodigo]
        );

        await client.query('COMMIT');
        res.json({ message: 'Factura aprobada correctamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
};

/* =====================================================
   8️⃣ ANULAR FACTURA
===================================================== */
const annulFactura = async (req, res) => {
    const { facCodigo } = req.params;

    try {
        await pool.query(
            `UPDATE factura
       SET fac_estado = 'ANU',
           fac_fecha_eliminacion = NOW()
       WHERE fac_codigo = $1
         AND fac_estado <> 'ANU'`,
            [facCodigo]
        );

        res.json({ message: 'Factura anulada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al anular factura' });
    }
};

module.exports = {
    getAllFacturas,
    getFacturaByCodigo,
    createFactura,
    addDetalleFactura,
    updateDetalleFactura,
    deleteDetalleFactura,
    approveFactura,
    annulFactura
};
