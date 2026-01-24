const { getConnection } = require("../config/db_ecom.js");
const { validateSchema } = require('../dtos/pagos.dto.js');

const { getCarritoByEmail, countDetallesCarrito } = require("../models/carrito.model.js");
const { pagarCarrito } = require("../models/pagos.model.js");

// 1) Validar tarjeta (Luhn)
const validateCard = (req, res) => {
  try {
    const { card_number } = req.body;

    if (!card_number) {
      return res.status(400).json({ message: "card_number es requerido" });
    }

    const parsed = validateSchema(card_number);
    return res.status(200).json({ valid: true, card_number: parsed });

  } catch (error) {
    return res.status(400).json({
      valid: false,
      message: error?.issues?.[0]?.message ?? "Número de tarjeta inválido"
    });
  }
};

// 2) Checkout: valida tarjeta + paga carrito del usuario logeado en BD
const checkout = async (req, res) => {
  try {
    const { email } = req.user || {};
    if (!email) {
      return res.status(401).json({ message: "Token inválido o sin email" });
    }

    const { card_number } = req.body;
    if (!card_number) {
      return res.status(400).json({ message: "card_number es requerido" });
    }

    // Validación Luhn (si falla lanza excepción)
    validateSchema(card_number);

    const pool = getConnection();

    // Carrito del usuario (deducido por usr_email)
    const carrito = await getCarritoByEmail(pool, email);

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Regla: no pagar carrito vacío
    const count = await countDetallesCarrito(pool, carrito.crr_codigo);
    if (!count || Number(count.count) === 0) {
      return res.status(400).json({ message: "No se puede pagar: el carrito está vacío" });
    }

    // Ejecutar pago en BD (transacción completa)
    const fac_codigo = await pagarCarrito(pool, email, carrito.crr_codigo);

    return res.status(201).json({
      message: "Pago realizado en línea",
      fac_codigo: fac_codigo?.trim?.() ?? fac_codigo
    });

  } catch (error) {
    // Error de zod
    if (error?.issues?.length) {
      return res.status(400).json({ message: error.issues[0].message });
    }

    // Si en BD lanzas exceptions de negocio (stock insuficiente, etc.)
    // puedes mapearlas a 400 aquí si quieres:
    const msg = error?.message || "Error en checkout";
    if (msg.toLowerCase().includes("stock") || msg.toLowerCase().includes("carrito")) {
      return res.status(400).json({ message: msg });
    }

    return res.status(500).json({ message: msg });
  }
};

module.exports = {
  validateCard,
  checkout
};
