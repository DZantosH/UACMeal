// middleware/historialValidation.js
const { body, validationResult } = require('express-validator');
const HistorialClinico = require('../models/HistorialClinico');

// Middleware para validar permisos específicos del historial
const validarPermisosHistorial = (accion = 'leer') => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      const historial = await HistorialClinico.findById(id);
      if (!historial) {
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Verificar permisos según la acción
      switch (accion) {
        case 'leer':
          const puedeVer = 
            historial.pacienteId.toString() === usuario.id ||
            historial.medicoId.toString() === usuario.id ||
            usuario.rol === 'admin';
          
          if (!puedeVer) {
            return res.status(403).json({
              success: false,
              message: 'No tienes permisos para ver este historial'
            });
          }
          break;

        case 'escribir':
          const puedeModificar = 
            historial.medicoId.toString() === usuario.id ||
            usuario.rol === 'admin';
          
          if (!puedeModificar) {
            return res.status(403).json({
              success: false,
              message: 'No tienes permisos para modificar este historial'
            });
          }
          break;

        case 'eliminar':
          if (usuario.rol !== 'admin') {
            return res.status(403).json({
              success: false,
              message: 'Solo los administradores pueden eliminar historiales'
            });
          }
          break;
      }

      req.historial = historial;
      next();

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al validar permisos',
        error: error.message
      });
    }
  };
};

// Middleware para validar estado del historial
const validarEstadoHistorial = (estadosPermitidos = []) => {
  return (req, res, next) => {
    const historial = req.historial;
    
    if (estadosPermitidos.length > 0 && !estadosPermitidos.includes(historial.estado)) {
      return res.status(400).json({
        success: false,
        message: `Esta acción no está permitida para historiales en estado: ${historial.estado}`
      });
    }

    next();
  };
};

// Middleware para auto-guardar cambios
const autoguardado = (req, res, next) => {
  // Interceptar la respuesta exitosa para marcar como actualizado
  const originalSend = res.json;
  
  res.json = function(data) {
    if (data.success && req.historial) {
      req.historial.fecha_actualizacion = new Date();
      req.historial.actualizado_por = req.usuario.id;
      req.historial.save().catch(console.error);
    }
    originalSend.call(this, data);
  };
  
  next();
};

// Validaciones específicas para cada sección
const validacionesFichaIdentificacion = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('apellidoPaterno')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido paterno debe tener entre 2 y 50 caracteres'),
  
  body('apellidoMaterno')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido materno debe tener entre 2 y 50 caracteres'),
  
  body('sexo')
    .optional()
    .isIn(['Masculino', 'Femenino', 'Otro'])
    .withMessage('Sexo debe ser Masculino, Femenino u Otro'),
  
  body('fechaNacimiento')
    .optional()
    .isISO8601()
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fecha.getFullYear();
      
      if (edad < 0 || edad > 120) {
        throw new Error('Fecha de nacimiento no válida');
      }
      return true;
    }),
  
  body('rfc')
    .optional()
    .isLength({ min: 10, max: 13 })
    .matches(/^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/)
    .withMessage('RFC no tiene el formato correcto'),
  
  body('telefono')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Teléfono debe ser un número válido mexicano'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email debe tener formato válido')
];

const validacionesMotivoConsulta = [
  body('motivo')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('El motivo debe tener entre 5 y 1000 caracteres'),
  
  body('escalaDolor')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('La escala de dolor debe ser entre 0 y 10'),
  
  body('nivelUrgencia')
    .optional()
    .isIn(['baja', 'media', 'alta', 'urgente'])
    .withMessage('Nivel de urgencia no válido'),
  
  body('duracionSintomas')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Duración de síntomas no debe exceder 100 caracteres'),
  
  body('tratamientoPrevio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Tratamiento previo no debe exceder 500 caracteres')
];

const validacionesSignosVitales = [
  body('temperatura')
    .optional()
    .isFloat({ min: 30.0, max: 45.0 })
    .withMessage('Temperatura debe estar entre 30 y 45°C'),
  
  body('tension_arterial_sistolica')
    .optional()
    .isInt({ min: 60, max: 250 })
    .withMessage('Tensión sistólica debe estar entre 60 y 250 mmHg'),
  
  body('tension_arterial_diastolica')
    .optional()
    .isInt({ min: 40, max: 150 })
    .withMessage('Tensión diastólica debe estar entre 40 y 150 mmHg'),
  
  body('frecuencia_respiratoria')
    .optional()
    .isInt({ min: 5, max: 60 })
    .withMessage('Frecuencia respiratoria debe estar entre 5 y 60 por minuto'),
  
  body('frecuencia_cardiaca')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Frecuencia cardíaca debe estar entre 30 y 200 por minuto'),
  
  body('pulso')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Pulso debe estar entre 30 y 200 por minuto')
];

const validacionesSomatometria = [
  body('peso')
    .optional()
    .isFloat({ min: 1.0, max: 300.0 })
    .withMessage('Peso debe estar entre 1 y 300 kg'),
  
  body('talla')
    .optional()
    .isFloat({ min: 50.0, max: 250.0 })
    .withMessage('Talla debe estar entre 50 y 250 cm'),
  
  body('imc')
    .optional()
    .isFloat({ min: 10.0, max: 60.0 })
    .withMessage('IMC debe estar entre 10 y 60')
];

// Middleware para calcular IMC automáticamente
const calcularIMC = (req, res, next) => {
  if (req.body.peso && req.body.talla) {
    const peso = parseFloat(req.body.peso);
    const talla = parseFloat(req.body.talla) / 100; // convertir cm a metros
    
    if (peso > 0 && talla > 0) {
      req.body.imc = (peso / (talla * talla)).toFixed(2);
    }
  }
  
  next();
};

