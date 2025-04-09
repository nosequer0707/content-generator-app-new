const mongoose = require('mongoose');
const User = require('../models/User');

// Función para crear el superusuario si no existe
const createSuperUser = async () => {
  try {
    // Verificar si ya existe un usuario con el email admin@example.com
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('El superusuario ya existe, no es necesario crearlo');
      return;
    }
    
    // Crear el usuario administrador
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true
    });
    
    console.log('Superusuario creado exitosamente:');
    console.log(`ID: ${admin._id}`);
    console.log(`Nombre: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Admin: ${admin.isAdmin}`);
  } catch (error) {
    console.error('Error al crear el superusuario:', error);
  }
};

module.exports = createSuperUser;
