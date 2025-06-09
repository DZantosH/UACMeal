// routes/historial.js - Rutas adaptadas para MySQL
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verifyToken, verifyDoctor } = require('../middleware/auth');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Obtener historial por ID o crear uno nuevo
router.get('/:pacienteId', verifyToken, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    // Buscar historial existente
    const [historiales] = await pool.execute(
      'SELECT * FROM historial_clinico WHERE paciente_id = ? ORDER BY fecha_creacion DESC LIMIT 1',
      [pacienteId]
    );
    
    if (historiales.length > 0) {
      const historial = historiales[0];
      // Parsear datos JSON si existen
      if (historial.datos_completos) {
        historial.datos_completos = JSON.parse(historial.datos_completos);
      }
      return res.json({ historial });
    }
    
    // Si no existe, devolver estructura vacía
    res.json({ historial: { 
      paciente_id: pacienteId,
      datos_completos: {},
      estado: 'borrador'
    }});
    
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Guardar sección del historial
router.post('/:pacienteId/seccion/:seccionId', verifyToken, verifyDoctor, async (req, res) => {
  try {
    const { pacienteId, seccionId } = req.params;
    const { datos } = req.body;
    const doctorId = req.user.id;
    
    console.log(`Guardando sección ${seccionId} para paciente ${pacienteId}`);
    
    // Buscar historial existente
    const [historiales] = await pool.execute(
      'SELECT * FROM historial_clinico WHERE paciente_id = ? ORDER BY fecha_creacion DESC LIMIT 1',
      [pacienteId]
    );
    
    let historialId;
    let datosCompletos = {};
    
    if (historiales.length > 0) {
      // Actualizar historial existente
      historialId = historiales[0].id;
      datosCompletos = historiales[0].datos_completos ? 
        JSON.parse(historiales[0].datos_completos) : {};
      
      // Actualizar datos
      datosCompletos = { ...datosCompletos, ...datos };
      
      await pool.execute(
        'UPDATE historial_clinico SET datos_completos = ?, fecha_actualizacion = NOW() WHERE id = ?',
        [JSON.stringify(datosCompletos), historialId]
      );
      
    } else {
      // Crear nuevo historial
      datosCompletos = datos;
      
      const [result] = await pool.execute(
        'INSERT INTO historial_clinico (paciente_id, doctor_id, fecha_consulta, datos_completos, estado) VALUES (?, ?, CURDATE(), ?, ?)',
        [pacienteId, doctorId, JSON.stringify(datosCompletos), 'borrador']
      );
      
      historialId = result.insertId;
    }
    
    // Log de auditoría
    await pool.execute(
      'INSERT INTO historial_logs (historial_id, usuario_id, accion, seccion, datos_nuevos, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [historialId, req.user.id, 'editar', `seccion_${seccionId}`, JSON.stringify(datos), req.ip]
    );
    
    res.json({ 
      success: true, 
      message: 'Sección guardada exitosamente',
      historialId 
    });
    
  } catch (error) {
    console.error('Error al guardar sección:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Completar historial y generar PDF
router.post('/:pacienteId/completar', verifyToken, verifyDoctor, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { datos, secciones } = req.body;
    const doctorId = req.user.id;
    
    console.log('Completando historial para paciente:', pacienteId);
    
    // Buscar historial existente
    const [historiales] = await pool.execute(
      'SELECT * FROM historial_clinico WHERE paciente_id = ? ORDER BY fecha_creacion DESC LIMIT 1',
      [pacienteId]
    );
    
    if (historiales.length === 0) {
      return res.status(404).json({ error: 'Historial no encontrado' });
    }
    
    const historial = historiales[0];
    const datosCompletos = {
      ...JSON.parse(historial.datos_completos || '{}'),
      ...datos,
      secciones
    };
    
    // Actualizar estado a completo
    await pool.execute(
      'UPDATE historial_clinico SET datos_completos = ?, estado = ?, fecha_actualizacion = NOW() WHERE id = ?',
      [JSON.stringify(datosCompletos), 'completo', historial.id]
    );
    
    // Log de auditoría
    await pool.execute(
      'INSERT INTO historial_logs (historial_id, usuario_id, accion, datos_nuevos, ip_address) VALUES (?, ?, ?, ?, ?)',
      [historial.id, req.user.id, 'finalizar', JSON.stringify(datosCompletos), req.ip]
    );
    
    res.json({ 
      success: true, 
      message: 'Historial completado exitosamente',
      historialId: historial.id 
    });
    
  } catch (error) {
    console.error('Error al completar historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Generar PDF del historial
router.post('/:pacienteId/generar-pdf', verifyToken, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { datos } = req.body;
    
    console.log('Generando PDF para paciente:', pacienteId);
    
    // Buscar historial
    const [historiales] = await pool.execute(
      'SELECT h.*, p.nombre, p.apellido_paterno, p.apellido_materno, p.fecha_nacimiento, u.nombre as doctor_nombre, u.apellido_paterno as doctor_apellido FROM historial_clinico h JOIN pacientes p ON h.paciente_id = p.id JOIN usuarios u ON h.doctor_id = u.id WHERE h.paciente_id = ? ORDER BY h.fecha_creacion DESC LIMIT 1',
      [pacienteId]
    );
    
    if (historiales.length === 0) {
      return res.status(404).json({ error: 'Historial no encontrado' });
    }
    
    const historial = historiales[0];
    const datosCompletos = JSON.parse(historial.datos_completos || '{}');
    
    // Generar HTML del historial
    const htmlContent = generarHTMLHistorial({
      ...datosCompletos,
      ...datos,
      paciente: {
        nombre: `${historial.nombre} ${historial.apellido_paterno} ${historial.apellido_materno}`,
        fechaNacimiento: historial.fecha_nacimiento
      },
      doctor: {
        nombre: `${historial.doctor_nombre} ${historial.doctor_apellido}`
      },
      fecha: new Date().toLocaleDateString('es-MX')
    });
    
    // Generar PDF con Puppeteer
    const pdfBuffer = await generarPDFConPuppeteer(htmlContent);
    
    // Crear directorio si no existe
    const pdfDir = path.join(__dirname, '../pdfs');
    await fs.mkdir(pdfDir, { recursive: true });
    
    // Guardar PDF en sistema de archivos
    const nombreArchivo = `historial_${pacienteId}_${Date.now()}.pdf`;
    const rutaCompleta = path.join(pdfDir, nombreArchivo);
    await fs.writeFile(rutaCompleta, pdfBuffer);
    
    // Generar hash del archivo
    const hash = crypto.createHash('md5').update(pdfBuffer).digest('hex');
    
    // Actualizar registro del historial
    await pool.execute(
      'UPDATE historial_clinico SET pdf_ruta = ?, pdf_generado = TRUE, fecha_pdf = NOW() WHERE id = ?',
      [rutaCompleta, historial.id]
    );
    
    // Guardar registro del archivo
    await pool.execute(
      'INSERT INTO archivos_sistema (nombre_original, nombre_sistema, ruta_completa, tipo_archivo, tamaño_bytes, hash_md5, entidad_tipo, entidad_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombreArchivo, nombreArchivo, rutaCompleta, 'application/pdf', pdfBuffer.length, hash, 'historial', historial.id]
    );
    
    // Opcionalmente guardar PDF en base de datos
    if (process.env.STORE_PDF_IN_DB === 'true') {
      await pool.execute(
        'INSERT INTO historial_pdfs (historial_id, pdf_data, nombre_archivo, tamaño_bytes, hash_archivo) VALUES (?, ?, ?, ?, ?)',
        [historial.id, pdfBuffer, nombreArchivo, pdfBuffer.length, hash]
      );
    }
    
    // Log de auditoría
    await pool.execute(
      'INSERT INTO historial_logs (historial_id, usuario_id, accion, ip_address) VALUES (?, ?, ?, ?)',
      [historial.id, req.user.id, 'generar_pdf', req.ip]
    );
    
    res.json({ 
      success: true, 
      message: 'PDF generado exitosamente',
      archivo: nombreArchivo,
      hash: hash
    });
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Descargar PDF del historial
router.get('/:pacienteId/descargar-pdf', verifyToken, async (req, res) => {
  try {
    const { pacienteId } = req.params;
    
    // Buscar historial con PDF
    const [historiales] = await pool.execute(
      'SELECT * FROM historial_clinico WHERE paciente_id = ? AND pdf_generado = TRUE ORDER BY fecha_pdf DESC LIMIT 1',
      [pacienteId]
    );
    
    if (historiales.length === 0) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }
    
    const historial = historiales[0];
    
    // Verificar si el archivo existe
    const rutaPDF = historial.pdf_ruta;
    try {
      await fs.access(rutaPDF);
    } catch (error) {
      return res.status(404).json({ error: 'Archivo PDF no encontrado en el sistema' });
    }
    
    // Log de auditoría
    await pool.execute(
      'INSERT INTO historial_logs (historial_id, usuario_id, accion, ip_address) VALUES (?, ?, ?, ?)',
      [historial.id, req.user.id, 'ver', req.ip]
    );
    
    // Enviar archivo
    const nombreDescarga = `historial_clinico_${pacienteId}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.download(rutaPDF, nombreDescarga);
    
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Función para generar HTML del historial
function generarHTMLHistorial(datos) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historial Clínico</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
                line-height: 1.4;
            }
            .header { 
                text-align: center; 
                border-bottom: 3px solid #007bff; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
            }
            .header h1 { 
                color: #007bff; 
                margin: 0; 
                font-size: 28px;
            }
            .patient-info { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 8px; 
                margin-bottom: 25px; 
            }
            .section { 
                margin-bottom: 25px; 
                page-break-inside: avoid;
            }
            .section h2 { 
                color: #495057; 
                border-bottom: 2px solid #e9ecef; 
                padding-bottom: 8px; 
                font-size: 18px;
            }
            .section h3 { 
                color: #6c757d; 
                font-size: 16px; 
                margin-top: 20px;
            }
            .data-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 10px; 
                margin: 10px 0; 
            }
            .data-item { 
                margin-bottom: 8px; 
            }
            .label { 
                font-weight: bold; 
                color: #495057; 
            }
            .value { 
                margin-left: 10px; 
            }
            .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #6c757d; 
                border-top: 1px solid #e9ecef; 
                padding-top: 20px; 
            }
            @media print {
                body { margin: 15px; }
                .section { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>HISTORIAL CLÍNICO DENTAL</h1>
            <p>Fecha de generación: ${datos.fecha}</p>
        </div>
        
        <div class="patient-info">
            <h2>INFORMACIÓN DEL PACIENTE</h2>
            <div class="data-grid">
                <div class="data-item">
                    <span class="label">Nombre:</span>
                    <span class="value">${datos.paciente?.nombre || 'No especificado'}</span>
                </div>
                <div class="data-item">
                    <span class="label">Fecha de Nacimiento:</span>
                    <span class="value">${datos.paciente?.fechaNacimiento || 'No especificado'}</span>
                </div>
            </div>
            <div class="data-item">
                <span class="label">Doctor:</span>
                <span class="value">${datos.doctor?.nombre || 'No especificado'}</span>
            </div>
        </div>

        ${generarSeccionHTML('FICHA DE IDENTIFICACIÓN', datos.fichaIdentificacion)}
        ${generarSeccionHTML('MOTIVO DE CONSULTA', datos.motivoConsulta)}
        ${generarSeccionHTML('ANTECEDENTES HEREDO-FAMILIARES', datos.antecedentesHeredoFamiliares)}
        ${generarSeccionHTML('ANTECEDENTES PERSONALES NO PATOLÓGICOS', datos.antecedentesPersonalesNoPatologicos)}
        ${generarSeccionHTML('ANTECEDENTES PERSONALES PATOLÓGICOS', datos.antecedentesPersonalesPatologicos)}
        ${generarSeccionHTML('EXAMEN EXTRABUCAL', datos.examenExtrabucal)}
        ${generarSeccionHTML('EXAMEN INTRABUCAL', datos.examenIntrabucal)}
        ${generarSeccionHTML('AUXILIARES DE DIAGNÓSTICO', datos.auxiliaresDiagnostico)}
        
        <div class="footer">
            <p>Este documento fue generado automáticamente el ${datos.fecha}</p>
            <p>Documento médico confidencial - Solo para uso profesional</p>
        </div>
    </body>
    </html>
  `;
}

// Función auxiliar para generar HTML de secciones
function generarSeccionHTML(titulo, datos) {
  if (!datos) return '';
  
  let html = `<div class="section"><h2>${titulo}</h2>`;
  
  if (typeof datos === 'object') {
    Object.entries(datos).forEach(([key, value]) => {
      if (value && value !== '') {
        html += `<div class="data-item">
          <span class="label">${formatearLabel(key)}:</span>
          <span class="value">${formatearValor(value)}</span>
        </div>`;
      }
    });
  } else {
    html += `<p>${datos}</p>`;
  }
  
  html += '</div>';
  return html;
}

function formatearLabel(key) {
  return key.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
}

function formatearValor(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2).replace(/[{}"]/g, '').replace(/,/g, '<br>');
  }
  return String(value);
}

// Función para generar PDF con Puppeteer
async function generarPDFConPuppeteer(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = router;