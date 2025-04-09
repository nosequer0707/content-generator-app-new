const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invites', require('./routes/invites'));

// Servir archivos estáticos desde el frontend compilado
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Ruta fallback: React manejará el enrutamiento en frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Middleware de errores (después de las rutas)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Arrancar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
