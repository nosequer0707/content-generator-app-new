const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Public (con token de invitación)
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, inviteToken } = req.body;

  // Verificar si se proporcionó un token de invitación
  if (!inviteToken) {
    res.status(400);
    throw new Error('Se requiere un token de invitación válido para registrarse');
  }

  // Verificar si el token de invitación es válido
  const Invite = require('../models/Invite');
  const invite = await Invite.findOne({ token: inviteToken });

  if (!invite) {
    res.status(400);
    throw new Error('Token de invitación inválido');
  }

  if (invite.isUsed) {
    res.status(400);
    throw new Error('Este token de invitación ya ha sido utilizado');
  }

  if (invite.isExpired()) {
    res.status(400);
    throw new Error('Este token de invitación ha expirado');
  }

  // Verificar si el usuario ya existe
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  // Crear usuario
  const user = await User.create({
    name,
    email,
    password
  });

  // Marcar la invitación como utilizada
  invite.isUsed = true;
  invite.usedBy = user._id;
  await invite.save();

  if (user) {
    // Generar token JWT
    const token = user.getSignedJwtToken();

    // Opciones para la cookie
    const options = {
      expires: new Date(Date.now() + process.env.JWT_EXPIRE * 60 * 60 * 1000),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    res.status(201).cookie('token', token, options).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
  }
});

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validar email y password
  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor proporcione un email y contraseña');
  }

  // Verificar si el usuario existe
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  // Verificar si la contraseña coincide
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  // Generar token JWT
  const token = user.getSignedJwtToken();

  // Opciones para la cookie
  const options = {
    expires: new Date(Date.now() + process.env.JWT_EXPIRE * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(200).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

// @desc    Logout de usuario / limpiar cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});
