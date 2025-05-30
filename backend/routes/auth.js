const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database'); // Importar pool directamente

const router = express.Router();

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Email válido requerido'),
    body('password').isLength({ min: 1 }).withMessage('Contraseña requerida') // Cambié de 6 a 1 para pruebas
], async (req, res) => {
    console.log('=== LOGIN REQUEST ===');
    console.log('Body:', req.body);
    
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        console.log('Email:', email);
        console.log('Password received:', password);
        
        // Buscar usuario usando mysql2/promise
        const query = 'SELECT * FROM usuarios WHERE email = ? AND activo = 1';
        const [results] = await pool.execute(query, [email]);

        console.log('Users found:', results.length);

        if (results.length === 0) {
            console.log('No user found');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = results[0];
        console.log('User found:', user.email);
        console.log('Password in DB:', user.password);
        
        // TEMPORAL: Verificar contraseña sin hash
        const dbPassword = user.password ? user.password.toString().trim() : '';
        const receivedPassword = password ? password.toString().trim() : '';
        
        console.log('Comparing passwords:');
        console.log('DB Password:', `"${dbPassword}"`);
        console.log('Received Password:', `"${receivedPassword}"`);
        
        const isValidPassword = (dbPassword === receivedPassword);
        console.log('Final password match:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('Invalid password - sending 401');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        console.log('Password is valid, generating token...');

        // Generar token JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                rol: user.rol,
                nombre: user.nombre
            },
            process.env.JWT_SECRET || 'clave-secreta-temporal',
            { expiresIn: '8h' }
        );

        console.log('Token generated successfully');
        console.log('Sending successful response...');

        // Responder con token y datos del usuario
        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido_paterno: user.apellido_paterno,
                apellido_materno: user.apellido_materno,
                email: user.email,
                rol: user.rol,
                telefono: user.telefono
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');
        
        const query = 'SELECT id, nombre, apellido_paterno, apellido_materno, email, rol, telefono FROM usuarios WHERE id = ? AND activo = 1';
        const [results] = await pool.execute(query, [decoded.id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            valid: true,
            user: results[0]
        });

    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});

// Cambiar contraseña
router.put('/change-password', [
    body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nueva contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-temporal');
        const { currentPassword, newPassword } = req.body;

        // Obtener usuario actual
        const query = 'SELECT password FROM usuarios WHERE id = ?';
        const [results] = await pool.execute(query, [decoded.id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const user = results[0];
        
        // Verificar contraseña actual (temporal sin hash)
        const isValidPassword = (currentPassword === user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña (temporal sin hash)
        const updateQuery = 'UPDATE usuarios SET password = ? WHERE id = ?';
        await pool.execute(updateQuery, [newPassword, decoded.id]);

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;