const express = require('express');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');

const app = express();

app.use(express.json());

// RUTAS POS
app.use('/api/pos', authRoutes);
app.use('/api/pos/materiaprima', materiaPrimaRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

module.exports = app;