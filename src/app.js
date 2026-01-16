const express = require('express');
const cors = require('cors');

// 1. Importar las Rutas
const clienteRoutes = require('./routes/pos.cliente.routes');

const app = express();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. DEFINIR LA URL BASE (¡AQUÍ ESTABA EL ERROR!)
// Antes tenías: '/api/cliente'
// AHORA LO PONEMOS CORRECTO:
app.use('/api/pos/cliente', clienteRoutes);

// 4. Ruta de prueba raíz
app.get('/', (req, res) => {
  res.send('API DAF funcionando correctamente 🚀');
});

module.exports = app;