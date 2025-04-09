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

// Configuración CORS actualizada para permitir solicitudes desde Vercel
app.use(cors({
  origin: 'https://content-generator-app-new-9fkm-iq04vtyhr.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}) );


// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/invites', require('./routes/invites'));

// Ruta para verificar que la API está funcionando
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'API de Content Generator funcionando correctamente',
    version: '1.0.0'
  });
});

// Ruta raíz para verificar que la API está funcionando
app.get('*', (req, res)  => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Por esta:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Y añade esta para manejar la ruta /login específicamente
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

