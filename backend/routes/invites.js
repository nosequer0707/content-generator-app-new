const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Controladores (se implementarán más adelante)
const { 
  generateInvite, 
  validateInvite,
  getAllInvites 
} = require('../controllers/invites');

// Rutas
router.post('/generate', protect, admin, generateInvite);
router.get('/validate', validateInvite);
router.get('/', protect, admin, getAllInvites);

module.exports = router;
