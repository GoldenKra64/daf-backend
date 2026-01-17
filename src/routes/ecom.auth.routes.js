const { Router } = require("express");
const { AuthController } = require("../controllers/ecom.auth.controller.js");
const { verifyToken } = require("../middlewares/pos.auth.middleware.js");

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/client/:cli_ruc_ced", AuthController.clientAvailable);

// 🔐 Rutas protegidas
router.get("/me", verifyToken, AuthController.profile);
router.put("/password", verifyToken, AuthController.updatePassword);
router.delete("/", verifyToken, AuthController.delete);

module.exports = router;
