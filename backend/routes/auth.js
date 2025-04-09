const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Controladores (se implementarán más adelante)
const { 
  register, 
  login, 
  logout, 
  getMe 
} = require('../controllers/auth');

// Rutas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
