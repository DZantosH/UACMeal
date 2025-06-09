const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { pool } = require('../config/database');
const router = express.Router();


// ✅ MIDDLEWARE PERSONALIZADO PARA PACIENTES
const verifyPacientesAccess = (req, res, next) => {
  const userRole = req.user.rol;
  
  // Permitir acceso a Administradores, Doctores y Secretarias
  if (userRole === 'Administrador' || userRole === 'Doctor' || userRole === 'Secretaria') {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requiere rol de Administrador, Doctor o Secretaria' 
    });
  }
};

// 🔧 ENDPOINT PRINCIPAL MEJORADO PARA OBTENER PACIENTES
router.get('/', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    console.log('📋 GET /pacientes - Iniciando consulta');
    console.log('👤 Usuario:', req.user?.nombre, 'Rol:', req.user?.rol);
    
    // Query mejorada con mejor manejo de campos NULL
    const query = `
      SELECT 
        id, 
        COALESCE(nombre, '') as nombre, 
        COALESCE(apellido_paterno, '') as apellido_paterno, 
        COALESCE(apellido_materno, '') as apellido_materno, 
        fecha_nacimiento, 
        telefono, 
        correo_electronico, 
        direccion,
        COALESCE(estado, 'Activo') as estado, 
        fecha_expiracion, 
        fecha_registro,
        activo,
        CASE 
          WHEN COALESCE(estado, 'Activo') = 'Temporal' THEN 
            CONCAT(
              COALESCE(nombre, ''), 
              CASE WHEN COALESCE(nombre, '') != '' AND COALESCE(apellido_paterno, '') != '' THEN ' ' ELSE '' END,
              COALESCE(apellido_paterno, ''), 
              CASE WHEN COALESCE(apellido_materno, '') != '' THEN CONCAT(' ', apellido_materno) ELSE '' END,
              ' (Temporal)'
            )
          ELSE 
            CONCAT(
              COALESCE(nombre, ''), 
              CASE WHEN COALESCE(nombre, '') != '' AND COALESCE(apellido_paterno, '') != '' THEN ' ' ELSE '' END,
              COALESCE(apellido_paterno, ''), 
              CASE WHEN COALESCE(apellido_materno, '') != '' THEN CONCAT(' ', apellido_materno) ELSE '' END
            )
        END as nombre_completo_con_estado
      FROM pacientes 
      WHERE activo = 1 OR activo = TRUE
      ORDER BY 
        CASE WHEN COALESCE(estado, 'Activo') = 'Temporal' THEN 1 ELSE 0 END,
        fecha_registro DESC
    `;
    
    console.log('🔍 Ejecutando query:', query.replace(/\s+/g, ' ').trim());
    
    const [rows] = await pool.execute(query);
    
    console.log('✅ Consulta exitosa. Pacientes encontrados:', rows.length);
    
    if (rows.length === 0) {
      console.log('ℹ️ No se encontraron pacientes activos');
    } else {
      console.log('📊 Primeros 3 pacientes:', rows.slice(0, 3).map(p => ({
        id: p.id,
        nombre: p.nombre,
        apellido_paterno: p.apellido_paterno,
        estado: p.estado,
        nombre_completo: p.nombre_completo_con_estado
      })));
    }
    
    // Enviar respuesta con headers apropiados
    res.set({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.status(200).json(rows);
    
  } catch (error) {
    console.error('❌ Error en GET /pacientes:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Respuesta de error más detallada
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener pacientes',
      message: error.message,
      code: 'PACIENTES_FETCH_ERROR'
    });
  }
});

// 🔧 ENDPOINT DE PRUEBA PARA VERIFICAR CONECTIVIDAD
router.get('/test', verifyToken, async (req, res) => {
  try {
    console.log('🧪 Test endpoint llamado');
    console.log('👤 Usuario test:', req.user?.nombre, 'Rol:', req.user?.rol);
    
    // Prueba de conectividad básica
    const [result] = await pool.execute('SELECT 1 as test_connection');
    
    res.json({
      success: true,
      message: 'Conexión exitosa',
      user: {
        id: req.user?.id,
        nombre: req.user?.nombre,
        rol: req.user?.rol
      },
      database: result[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para convertir paciente temporal a activo
router.put('/convertir-temporal/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔄 Convirtiendo paciente temporal ID:', id);
    console.log('📋 Datos a actualizar:', updateData);
    
    // Verificar que el paciente temporal existe
    const [existing] = await connection.execute(
      'SELECT * FROM pacientes WHERE id = ? AND estado = ? AND activo = 1', 
      [id, 'Temporal']
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: 'Paciente temporal no encontrado' });
    }
    
    // Actualizar el paciente temporal a activo
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined && key !== 'id');
    
    if (fields.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    // Agregar estado = 'Activo' a la actualización
    fields.push('estado');
    updateData.estado = 'Activo';
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(id);
    
    const query = `UPDATE pacientes SET ${setClause}, fecha_actualizacion = NOW() WHERE id = ?`;
    
    console.log('🔧 Query de actualización:', query);
    console.log('📋 Valores:', values);
    
    await connection.execute(query, values);
    
    await connection.commit();
    connection.release();
    
    res.json({ 
      message: 'Paciente convertido exitosamente a activo',
      pacienteId: id,
      accion: 'convertido'
    });
    
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('❌ Error al convertir paciente temporal:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al convertir paciente',
      message: error.message 
    });
  }
});

