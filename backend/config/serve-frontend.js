// Configuración para servir el frontend desde el backend en producción
const path = require('path');
const jwt = require('jsonwebtoken');
const express = require('express');

// Función para configurar el servidor para servir el frontend
const configureServer = (app) => {
  // Middleware para verificar si el token JWT es válido
  const verifyToken = (req, res, next) => {
    try {
      // Obtener el token de las cookies o del header de autorización
      let token;
      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      // Si no hay token, permitir continuar (las rutas protegidas se manejan con el middleware auth)
      if (!token) {
        return next();
      }

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
    } catch (error) {
      // Si el token no es válido, simplemente continuar (no bloquear la solicitud)
      next();
    }
  };

  // Aplicar el middleware de verificación de token a todas las rutas
  app.use(verifyToken);

  // Servir archivos estáticos desde la carpeta public
  app.use(express.static(path.join(__dirname, '../public')));
  
  // Para cualquier ruta que no sea API, servir el archivo index.html
  app.use((req, res, next) => {
    // Si la ruta comienza con /api, continuar al siguiente middleware
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Para cualquier otra ruta, servir el archivo index.html
    res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
  });
};

module.exports = configureServer;
