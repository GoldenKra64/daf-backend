const express = require('express');
const cors = require('cors');

const clienteRoutes = require('./routes/pos.cliente.routes');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');
const kardexMPRoutes = require('./routes/pos.kardexmp.routes');
const estandarRoutes = require('./routes/pos.estandar.routes');
const productoRoutes = require('./routes/pos.producto.routes');
const proveedorRoutes = require('./routes/pos.proveedor.routes');
<<<<<<< HEAD

const appAuthRoutes = require('./routes/ecom.auth.routes');
=======
const ciudadRoutes = require('./routes/pos.ciudad.routes');
>>>>>>> f14ea63 (Interfaz de Proveedor)
const unidadMedidaRoutes = require('./routes/pos.unidadmedida.routes');
const transaccionRoutes = require('./routes/pos.transaccion.routes');
const ciudadRoutes = require('./routes/ecom.ciudad.routes');

const app = express();

let corsConfiguration = {
<<<<<<< HEAD
  origin: process.env.FRONTEND_IP ? [process.env.FRONTEND_IP] : ['http://localhost:5173', 'http://localhost:5174'],
=======
  origin: process.env.FRONTEND_IP || 'http://localhost:5173', // Permitir localhost:5173 por defecto
>>>>>>> f14ea63 (Interfaz de Proveedor)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
app.use(cors(corsConfiguration));

app.use(express.json());

// Middleware para logging de todas las peticiones
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// RUTAS POS
app.use('/api/pos', authRoutes);
app.use('/api/pos/producto', productoRoutes);
app.use('/api/pos/proveedor', proveedorRoutes);
<<<<<<< HEAD
app.use('/api/pos/cliente', clienteRoutes);
app.use('/api/pos/materiaprima', materiaPrimaRoutes);
app.use('/api/pos/estandar', estandarRoutes);
app.use('/api/pos/kardexmp', kardexMPRoutes);

// Rutas e-com
app.use('/api/ecom/auth', appAuthRoutes);
=======
app.use('/api/pos/ciudad', ciudadRoutes);
>>>>>>> f14ea63 (Interfaz de Proveedor)

// RUTAS TABLAS TIPO
app.use('/api/pos/unidadmedida', unidadMedidaRoutes);
app.use('/api/pos/transaccion', transaccionRoutes);
app.use('/api/ecom/ciudad', ciudadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});




module.exports = app;