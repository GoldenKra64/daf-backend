const { validateCard } = require('../controllers/ecom.pagos.controller');


const express = require('express');
const router = express.Router();

router.post('/validate', validateCard);

module.exports = router;