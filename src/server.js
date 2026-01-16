require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

console.log('Variables de entorno cargadas:');
console.log('PORT:', PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});