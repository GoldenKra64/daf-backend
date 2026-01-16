const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');
const kardexMPRoutes = require('./routes/pos.kardexmp.routes');
const estandarRoutes = require('./routes/pos.estandar.routes');
const productoRoutes = require('./routes/pos.producto.routes');

const appAuthRoutes = require('./routes/ecom.auth.routes');

const unidadMedidaRoutes = require('./routes/pos.unidadmedida.routes');
const transaccionRoutes = require('./routes/pos.transaccion.routes');
const ciudadRoutes = require('./routes/ecom.ciudad.routes');

const app = express();

let corsConfiguration = {
  origin: process.env.FRONTEND_IP,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsConfiguration));
app.use(express.json());

// RUTAS POS
app.use('/api/pos', authRoutes);
app.use('/api/pos/materiaprima', materiaPrimaRoutes);
app.use('/api/pos/kardexmp', kardexMPRoutes);
app.use('/api/pos/estandar', estandarRoutes);
app.use('/api/pos/producto', productoRoutes);

// Rutas e-com
app.use('/api/ecom/auth', appAuthRoutes);

// RUTAS TABLAS TIPO
app.use('/api/pos/unidadmedida', unidadMedidaRoutes);
app.use('/api/pos/transaccion', transaccionRoutes);
app.use('/api/ecom/ciudad', ciudadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;