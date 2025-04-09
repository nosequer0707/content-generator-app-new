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
  origin: 'https://content-generator-app-new-9fkm-iq04vtyhr.vercel.app', // cambia si tu frontend tiene otro dominio
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invites', require('./routes/invites'));

// Servir frontend compilado (solo si has copiado el build de React aquí)
app.use(express.static(path.join(__dirname, 'public')));

// Todas las demás rutas deben devolver index.html para que React maneje el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de errores
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
