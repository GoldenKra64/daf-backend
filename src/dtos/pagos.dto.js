const dotenv = require('dotenv');
dotenv.config();

const { z } = require("zod");

function luhnCheck(cardNumber) {
    cardNumber = cardNumber.replace(/\s+/g, '').replace(/-/g, '');
    if (!/^\d+$/.test(cardNumber)) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

const creditCardSchema = z
  .string()
  .trim()
  .regex(/^\d{13,19}$/, "El número de tarjeta de crédito debe tener entre 13 y 19 dígitos")
  .refine(luhnCheck, { message: "Número de tarjeta de crédito inválido" });

const validateSchema = (creditCard) => {
    return creditCardSchema.parse(creditCard); 
};

module.exports = { validateSchema };