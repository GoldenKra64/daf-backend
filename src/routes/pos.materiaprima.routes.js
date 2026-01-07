const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/pos.auth.middleware');
const controller = require('../controllers/pos.materiaprima.controller');

router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.get('/', verifyToken, controller.getAll);
router.get('/name', verifyToken, controller.getByName);
router.delete('/:id', verifyToken, controller.remove);

module.exports = router;