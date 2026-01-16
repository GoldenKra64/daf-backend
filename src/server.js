// 1. Cargar variables de entorno
require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/db');

// Obtener puerto del .env o defecto
const PORT = process.env.PORT || 3000;

const main = async () => {
  try {
    // 1. Verificación de conexión a Base de Datos
    const response = await pool.query('SELECT current_database()');
    const dbName = response.rows[0].current_database;
    console.log(`✅ Conexión establecida a la BD: [${dbName}]`);

    // 2. Verificación opcional de integridad (Tabla Cliente)
    try {
      await pool.query("SELECT 1 FROM public.cliente LIMIT 1");
    } catch (err) {
      console.warn("⚠️ Advertencia: La tabla 'cliente' podría no estar disponible:", err.message);
    }

    // 3. Inicio del Servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`👉 http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

main();