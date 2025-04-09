const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

// Crear superusuario
const createSuperUser = require('./config/create-super-user');
createSuperUser();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'https://content-generator-app-new-9fkm-iq04vtyhr.vercel.app',
  credentials: true
}));

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invites', require('./routes/invites'));

// Middleware de errores
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Servir frontend compilado
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Esta ruta debe estar después de todas las API y rutas estáticas
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
