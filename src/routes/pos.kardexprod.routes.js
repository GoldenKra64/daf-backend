const express = require('express');
const router = express.Router();
const kardexProdController = require('../controllers/pos.kardexprod.controller');
const { verifyToken } = require('../middlewares/pos.auth.middleware');

router.use(verifyToken);

router.post('/', kardexProdController.create);
router.get('/', kardexProdController.getAll);
router.get('/product/:prd_codigo', kardexProdController.getByProduct);
router.delete('/:id', kardexProdController.deleteKardex);

module.exports = router;