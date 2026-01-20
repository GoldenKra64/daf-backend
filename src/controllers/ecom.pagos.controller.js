const { getConnection } = require("../config/db_ecom.js");
const { validateSchema } = require('../dtos/pagos.dto.js');

const validateCard = (req, res) => {
    const { card_number } = req.body;
    
    const result = validateSchema(card_number);
    return res.status(200).json(result);
}

module.exports = {
    validateCard
}