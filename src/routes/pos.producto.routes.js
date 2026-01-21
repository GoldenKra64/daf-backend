const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.producto.controller');

// ENDPOINTS
router.post('/', verifyToken, upload.single('prd_img'), controller.create);
router.get('/search', verifyToken, controller.getByName);
router.get('/type', verifyToken, controller.getAsType);
router.get('/:id', verifyToken, controller.getByID);
router.get('/', verifyToken, controller.getAll);
router.put('/:id', verifyToken, upload.single('prd_img'), controller.update);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;