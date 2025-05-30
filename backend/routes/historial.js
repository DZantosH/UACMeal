const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, verifyDoctorOrSecretaria, verifyDoctor } = require('../middleware/auth');

const router = express.Router();

// Obtener historial clínico por paciente
router.get('/paciente/:pacienteId', verifyToken, verifyDoctorOrSecretaria, (req, res) => {
    const { pacienteId } = req.params;
    const db = req.app.locals.db;
    
    const query = `
        SELECT 
            h.id, h.fecha_consulta, h.diagnostico, h.tratamiento, 
            h.medicamentos, h.observaciones, h.proxima_cita,
            h.fecha_creacion,
            u.nombre as doctor_nombre, u.apellido_paterno as doctor_apellido_paterno,
            u.apellido_materno as doctor_apellido_materno,
            c.tipo_cita, c.fecha_cita, c.hora_cita
        FROM historial_clinico h
        INNER JOIN usuarios u ON h.doctor_id = u.id
        LEFT JOIN citas c ON h.cita_id = c.id
        WHERE h.paciente_id = ?
        ORDER BY h.fecha_consulta DESC, h.fecha_creacion DESC
    `;
    
    db.query(query, [pacienteId], (err, results) => {
        if (err) {
            console.error('Error al obtener historial clínico:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json(results);
    });
});

// Obtener registro específico del historial
router.get('/:id', verifyToken, verifyDoctorOrSecretaria, (req, res) => {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const query = `
        SELECT 
            h.*, 
            p.nombre as paciente_nombre, p.apellido_paterno as paciente_apellido_paterno,
            p.apellido_materno as paciente_apellido_materno,
            u.nombre as doctor_nombre, u.apellido_paterno as doctor_apellido_paterno,
            u.apellido_materno as doctor_apellido_materno
        FROM historial_clinico h
        INNER JOIN pacientes p ON h.paciente_id = p.id
        INNER JOIN usuarios u ON h.doctor_id = u.id
        WHERE h.id = ?
    `;
    
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener registro del historial:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }
        
        res.json(results[0]);
    });
});

// Crear nuevo registro en historial clínico (solo doctores)
router.post('/', verifyToken, verifyDoctor, [
    body('paciente_id').isInt().withMessage('ID de paciente válido requerido'),
    body('fecha_consulta').isDate().withMessage('Fecha de consulta válida requerida'),
    body('diagnostico').notEmpty().withMessage('Diagnóstico es requerido')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {
        paciente_id, cita_id, fecha_consulta, diagnostico,
        tratamiento, medicamentos, observaciones, proxima_cita
    } = req.body;
    
    const doctor_id = req.user.id;
    const db = req.app.locals.db;
    
    const query = `
        INSERT INTO historial_clinico (
            paciente_id, doctor_id, cita_id, fecha_consulta,
            diagnostico, tratamiento, medicamentos, observaciones, proxima_cita
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        paciente_id, doctor_id, cita_id || null, fecha_consulta,
        diagnostico, tratamiento || null, medicamentos || null,
        observaciones || null, proxima_cita || null
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear registro de historial:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        // Si hay una cita asociada, marcarla como completada
        if (cita_id) {
            const updateCitaQuery = 'UPDATE citas SET estado = "Completada" WHERE id = ?';
            db.query(updateCitaQuery, [cita_id], (err) => {
                if (err) {
                    console.error('Error al actualizar estado de cita:', err);
                }
            });
        }
        
        res.status(201).json({
            message: 'Registro de historial clínico creado exitosamente',
            id: result.insertId
        });
    });
});

// Buscar en historial clínico
router.get('/buscar/:termino', verifyToken, verifyDoctorOrSecretaria, (req, res) => {
    const { termino } = req.params;
    const db = req.app.locals.db;
    
    if (!termino || termino.trim().length < 3) {
        return res.status(400).json({ error: 'El término de búsqueda debe tener al menos 3 caracteres' });
    }
    
    const searchTerm = `%${termino.trim()}%`;
    
    const query = `
        SELECT 
            h.id, h.fecha_consulta, h.diagnostico, h.tratamiento,
            p.nombre as paciente_nombre, p.apellido_paterno as paciente_apellido_paterno,
            p.apellido_materno as paciente_apellido_materno,
            u.nombre as doctor_nombre, u.apellido_paterno as doctor_apellido_paterno,
            u.apellido_materno as doctor_apellido_materno
        FROM historial_clinico h
        INNER JOIN pacientes p ON h.paciente_id = p.id
        INNER JOIN usuarios u ON h.doctor_id = u.id
        WHERE h.diagnostico LIKE ? OR h.tratamiento LIKE ? OR h.observaciones LIKE ?
        ORDER BY h.fecha_consulta DESC
        LIMIT 50
    `;
    
    db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Error en búsqueda de historial:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json(results);
    });
});

module.exports = router;