const jwt = require("jsonwebtoken");
const { AuthModel } = require("../models/auth.model.js");
const { registerSchema, loginSchema, passwordSchema, cliruccedSchema } = require("../dtos/auth.dto.js");

const { getConnection } = require("../config/db_ecom.js");

const AuthController = {

  register: async (req, res) => {
    const data = registerSchema.parse(req.body);

    const pool = getConnection();
    const user = await AuthModel.createUser(pool, data);

    res.status(201).json("Usuario registrado exitosamente");
  },

  login: async (req, res) => {
    const data = loginSchema.parse(req.body);

    const pool = getConnection();
    const valid = await AuthModel.verifyPassword(pool, data);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    const user = await AuthModel.findUserByEmail(pool, data);

    const token = jwt.sign(
      { email: user.usr_email, cli_codigo: user.cli_codigo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
  },

  profile: async (req, res) => {
    const pool = await getConnection();
    const data = req.user;
    const user_data = await AuthModel.getProfile(pool, data);
    res.json(user_data);
  },

    updatePassword: async (req, res) => {
    const data = passwordSchema.parse(req.body);

    const email = req.user.email;

    const pool = await getConnection();
    await AuthModel.updatePassword(pool, {
      email,
      newPassword: data.password
    });

    res.json({ message: "Contraseña actualizada" });
  },

  delete: async (req, res) => {
    const pool = await getConnection();
    await AuthModel.deleteUser(pool, req.user);
    res.json({ message: "Usuario eliminado" });
  },

  clientAvailable: async (req, res) => {
    const {cli_ruc_ced} = req.params;
    const data = cliruccedSchema.parse(cli_ruc_ced)

    const pool = await getConnection();
    const exists = await AuthModel.clientExists(pool, cli_ruc_ced);

    if (!exists) {
      return res.status(404).json({ message: "Cliente no existe, debe registrarse" });
    }

    const available = await AuthModel.isClientAvailable(pool, cli_ruc_ced);

    if (available) {
      return res.status(200).json({ message: "Registro de cliente disponible con ese numero de RUC" });
    }

    return res.status(409).json({ message: "Cliente ya registrado" });
  }
};

module.exports = { AuthController };