const express = require('express');
const authRoutes = require('./routes/pos.auth.routes');

const app = express();

app.use(express.json());

// RUTAS POS
app.use('/api/pos', authRoutes);

module.exports = app;