const { Router } = require("express");
const { AuthController } = require("../controllers/ecom.auth.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/client/:cli_ruc_ced", AuthController.clientAvailable);
router.get("/me", authMiddleware, AuthController.profile);
router.put("/password", authMiddleware, AuthController.updatePassword);
router.delete("/", authMiddleware, AuthController.delete);

module.exports = router;