const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyDoctorOrSecretaria } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los pacientes
router.get('/', verifyToken, verifyDoctorOrSecretaria, (req, res) => {
    const db = req.app.locals.db;
    
    const query = `
        SELECT 
            id, nombre, apellido_paterno, apellido_materno, 
            fecha_nacimiento, telefono, correo_electronico, 
            sexo, activo, fecha_creacion
        FROM pacientes 
        WHERE activo = TRUE 
        ORDER BY apellido_paterno, apellido_materno, nombre
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener pacientes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json(results);
    });
});

// Buscar pacientes
router.get('/buscar', verifyToken, verifyDoctorOrSecretaria, (req, res) => {
    const { q } = req.query;
    const db = req.app.locals.db;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'El término de búsqueda debe tener al menos 2 caracteres' });
    }
    
    const searchTerm = `%${q.trim()}%`;
    const query = `
        SELECT 
            id, nombre, apellido_paterno, apellido_materno, 
            fecha_nacimiento, telefono, correo_electronico, sexo
        FROM pacientes 
        WHERE activo = TRUE AND (
            nombre LIKE ? OR 
            apellido_paterno LIKE ? OR 
            apellido_materno LIKE ? OR
            CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) LIKE ?
        )
        ORDER BY apellido_paterno, apellido_materno, nombre
        LIMIT 20
    `;
    
    db.query(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Error en búsqueda de pacientes:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json(results);
    });
});

// Obtener paciente por ID
router.get('/:id', verifyToken, verifyDoctorOrSecretaria, (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const query = 'SELECT * FROM pacientes WHERE id = ? AND activo = TRUE';
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener paciente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        
        res.json(results[0]);
    });
});

// Crear nuevo paciente
router.post('/', verifyToken, verifyDoctorOrSecretaria, [
    body('nombre').notEmpty().withMessage('Nombre es requerido'),
    body('apellido_paterno').notEmpty().withMessage('Apellido paterno es requerido'),
    body('fecha_nacimiento').isDate().withMessage('Fecha de nacimiento válida requerida'),
    body('sexo').isIn(['M', 'F']).withMessage('Sexo debe ser M o F'),
    body('telefono').optional().isMobilePhone('es-MX').withMessage('Teléfono inválido'),
    body('correo_electronico').optional().isEmail().withMessage('Email inválido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {
        nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
        lugar_nacimiento, lugar_procedencia, telefono, correo_electronico,
        calle_numero, sexo, grupo_etnico, religion, rfc,
        derecho_habiente, nombre_institucion
    } = req.body;
    
    const db = req.app.locals.db;
    
    const query = `
        INSERT INTO pacientes (
            nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
            lugar_nacimiento, lugar_procedencia, telefono, correo_electronico,
            calle_numero, sexo, grupo_etnico, religion, rfc,
            derecho_habiente, nombre_institucion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        nombre, apellido_paterno, apellido_materno || null, fecha_nacimiento,
        lugar_nacimiento || null, lugar_procedencia || null, telefono || null,
        correo_electronico || null, calle_numero || null, sexo,
        grupo_etnico || null, religion || null, rfc || null,
        derecho_habiente || false, nombre_institucion || null
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear paciente:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.status(201).json({
            message: 'Paciente creado exitosamente',
            id: result.insertId
        });
    });
});

module.exports = router;