// Middleware para limpiar datos
const limpiarDatos = (req, res, next) => {
  // Función recursiva para limpiar strings
  const limpiarObjeto = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim();
    } else if (Array.isArray(obj)) {
      return obj.map(limpiarObjeto);
    } else if (obj && typeof obj === 'object') {
      const objetoLimpio = {};
      Object.keys(obj).forEach(key => {
        objetoLimpio[key] = limpiarObjeto(obj[key]);
      });
      return objetoLimpio;
    }
    return obj;
  };

  req.body = limpiarObjeto(req.body);
  next();
};

// Middleware para validar formato de ObjectId
const validarObjectId = (campo) => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const valor = req.params[campo] || req.body[campo];
    
    if (valor && !mongoose.Types.ObjectId.isValid(valor)) {
      return res.status(400).json({
        success: false,
        message: `${campo} no es un ID válido`
      });
    }
    
    next();
  };
};

// Middleware para logging de auditoría
const auditLogger = (accion) => {
  return (req, res, next) => {
    const originalSend = res.json;
    
    res.json = function(data) {
      // Log de auditoría
      if (data.success) {
        console.log(`[AUDIT] ${new Date().toISOString()} - Usuario: ${req.usuario.id} - Acción: ${accion} - Historial: ${req.params.id || 'N/A'} - IP: ${req.ip}`);
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware para rate limiting específico de historiales
const historialRateLimit = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: (req, res) => {
    // Límites diferentes según el rol
    if (req.usuario.rol === 'admin') return 200;
    if (req.usuario.rol === 'medico') return 100;
    return 20; // pacientes
  },
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para validar duplicados de RFC
const validarRFCUnico = async (req, res, next) => {
  try {
    const rfc = req.body.ficha_identificacion?.rfc;
    const historialId = req.params.id;
    
    if (rfc) {
      const historialExistente = await HistorialClinico.findOne({
        'ficha_identificacion.rfc': rfc.toUpperCase(),
        _id: { $ne: historialId } // Excluir el historial actual en actualizaciones
      });
      
      if (historialExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un historial con este RFC'
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al validar RFC',
      error: error.message
    });
  }
};

// Middleware para manejar errores de validación
const manejarErroresValidacion = (req, res, next) => {
  const errores = validationResult(req);
  
  if (!errores.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errores: errores.array().map(error => ({
        campo: error.param,
        mensaje: error.msg,
        valor: error.value
      }))
    });
  }
  
  next();
};

// Middleware para comprimir respuestas grandes
const compresionCondicional = (req, res, next) => {
  const originalSend = res.json;
  
  res.json = function(data) {
    // Comprimir si la respuesta es muy grande
    const dataString = JSON.stringify(data);
    if (dataString.length > 50000) { // 50KB
      res.set('Content-Encoding', 'gzip');
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  validarPermisosHistorial,
  validarEstadoHistorial,
  autoguardado,
  validacionesFichaIdentificacion,
  validacionesMotivoConsulta,
  validacionesSignosVitales,
  validacionesSomatometria,
  calcularIMC,
  limpiarDatos,
  validarObjectId,
  auditLogger,
  historialRateLimit,
  validarRFCUnico,
  manejarErroresValidacion,
  compresionCondicional
};

// config/database.js - Configuración de conexión con MongoDB
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Plugin de paginación para todos los esquemas
mongoose.plugin(mongoosePaginate);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
    
    // Configurar índices para mejor rendimiento
    await configureIndexes();
    
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
    process.exit(1);
  }
};

const configureIndexes = async () => {
  try {
    const HistorialClinico = require('../models/HistorialClinico');
    
    // Crear índices compuestos para consultas frecuentes
    await HistorialClinico.collection.createIndex({
      pacienteId: 1,
      fecha_creacion: -1
    });
    
    await HistorialClinico.collection.createIndex({
      medicoId: 1,
      estado: 1,
      fecha_creacion: -1
    });
    
    await HistorialClinico.collection.createIndex({
      'ficha_identificacion.rfc': 1
    }, { unique: true, sparse: true });
    
    await HistorialClinico.collection.createIndex({
      'ficha_identificacion.nombre': 'text',
      'ficha_identificacion.apellidoPaterno': 'text',
      'ficha_identificacion.apellidoMaterno': 'text',
      'motivo_consulta.motivo': 'text'
    });
    
    console.log('Índices de base de datos configurados correctamente');
    
  } catch (error) {
    console.error('Error al configurar índices:', error);
  }
};

module.exports = { connectDB };

// utils/responseFormatter.js - Utilidad para formatear respuestas
class ResponseFormatter {
  static success(data, message = 'Operación exitosa') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message = 'Error interno del servidor', errors = null, statusCode = 500) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  static paginated(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ResponseFormatter;

// utils/validators.js - Validadores personalizados
const validadores = {
  esMayorDeEdad: (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad >= 18;
  },

  validarRFC: (rfc) => {
    const regex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9]$/;
    return regex.test(rfc);
  },

  validarTelefono: (telefono) => {
    // Formato mexicano: 10 dígitos
    const regex = /^[0-9]{10}$/;
    return regex.test(telefono.replace(/\D/g, ''));
  },

  validarEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  validarPresionArterial: (sistolica, diastolica) => {
    const sis = parseInt(sistolica);
    const dia = parseInt(diastolica);
    
    return (
      sis >= 60 && sis <= 250 &&
      dia >= 40 && dia <= 150 &&
      sis > dia
    );
  },

  validarIMC: (peso, talla) => {
    const p = parseFloat(peso);
    const t = parseFloat(talla) / 100; // cm a metros
    
    if (p <= 0 || t <= 0) return false;
    
    const imc = p / (t * t);
    return imc >= 10 && imc <= 60;
  }
};

module.exports = validadores;