const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Importar función para crear superusuario
const createSuperUser = require('./config/create-super-user');

// Crear superusuario si no existe
createSuperUser();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invites', require('./routes/invites'));

// Ruta raíz para verificar que la API está funcionando
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Content Generator funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      invites: '/api/invites'
    }
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
