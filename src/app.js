const express = require('express');
const cors = require('cors');

// 1. Importar las Rutas
const clienteRoutes = require('./routes/pos.cliente.routes');
const appAuthRoutes = require('./routes/ecom.auth.routes');
const unidadMedidaRoutes = require('./routes/pos.unidadmedida.routes');
const transaccionRoutes = require('./routes/pos.transaccion.routes');
const ciudadRoutes = require('./routes/ecom.ciudad.routes');

const app = express();

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. DEFINIR LA URL BASE
app.use('/api/pos/cliente', clienteRoutes);

// Rutas e-com
app.use('/api/ecom/auth', appAuthRoutes);

// RUTAS TABLAS TIPO
app.use('/api/pos/unidadmedida', unidadMedidaRoutes);
app.use('/api/pos/transaccion', transaccionRoutes);
app.use('/api/ecom/ciudad', ciudadRoutes);

// 4. Ruta de prueba raíz
app.get('/', (req, res) => {
  res.send('API DAF funcionando correctamente 🚀');
});

// Handler 404 (Al final de todas las rutas)
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;