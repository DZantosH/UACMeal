// SOLUCIÓN FINAL - Backend corregido con rutas ordenadas correctamente
// Archivo: routes/pacientes.js

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { pool } = require('../config/database');
const router = express.Router();

// Middleware para verificar acceso a pacientes
const verifyPacientesAccess = (req, res, next) => {
  try {
    const userRole = req.user?.rol || req.user?.role;
    console.log('🔐 Verificando acceso - Usuario:', req.user?.nombre, 'Rol:', userRole);
    
    if (userRole === 'Administrador' || userRole === 'Doctor' || userRole === 'Secretaria') {
      next();
    } else {
      console.error('❌ Acceso denegado - Rol no autorizado:', userRole);
      return res.status(403).json({ 
        error: `Acceso denegado. Rol actual: ${userRole}. Se requiere: Administrador, Doctor o Secretaria` 
      });
    }
  } catch (error) {
    console.error('❌ Error en verifyPacientesAccess:', error);
    return res.status(500).json({ error: 'Error de autorización' });
  }
};

// ✅ RUTAS ESPECÍFICAS PRIMERO (SIN PARÁMETROS DINÁMICOS)

// 🧪 ENDPOINT DE PRUEBA
router.get('/test', verifyToken, async (req, res) => {
  try {
    console.log('🧪 Test endpoint - Usuario:', req.user?.nombre, 'Rol:', req.user?.rol);
    
    const [testResult] = await pool.execute('SELECT 1 as test_connection, NOW() as server_time');
    
    res.json({
      success: true,
      message: 'Backend funcionando correctamente',
      user: {
        id: req.user?.id,
        nombre: req.user?.nombre,
        rol: req.user?.rol
      },
      database: testResult[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en test endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 🔍 ENDPOINT PARA VERIFICAR ESTRUCTURA
router.get('/estructura', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    console.log('🔍 Verificando estructura de tabla pacientes...');
    
    // Obtener estructura de la tabla
    const [columns] = await pool.execute('DESCRIBE pacientes');
    
    // Contar registros
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM pacientes');
    
    // Contar registros activos
    const [activeCount] = await pool.execute(`
      SELECT COUNT(*) as activos 
      FROM pacientes 
      WHERE activo = 1
    `);
    
    res.json({
      success: true,
      tabla_existe: true,
      columnas: columns,
      total_registros: count[0].total,
      registros_activos: activeCount[0].activos
    });
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
    res.status(500).json({ 
      error: 'Error verificando estructura de tabla',
      details: error.message 
    });
  }
});

// 🔍 BUSCAR PACIENTES
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
      WHERE activo = 1 AND (
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

// ✅ RUTAS CON PARÁMETROS ESPECÍFICOS (ANTES DE /:id GENÉRICO)

// 📋 HISTORIAL INDIVIDUAL DE PACIENTE - VERSIÓN COMPLETA CON DEBUG
router.get('/:id/historial', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id: pacienteId } = req.params;
    
    console.log('📋 GET /pacientes/:id/historial - Paciente ID:', pacienteId);
    console.log('🔍 Tipo de ID:', typeof pacienteId);
    console.log('👤 Usuario:', req.user?.nombre, 'Rol:', req.user?.rol);
    
    // Verificar que el paciente existe - CON MÁS LOGS
    console.log('🔍 Ejecutando consulta de paciente...');
    const pacienteQuery = `
      SELECT 
        id, nombre, apellido_paterno, apellido_materno, 
        telefono, correo_electronico, sexo, fecha_nacimiento, activo, estado
      FROM pacientes 
      WHERE id = ? AND activo = 1
    `;
    
    console.log('📝 Query de paciente:', pacienteQuery);
    console.log('📝 Parámetros:', [pacienteId]);
    
    const [pacienteResult] = await pool.execute(pacienteQuery, [pacienteId]);
    
    console.log('📊 Resultados de paciente encontrados:', pacienteResult.length);
    console.log('📊 Resultado completo:', pacienteResult);
    
    if (pacienteResult.length === 0) {
      console.log('❌ Paciente no encontrado o no activo para ID:', pacienteId);
      
      // CONSULTA ADICIONAL PARA DEBUG - Ver si existe pero inactivo
      const [debugResult] = await pool.execute(
        'SELECT id, nombre, apellido_paterno, activo, estado FROM pacientes WHERE id = ?', 
        [pacienteId]
      );
      console.log('🔍 Debug - Paciente existe (incluso si inactivo):', debugResult);
      
      return res.status(404).json({ 
        error: 'Paciente no encontrado',
        pacienteId: pacienteId,
        debug: debugResult.length > 0 ? 'Paciente existe pero está inactivo' : 'Paciente no existe'
      });
    }
    
    const paciente = pacienteResult[0];
    console.log('✅ Paciente encontrado:', paciente.nombre, paciente.apellido_paterno);
    
    // Obtener historial clínico COMPLETO con todos los campos JSON
    let historial = [];
    
    try {
      console.log('🔍 Ejecutando consulta de historial...');
      const [historialResult] = await pool.execute(`
        SELECT 
          hc.id,
          hc.fecha_consulta,
          hc.diagnostico,
          hc.tratamiento,
          hc.medicamentos,
          hc.observaciones,
          hc.motivo_consulta_texto,
          hc.plan_tratamiento,
          hc.evolucion,
          hc.estado,
          hc.version,
          hc.fecha_creacion,
          
          -- ✨ TODOS LOS CAMPOS JSON COMPLETOS
          hc.motivo_consulta,
          hc.antecedentes_heredo_familiares,
          hc.antecedentes_personales_no_patologicos,
          hc.antecedentes_personales_patologicos,
          hc.examen_extrabucal,
          hc.examen_intrabucal,
          hc.auxiliares_diagnostico,
          
          -- Información del doctor
          CONCAT(u.nombre, ' ', u.apellido_paterno) as doctor_nombre,
          u.apellido_paterno as doctor_apellido,
          u.especialidad,
          
          -- Información de la cita
          c.tipo_cita,
          c.precio
        FROM historial_clinico hc
        LEFT JOIN usuarios u ON hc.doctor_id = u.id
        LEFT JOIN citas c ON hc.cita_id = c.id
        WHERE hc.paciente_id = ?
        ORDER BY hc.fecha_consulta DESC
      `, [pacienteId]);
      
      historial = historialResult;
      console.log('📊 Registros de historial encontrados:', historial.length);
      
      // Log detallado del primer registro para debug
      if (historial.length > 0) {
        const primerHistorial = historial[0];
        console.log('📝 Primer registro completo:', {
          id: primerHistorial.id,
          fecha: primerHistorial.fecha_consulta,
          diagnostico: primerHistorial.diagnostico?.substring(0, 50) + '...',
          doctor: primerHistorial.doctor_nombre,
          estado: primerHistorial.estado,
          tiene_motivo_consulta: !!primerHistorial.motivo_consulta,
          tiene_antecedentes_heredo: !!primerHistorial.antecedentes_heredo_familiares,
          tiene_antecedentes_no_patologicos: !!primerHistorial.antecedentes_personales_no_patologicos,
          tiene_antecedentes_patologicos: !!primerHistorial.antecedentes_personales_patologicos,
          tiene_examen_extrabucal: !!primerHistorial.examen_extrabucal,
          tiene_examen_intrabucal: !!primerHistorial.examen_intrabucal,
          tiene_auxiliares: !!primerHistorial.auxiliares_diagnostico
        });
        
        // Log de ejemplo de contenido JSON (solo si existe)
        if (primerHistorial.motivo_consulta) {
          console.log('🗣️ Ejemplo motivo_consulta:', 
            typeof primerHistorial.motivo_consulta === 'string' ? 
            primerHistorial.motivo_consulta.substring(0, 100) + '...' :
            'Es objeto JSON'
          );
        }
      }
      
    } catch (historialError) {
      console.error('❌ Error al obtener historial clínico:', historialError.message);
      console.error('❌ Stack trace:', historialError.stack);
      historial = [];
    }
    
    // Respuesta exitosa con TODOS los datos
    const response = {
      paciente: paciente,
      historial: historial,
      total_registros: historial.length,
      paciente_id: pacienteId
    };
    
    console.log('✅ Respuesta enviada completa:', {
      paciente: paciente.nombre,
      registros_historial: historial.length,
      primer_registro_id: historial.length > 0 ? historial[0].id : null
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ ERROR COMPLETO en GET /pacientes/:id/historial:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : 'Error interno'
    });
  }
});

// ✅ RUTAS GENÉRICAS AL FINAL

// 📋 ENDPOINT PRINCIPAL PARA LISTAR TODOS LOS PACIENTES
router.get('/', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    console.log('📋 GET /pacientes - Iniciando...');
    console.log('👤 Usuario:', req.user?.nombre, 'ID:', req.user?.id, 'Rol:', req.user?.rol);
    
    // Query corregida con nombres correctos de columnas según tu BD
    const query = `
      SELECT 
        id,
        COALESCE(nombre, '') as nombre,
        COALESCE(apellido_paterno, '') as apellido_paterno,
        COALESCE(apellido_materno, '') as apellido_materno,
        fecha_nacimiento,
        telefono,
        correo_electronico,
        calle_numero as direccion,
        COALESCE(estado, 'Activo') as estado,
        fecha_creacion as fecha_registro,
        activo,
        sexo,
        rfc,
        CASE 
          WHEN COALESCE(estado, 'Activo') = 'Temporal' THEN 
            CONCAT(
              COALESCE(nombre, ''), 
              CASE WHEN COALESCE(apellido_paterno, '') != '' THEN CONCAT(' ', apellido_paterno) ELSE '' END,
              CASE WHEN COALESCE(apellido_materno, '') != '' THEN CONCAT(' ', apellido_materno) ELSE '' END,
              ' (Temporal)'
            )
          ELSE 
            CONCAT(
              COALESCE(nombre, ''), 
              CASE WHEN COALESCE(apellido_paterno, '') != '' THEN CONCAT(' ', apellido_paterno) ELSE '' END,
              CASE WHEN COALESCE(apellido_materno, '') != '' THEN CONCAT(' ', apellido_materno) ELSE '' END
            )
        END as nombre_completo_con_estado
      FROM pacientes 
      WHERE activo = 1
      ORDER BY 
        CASE WHEN COALESCE(estado, 'Activo') = 'Temporal' THEN 0 ELSE 1 END,
        fecha_creacion DESC
      LIMIT 1000
    `;
    
    console.log('🔍 Ejecutando query...');
    const [rows] = await pool.execute(query);
    
    console.log('✅ Query ejecutada exitosamente');
    console.log('📊 Pacientes encontrados:', rows.length);
    
    if (rows.length === 0) {
      console.log('ℹ️ No se encontraron pacientes activos');
      return res.json([]);
    }
    
    // Log de muestra para debug
    console.log('📝 Primer paciente encontrado:', {
      id: rows[0].id,
      nombre: rows[0].nombre,
      apellido_paterno: rows[0].apellido_paterno,
      estado: rows[0].estado,
      nombre_completo: rows[0].nombre_completo_con_estado
    });
    
    // Respuesta exitosa
    res.status(200).json(rows);
    
  } catch (error) {
    console.error('❌ ERROR COMPLETO en GET /pacientes:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error stack:', error.stack);
    
    // Respuesta de error detallada
    let errorMessage = 'Error interno del servidor';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Tabla pacientes no existe en la base de datos';
      errorCode = 'TABLE_NOT_EXISTS';
    } else if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = 'Error en campos de la tabla pacientes: ' + error.message;
      errorCode = 'FIELD_ERROR';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'No se puede conectar a la base de datos';
      errorCode = 'DB_CONNECTION_ERROR';
    }
    
    res.status(500).json({
      error: errorMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        errno: error.errno
      } : undefined
    });
  }
});

// 👤 OBTENER PACIENTE POR ID
router.get('/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('👤 GET /pacientes/:id - ID:', id);
    
    const [results] = await pool.execute(
      'SELECT * FROM pacientes WHERE id = ? AND activo = 1', 
      [id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.json(results[0]);
    
  } catch (error) {
    console.error('❌ Error al obtener paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ RUTAS DE MODIFICACIÓN (POST, PUT, DELETE)

// ➕ CREAR NUEVO PACIENTE
router.post('/', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
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
        derecho_habiente, nombre_institucion, activo, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'Activo')
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

// ✏️ ACTUALIZAR PACIENTE
router.put('/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que el paciente existe
    const [existing] = await pool.execute('SELECT id FROM pacientes WHERE id = ? AND activo = 1', [id]);
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

// 🗑️ DESACTIVAR PACIENTE (soft delete)
router.delete('/:id', verifyToken, verifyPacientesAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE pacientes SET activo = 0, fecha_actualizacion = NOW() WHERE id = ? AND activo = 1', 
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