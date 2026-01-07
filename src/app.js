const express = require('express');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');

const app = express();

app.use(express.json());

// RUTAS POS
app.use('/api/pos', authRoutes);
app.use('/api/pos/materiaprima', materiaPrimaRoutes);

module.exports = app;