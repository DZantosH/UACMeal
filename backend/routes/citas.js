// backend/routes/citas.js
const express = require('express');
const { pool } = require('../config/database'); // ← Ruta correcta
const router = express.Router();

// POST - Agendar nueva cita
router.post('/', async (req, res) => {
  console.log('=== NUEVA CITA REQUEST ===');
  console.log('Body recibido:', req.body);
  
  try {
    const { paciente_id, nombre_paciente, tipo_consulta, fecha_consulta, horario_consulta, doctor_id, observaciones } = req.body;
    
    console.log('Datos extraídos:');
    console.log('- paciente_id:', paciente_id);
    console.log('- nombre_paciente:', nombre_paciente);
    console.log('- tipo_consulta:', tipo_consulta);
    console.log('- fecha_consulta:', fecha_consulta);
    console.log('- horario_consulta:', horario_consulta);
    console.log('- doctor_id:', doctor_id);
    
    // Validar datos requeridos
    if ((!paciente_id && !nombre_paciente) || !tipo_consulta || !fecha_consulta || !horario_consulta || !doctor_id) {
      console.log('ERROR: Faltan campos requeridos');
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    
    // Mapear tipo_consulta a los valores de tu enum
    const tiposCitaValidos = {
      'Consulta General': 'Consulta',
      'Limpieza Dental': 'Limpieza',
      'Extracción': 'Extraccion',
      'Endodoncia': 'Consulta',
      'Ortodoncia': 'Consulta',
      'Implante': 'Consulta',
      'Cirugía Oral': 'Consulta',
      'Revisión': 'Control'
    };
    
    const tipoCitaDB = tiposCitaValidos[tipo_consulta] || 'Consulta';
    console.log('Tipo de cita mapeado:', tipoCitaDB);
    
    let finalPacienteId = paciente_id;
    let nombrePacienteParaCita = nombre_paciente;
    
    // Si no hay paciente_id, crear un paciente temporal
    if (!paciente_id && nombre_paciente) {
      console.log('Creando paciente temporal para:', nombre_paciente);
      try {
        const [pacienteResult] = await pool.execute(
          `INSERT INTO pacientes (nombre, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, activo, fecha_creacion)
           VALUES (?, 'Temporal', '', '1900-01-01', 'M', 1, NOW())`,
          [nombre_paciente.trim()]
        );
        finalPacienteId = pacienteResult.insertId;
        console.log('Paciente temporal creado con ID:', finalPacienteId);
      } catch (pacienteError) {
        console.error('Error creando paciente temporal:', pacienteError);
        return res.status(500).json({ message: 'Error al crear paciente temporal: ' + pacienteError.message });
      }
    }
    
    console.log('Final paciente_id:', finalPacienteId);
    
    // Verificar conflictos de horario
    console.log('Verificando conflictos de horario...');
    const [existingCita] = await pool.execute(
      `SELECT id FROM citas 
       WHERE fecha_cita = ? AND hora_cita = ? AND doctor_id = ? AND estado != 'Cancelada'`,
      [fecha_consulta, horario_consulta, doctor_id]
    );
    
    if (existingCita.length > 0) {
      console.log('ERROR: Conflicto de horario encontrado');
      return res.status(400).json({ 
        message: 'Ya existe una cita agendada en esa fecha y hora con ese doctor' 
      });
    }
    
    console.log('No hay conflictos, creando cita...');
    
    // Crear la cita
    const [result] = await pool.execute(
      `INSERT INTO citas (paciente_id, doctor_id, fecha_cita, hora_cita, tipo_cita, estado, observaciones, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, 'Programada', ?, NOW())`,
      [finalPacienteId, doctor_id, fecha_consulta, horario_consulta, tipoCitaDB, observaciones || `Cita para: ${nombrePacienteParaCita}`]
    );
    
    console.log('Cita creada exitosamente con ID:', result.insertId);
    
    res.status(201).json({
      message: 'Cita agendada exitosamente',
      citaId: result.insertId,
      paciente: nombrePacienteParaCita
    });
    
  } catch (error) {
    console.error('ERROR COMPLETO al agendar cita:', error);
    res.status(500).json({ message: 'Error al agendar la cita: ' + error.message });
  }
});

// GET - Obtener todas las citas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_cita,
        c.estado,
        c.observaciones,
        p.nombre as paciente_nombre,
        CONCAT(p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) as paciente_apellido,
        u.nombre as doctor_nombre,
        CONCAT(u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) as doctor_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.doctor_id = u.id
      ORDER BY c.fecha_cita DESC, c.hora_cita ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
});

// GET - Obtener citas de hoy
router.get('/hoy', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.hora_cita,
        c.tipo_cita,
        c.estado,
        p.nombre as paciente_nombre,
        CONCAT(p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) as paciente_apellido,
        u.nombre as doctor_nombre,
        CONCAT(u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) as doctor_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.doctor_id = u.id
      WHERE DATE(c.fecha_cita) = CURDATE()
      ORDER BY c.hora_cita ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas de hoy:', error);
    res.status(500).json({ message: 'Error al obtener citas de hoy' });
  }
});

// GET - Verificar disponibilidad de horario
router.get('/disponibilidad/:fecha/:hora/:doctorId', async (req, res) => {
  try {
    const { fecha, hora, doctorId } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT id FROM citas 
       WHERE fecha_cita = ? AND hora_cita = ? AND doctor_id = ? AND estado != 'Cancelada'`,
      [fecha, hora, doctorId]
    );
    
    res.json({ disponible: rows.length === 0 });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ message: 'Error al verificar disponibilidad' });
  }
});

// PUT - Actualizar estado de cita
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['Programada', 'Confirmada', 'En_Proceso', 'Completada', 'Cancelada', 'No_Asistio'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    await pool.execute(
      'UPDATE citas SET estado = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [estado, id]
    );
    
    res.json({ message: 'Estado de cita actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar estado de cita:', error);
    res.status(500).json({ message: 'Error al actualizar estado de cita' });
  }
});

// GET - Obtener citas de un mes específico
router.get('/mes/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_cita,
        c.estado,
        p.nombre as paciente_nombre,
        CONCAT(p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) as paciente_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      WHERE YEAR(c.fecha_cita) = ? AND MONTH(c.fecha_cita) = ?
      ORDER BY c.fecha_cita ASC, c.hora_cita ASC`,
      [year, month]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas del mes:', error);
    res.status(500).json({ message: 'Error al obtener citas del mes' });
  }
});

// GET - Obtener citas de un día específico
router.get('/dia/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params; // Formato: YYYY-MM-DD
    
    const [rows] = await pool.execute(
      `SELECT 
        c.id,
        c.fecha_cita,
        c.hora_cita,
        c.tipo_cita,
        c.estado,
        c.observaciones,
        p.nombre as paciente_nombre,
        CONCAT(p.apellido_paterno, ' ', IFNULL(p.apellido_materno, '')) as paciente_apellido,
        u.nombre as doctor_nombre,
        CONCAT(u.apellido_paterno, ' ', IFNULL(u.apellido_materno, '')) as doctor_apellido
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN usuarios u ON c.doctor_id = u.id
      WHERE DATE(c.fecha_cita) = ?
      ORDER BY c.hora_cita ASC`,
      [fecha]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas del día:', error);
    res.status(500).json({ message: 'Error al obtener citas del día' });
  }
});

module.exports = router;