// Obtener historial clínico de un paciente
router.get('/:id/historial', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📋 Obteniendo historial para paciente ID:', id);
    
    // Obtener datos del paciente
    const [pacienteResult] = await pool.execute(
      'SELECT * FROM pacientes WHERE id = ? AND activo = TRUE', 
      [id]
    );
    
    if (pacienteResult.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    // Obtener historial clínico
    const [historialResult] = await pool.execute(
      `SELECT h.*, 
              u.nombre as doctor_nombre, 
              u.apellido_paterno as doctor_apellido,
              u.especialidad as doctor_especialidad
       FROM historial_clinico h
       LEFT JOIN usuarios u ON h.doctor_id = u.id 
       WHERE h.paciente_id = ?
       ORDER BY h.fecha_consulta DESC`,
      [id]
    );
    
    // Parsear campos JSON si existen
    const historialParsed = historialResult.map(h => {
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
        if (h[campo]) {
          try {
            h[campo] = JSON.parse(h[campo]);
          } catch (e) {
            console.error(`Error parsing ${campo}:`, e);
          }
        }
      });
      
      return h;
    });
    
    res.json({
      success: true,
      paciente: pacienteResult[0],
      historial: historialParsed
    });
    
  } catch (err) {
    console.error('❌ Error al obtener historial:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Buscar pacientes
router.get('/buscar', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { q } = req.query;
    
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
    
    const [results] = await pool.execute(query, [searchTerm, searchTerm, searchTerm, searchTerm]);
    res.json(results);
    
  } catch (err) {
    console.error('❌ Error en búsqueda de pacientes:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener paciente por ID
router.get('/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM pacientes WHERE id = ? AND activo = TRUE';
    const [results] = await pool.execute(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.json(results[0]);
    
  } catch (err) {
    console.error('❌ Error al obtener paciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo paciente
router.post('/', verifyToken, verifyPacientesAccess, [
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido_paterno').notEmpty().withMessage('Apellido paterno es requerido'),
  body('fecha_nacimiento').isDate().withMessage('Fecha de nacimiento válida requerida'),
  body('sexo').isIn(['M', 'F']).withMessage('Sexo debe ser M o F'),
  body('telefono').optional().isMobilePhone('es-MX').withMessage('Teléfono inválido'),
  body('correo_electronico').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
  try {
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
    
    const [result] = await pool.execute(query, values);
    
    res.status(201).json({
      message: 'Paciente creado exitosamente',
      id: result.insertId
    });
    
  } catch (err) {
    console.error('❌ Error al crear paciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar paciente
router.put('/:id', verifyToken, verifyPacientesAccess, [
  body('nombre').optional().notEmpty().withMessage('Nombre no puede estar vacío'),
  body('apellido_paterno').optional().notEmpty().withMessage('Apellido paterno no puede estar vacío'),
  body('telefono').optional().isMobilePhone('es-MX').withMessage('Teléfono inválido'),
  body('correo_electronico').optional().isEmail().withMessage('Email inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que el paciente existe
    const [existing] = await pool.execute('SELECT id FROM pacientes WHERE id = ? AND activo = TRUE', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Construir query dinámico para actualización
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(id);

    const query = `UPDATE pacientes SET ${setClause}, fecha_actualizacion = NOW() WHERE id = ?`;
    await pool.execute(query, values);

    res.json({ message: 'Paciente actualizado exitosamente' });
    
  } catch (err) {
    console.error('❌ Error al actualizar paciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT - Actualizar paciente temporal
router.put('/temporales/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, telefono, observaciones } = req.body;
    
    const [result] = await pool.execute(
      `UPDATE pacientes_temporales 
       SET nombre_completo = ?, telefono = ?, observaciones = ?, fecha_actualizacion = NOW()
       WHERE id = ? AND activo = 1`,
      [nombre_completo, telefono, observaciones, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente temporal no encontrado' });
    }
    
    res.json({ message: 'Paciente temporal actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar paciente temporal:', error);
    res.status(500).json({ message: 'Error al actualizar paciente temporal' });
  }
});

// POST - Convertir paciente temporal a permanente
router.post('/convertir-temporal', verifyToken, verifyPacientesAccess, async (req, res) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const {
      nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
      telefono, email, direccion, contacto_emergencia, telefono_emergencia,
      observaciones_medicas, alergias, medicamentos_actuales, paciente_temporal_id
    } = req.body;
    
    // Crear el paciente permanente
    const [pacienteResult] = await connection.execute(
      `INSERT INTO pacientes (
        nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
        telefono, email, direccion, contacto_emergencia, telefono_emergencia,
        observaciones_medicas, alergias, medicamentos_actuales, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nombre, apellido_paterno, apellido_materno, fecha_nacimiento,
        telefono, email, direccion, contacto_emergencia, telefono_emergencia,
        observaciones_medicas, alergias, medicamentos_actuales
      ]
    );
    
    const nuevoPacienteId = pacienteResult.insertId;
    
    // Actualizar todas las citas del paciente temporal para que apunten al nuevo paciente permanente
    await connection.execute(
      `UPDATE citas 
       SET paciente_id = ?, paciente_temporal_id = NULL 
       WHERE paciente_temporal_id = ?`,
      [nuevoPacienteId, paciente_temporal_id]
    );
    
    // Desactivar el paciente temporal
    await connection.execute(
      'UPDATE pacientes_temporales SET activo = 0 WHERE id = ?',
      [paciente_temporal_id]
    );
    
    await connection.commit();
    connection.release();
    
    res.status(201).json({
      message: 'Paciente convertido exitosamente',
      pacienteId: nuevoPacienteId,
      citasActualizadas: true
    });
    
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error al convertir paciente temporal:', error);
    res.status(500).json({ message: 'Error al convertir paciente temporal: ' + error.message });
  }
});

// Desactivar paciente (soft delete)
router.delete('/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE pacientes SET activo = FALSE, fecha_actualizacion = NOW() WHERE id = ? AND activo = TRUE', 
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.json({ message: 'Paciente desactivado exitosamente' });
    
  } catch (err) {
    console.error('❌ Error al desactivar paciente:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;