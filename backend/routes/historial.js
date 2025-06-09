const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Obtener historial específico por ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [results] = await pool.execute(
      `SELECT h.*, 
              p.nombre as paciente_nombre,
              p.apellido_paterno as paciente_apellido_paterno,
              p.apellido_materno as paciente_apellido_materno,
              p.fecha_nacimiento,
              p.sexo,
              p.telefono,
              p.correo_electronico,
              u.nombre as doctor_nombre,
              u.apellido_paterno as doctor_apellido_paterno,
              u.especialidad
       FROM historial_clinico h
       JOIN pacientes p ON h.paciente_id = p.id
       JOIN usuarios u ON h.doctor_id = u.id
       WHERE h.id = ?`,
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Historial no encontrado' 
      });
    }
    
    const historial = results[0];
    
    // Parsear campos JSON si existen
    const camposJSON = [
      'motivo_consulta',
      'antecedentes_heredo_familiares',
      'antecedentes_personales_no_patologicos',
      'antecedentes_personales_patologicos',
      'examen_extrabucal',
      'examen_intrabucal',
      'auxiliares_diagnostico'
    ];
    
    camposJSON.forEach(campo => {
      if (historial[campo]) {
        try {
          historial[campo] = JSON.parse(historial[campo]);
        } catch (e) {
          console.error(`Error parsing ${campo}:`, e);
        }
      }
    });
    
    res.json({
      success: true,
      data: historial
    });
    
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;