const {
    createKardexPrd,
    getAllKardexPrd,
    getKardexPrdByProduct,
    getCountKardexPrd,
    getCountKardexPrdByProduct
} = require('../models/kardexprod.model');

const { validateKardexProdDTO } = require('../dtos/kardexprod.dto');
const { getConnectionWithCredentials } = require('../config/db_pos.js');

const connectFromJWT = (req) => {
    const { usuario, password } = req.user;
    return getConnectionWithCredentials(usuario, password);
};

const create = async (req, res) => {
    const pool = connectFromJWT(req);

    try {
        const { prd_codigo, trn_cod, krd_cantidad, est_cod } = req.body;

        const errors = validateKardexProdDTO(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors.join(', ') });
        }

        const data = {
            ...req.body,
            usr_id: req.user.usuario
        };

        const result = await createKardexPrd(pool, data);
        res.status(201).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

const getAll = async (req, res) => {
    const pool = connectFromJWT(req);
    const page = parseInt(req.query.page) || 1;

    try {
        const result = await getAllKardexPrd(pool, page);

        if (!result.length) {
            return res.status(404).json({ message: 'No se encontraron registros de Kardex' });
        }

        const count = await getCountKardexPrd(pool);

        res.status(200).json({
            page,
            limit: process.env.PAGINATION_LIMIT || 20,
            count: count,
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

const getByProduct = async (req, res) => {
    const pool = connectFromJWT(req);
    const page = parseInt(req.query.page) || 1;
    const { prd_codigo } = req.params;

    try {
        const result = await getKardexPrdByProduct(pool, prd_codigo, page);

        if (!result.length) {
            return res.status(404).json({ message: 'No se encontraron registros para este producto' });
        }

        const count = await getCountKardexPrdByProduct(pool, prd_codigo);

        res.status(200).json({
            page,
            limit: process.env.PAGINATION_LIMIT || 20,
            count: count,
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await pool.end();
    }
};

module.exports = {
    create,
    getAll,
    getByProduct
};
