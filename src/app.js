const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');
const unidadMedidaRoutes = require('./routes/pos.unidadmedida.routes');

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

// RUTAS TABLAS TIPO
app.use('/api/pos/unidadmedida', unidadMedidaRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;