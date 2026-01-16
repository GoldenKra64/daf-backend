const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email().max(60),
  password: z.string().min(8).max(60),
  cli_ruc_ced: z.string().min(10).max(13),
  cliente: z.object({
    cli_nombre: z.string().max(120),
    cli_telefono: z.string().max(10),
    cli_celular: z.string().max(9),
    cli_direccion: z.string().max(60),
    ct_codigo: z.string().max(10)
  }).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const passwordSchema = z.object({
  password: z.string().min(8)
});

const cliruccedSchema = z.string({
  cli_ruc_ced: z.string().min(10).max(13)
});

module.exports = { registerSchema, loginSchema, passwordSchema, cliruccedSchema };