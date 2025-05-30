// backend/routes/usuarios.js
const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// GET - Obtener todos los doctores
router.get('/doctores', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        nombre, 
        CONCAT(apellido_paterno, ' ', IFNULL(apellido_materno, '')) as apellido,
        apellido_paterno,
        apellido_materno,
        email, 
        telefono,
        rol
       FROM usuarios 
       WHERE rol IN ('Administrador', 'Doctor') AND activo = 1
       ORDER BY 
         CASE 
           WHEN rol = 'Doctor' THEN 1 
           WHEN rol = 'Administrador' THEN 2 
         END,
         nombre, apellido_paterno`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener doctores:', error);
    res.status(500).json({ message: 'Error al obtener doctores' });
  }
});

// GET - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        nombre, 
        apellido_paterno,
        apellido_materno,
        email, 
        rol, 
        telefono,
        activo, 
        fecha_creacion
       FROM usuarios 
       ORDER BY nombre, apellido_paterno`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// POST - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido_paterno, apellido_materno, email, password, rol, telefono } = req.body;
    
    // Verificar si ya existe el email
    const [existingUser] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }
    
    // Validar rol
    const rolesValidos = ['Administrador', 'Doctor', 'Secretaria'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, email, password, rol, telefono, activo, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [nombre, apellido_paterno, apellido_materno, email, password, rol, telefono]
    );
    
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuarioId: result.insertId
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario: ' + error.message });
  }
});

module.exports = router;