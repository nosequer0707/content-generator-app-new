const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Middleware para proteger rutas
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verificar si hay token en las cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Verificar si hay token en el header de autorización
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si el token existe
  if (!token) {
    res.status(401);
    throw new Error('No autorizado, no hay token');
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el usuario del token
    req.user = await User.findById(decoded.id).select('-password');
    
    // Verificar si el usuario existe
    if (!req.user) {
      res.status(401);
      throw new Error('Usuario no encontrado');
    }
    
    next();
  } catch (error) {
    res.status(401);
    throw new Error('No autorizado, token inválido o expirado');
  }
});

// Middleware para verificar si es administrador
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('No autorizado, se requieren permisos de administrador');
  }
};

module.exports = { protect, admin };
