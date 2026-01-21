const express = require('express');
const cors = require('cors');
const path = require('path');

const clienteRoutes = require('./routes/pos.cliente.routes');
const categoriaRoutes = require('./routes/pos.categoria.routes');
const authRoutes = require('./routes/pos.auth.routes');
const materiaPrimaRoutes = require('./routes/pos.materiaprima.routes');
const kardexMPRoutes = require('./routes/pos.kardexmp.routes');
const estandarRoutes = require('./routes/pos.estandar.routes');
const productoRoutes = require('./routes/pos.producto.routes');
const proveedorRoutes = require('./routes/pos.proveedor.routes');

const appAuthRoutes = require('./routes/ecom.auth.routes');
const carritoRoutes = require('./routes/ecom.carrito.routes');
const ecomProductoRoutes = require('./routes/ecom.producto.routes');

const unidadMedidaRoutes = require('./routes/pos.unidadmedida.routes');
const transaccionRoutes = require('./routes/pos.transaccion.routes');
const ciudadRoutes = require('./routes/ecom.ciudad.routes');
const ciudadRoutesPos = require('./routes/pos.ciudad.routes');
const ordenCompraRoutes = require('./routes/pos.ordencompra.routes');


const pagosRoutes = require('./routes/ecom.pagos.routes');

const app = express();

let corsConfiguration = {
  origin: process.env.FRONTEND_IP ? [process.env.FRONTEND_IP] : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
app.use(cors(corsConfiguration));

app.use(express.json());


// 3. DEFINIR LA URL BASE
// RUTAS POS
app.use('/api/pos/auth', require('./routes/pos.auth.routes'));
app.use('/api/pos/cliente', clienteRoutes);
app.use('/api/pos/unidadmedida', unidadMedidaRoutes);
app.use('/api/pos/transaccion', transaccionRoutes);
app.use('/api/pos/producto', require('./routes/pos.producto.routes'));
app.use('/api/pos/estandar', require('./routes/pos.estandar.routes'));
app.use('/api/pos/kardex-producto', require('./routes/pos.kardexprod.routes'));

// Rutas e-com
app.use('/api/ecom/auth', appAuthRoutes);
app.use('/api/ecom/pagos', pagosRoutes);

// RUTAS POS
app.use('/api/pos', authRoutes);
app.use('/api/pos/producto', productoRoutes);
app.use('/api/pos/proveedor', proveedorRoutes);
app.use('/api/pos/cliente', clienteRoutes);
app.use('/api/pos/materiaprima', materiaPrimaRoutes);
app.use('/api/pos/estandar', estandarRoutes);
app.use('/api/pos/kardexmp', kardexMPRoutes);
app.use('/api/pos/ordencompra', ordenCompraRoutes);

// Rutas e-com
app.use('/api/ecom/auth', appAuthRoutes);
app.use('/api/ecom/carrito', carritoRoutes);
app.use('/api/ecom/producto', ecomProductoRoutes);

// RUTAS TABLAS TIPO
app.use('/api/pos/unidadmedida', unidadMedidaRoutes);
app.use('/api/pos/transaccion', transaccionRoutes);
app.use('/api/ecom/ciudad', ciudadRoutes);
app.use('/api/pos/categoria', categoriaRoutes); 
app.use('/api/pos/ciudad', ciudadRoutesPos);

// IMAGES
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});


module.exports = app;