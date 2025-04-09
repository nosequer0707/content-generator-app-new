const Invite = require('../models/Invite');
const asyncHandler = require('express-async-handler');

// @desc    Generar un nuevo token de invitación
// @route   POST /api/invites/generate
// @access  Private/Admin
exports.generateInvite = asyncHandler(async (req, res) => {
  // Generar un token único
  const token = Invite.generateInviteToken();
  
  // Calcular la fecha de expiración (7 días)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Crear la invitación en la base de datos
  const invite = await Invite.create({
    token,
    createdBy: req.user.id,
    expiresAt
  });
  
  // Construir el enlace de invitación
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? req.protocol + '://' + req.get('host') 
    : 'http://localhost:3000';
  
  const inviteLink = `${baseUrl}/register?token=${token}`;
  
  res.status(201).json({
    success: true,
    data: {
      token,
      inviteLink,
      expiresAt,
      id: invite._id
    }
  });
});

// @desc    Validar un token de invitación
// @route   GET /api/invites/validate
// @access  Public
exports.validateInvite = asyncHandler(async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    res.status(400);
    throw new Error('Se requiere un token de invitación');
  }
  
  const invite = await Invite.findOne({ token });
  
  if (!invite) {
    res.status(404);
    throw new Error('Token de invitación no encontrado');
  }
  
  if (invite.isUsed) {
    res.status(400);
    throw new Error('Este token de invitación ya ha sido utilizado');
  }
  
  if (invite.isExpired()) {
    res.status(400);
    throw new Error('Este token de invitación ha expirado');
  }
  
  res.status(200).json({
    success: true,
    data: {
      token,
      valid: true,
      expiresAt: invite.expiresAt
    }
  });
});

// @desc    Obtener todas las invitaciones
// @route   GET /api/invites
// @access  Private/Admin
exports.getAllInvites = asyncHandler(async (req, res) => {
  const invites = await Invite.find()
    .populate('createdBy', 'name email')
    .populate('usedBy', 'name email')
    .sort('-createdAt');
  
  res.status(200).json({
    success: true,
    count: invites.length,
    data: invites
  });
});
