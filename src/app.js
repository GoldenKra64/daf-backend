const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');

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

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;