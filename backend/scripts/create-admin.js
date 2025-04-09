const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB conectado');
    
    try {
      // Verificar si ya existe un usuario con el email admin@example.com
      const adminExists = await User.findOne({ email: 'admin@example.com' });
      
      if (adminExists) {
        console.log('El usuario administrador ya existe');
        process.exit(0);
      }
      
      // Crear el usuario administrador
      const admin = await User.create({
        name: 'Administrador',
        email: 'admin@example.com',
        password: 'admin123',
        isAdmin: true
      });
      
      console.log('Usuario administrador creado exitosamente:');
      console.log(`ID: ${admin._id}`);
      console.log(`Nombre: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Admin: ${admin.isAdmin}`);
      
      process.exit(0);
    } catch (error) {
      console.error('Error al crear el usuario administrador:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  });
