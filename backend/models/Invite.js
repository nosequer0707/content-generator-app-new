const mongoose = require('mongoose');
const crypto = require('crypto');

const InviteSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para verificar si la invitación ha expirado
InviteSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Método para verificar si la invitación es válida (no usada y no expirada)
InviteSchema.methods.isValid = function() {
  return !this.isUsed && !this.isExpired();
};

// Método estático para generar un nuevo token de invitación
InviteSchema.statics.generateInviteToken = function() {
  return crypto.randomBytes(20).toString('hex');
};

module.exports = mongoose.model('Invite', InviteSchema);
