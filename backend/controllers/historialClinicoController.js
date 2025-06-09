// controllers/historialClinicoController.js - Adaptado para MySQL/Sequelize
const { HistorialClinico, Paciente, Usuario, Cita } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class HistorialClinicoController {
  
  // Crear nuevo historial clínico
  static async crearHistorial(req, res) {
    const transaction = await HistorialClinico.sequelize.transaction();
    
    try {
      // Validar errores de entrada
      const errores = validationResult(req);
      if (!errores.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errores: errores.array()
        });
      }

      const { paciente_id, cita_id, ...datosHistorial } = req.body;
      const doctor_id = req.usuario.id;

      // Verificar que el paciente existe
      const paciente = await Paciente.findByPk(paciente_id);
      if (!paciente) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Verificar que el médico tiene permisos
      if (req.usuario.rol !== 'Doctor' && req.usuario.rol !== 'Administrador') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear historiales clínicos'
        });
      }

      // Calcular IMC si se proporciona peso y talla
      if (datosHistorial.antecedentes_personales_patologicos?.somatometria) {
        const somatometria = datosHistorial.antecedentes_personales_patologicos.somatometria;
        if (somatometria.peso && somatometria.talla) {
          const peso = parseFloat(somatometria.peso);
          const talla = parseFloat(somatometria.talla) / 100;
          somatometria.imc = (peso / (talla * talla)).toFixed(2);
        }
      }

      // Crear el historial
      const nuevoHistorial = await HistorialClinico.create({
        paciente_id,
        doctor_id,
        cita_id: cita_id || null,
        fecha_consulta: new Date(),
        ...datosHistorial,
        creado_por: doctor_id,
        actualizado_por: doctor_id
      }, { transaction });

      // Obtener el historial completo con relaciones
      const historialCompleto = await HistorialClinico.findByPk(nuevoHistorial.id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'correo_electronico', 'telefono']
          },
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          }
        ],
        transaction
      });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Historial clínico creado exitosamente',
        data: historialCompleto
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear historial clínico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener historial por ID
  static async obtenerHistorial(req, res) {
    try {
      const { id } = req.params;
      
      const historial = await HistorialClinico.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'correo_electronico', 'telefono', 'fecha_nacimiento', 'sexo', 'rfc']
          },
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          },
          {
            model: Cita,
            as: 'cita',
            attributes: ['id', 'fecha_cita', 'hora_cita', 'tipo_cita', 'estado']
          }
        ]
      });

      if (!historial) {
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Verificar permisos
      const esElPaciente = historial.paciente_id === req.usuario.paciente_id;
      const esElMedico = historial.doctor_id === req.usuario.id;
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElPaciente && !esElMedico && !esAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver este historial'
        });
      }

      res.json({
        success: true,
        data: historial
      });

    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar historial clínico
  static async actualizarHistorial(req, res) {
    const transaction = await HistorialClinico.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;

      const historial = await HistorialClinico.findByPk(id, { transaction });
      if (!historial) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Verificar permisos (solo el médico que lo creó o admin)
      const esElMedico = historial.doctor_id === req.usuario.id;
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElMedico && !esAdmin) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar este historial'
        });
      }

      // Calcular IMC si se actualiza peso/talla
      if (datosActualizacion.antecedentes_personales_patologicos?.somatometria) {
        const somatometria = datosActualizacion.antecedentes_personales_patologicos.somatometria;
        if (somatometria.peso && somatometria.talla) {
          const peso = parseFloat(somatometria.peso);
          const talla = parseFloat(somatometria.talla) / 100;
          somatometria.imc = (peso / (talla * talla)).toFixed(2);
        }
      }

      // Actualizar el historial
      await historial.update({
        ...datosActualizacion,
        actualizado_por: req.usuario.id
      }, { transaction });

      // Obtener el historial actualizado con relaciones
      const historialActualizado = await HistorialClinico.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno']
          },
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['id', 'nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          }
        ],
        transaction
      });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Historial actualizado exitosamente',
        data: historialActualizado
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener historiales de un paciente
  static async obtenerHistorialesPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const { limite = 10, pagina = 1, estado } = req.query;

      // Verificar permisos
      const esElPaciente = parseInt(pacienteId) === req.usuario.paciente_id;
      const esMedico = req.usuario.rol === 'Doctor';
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElPaciente && !esMedico && !esAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estos historiales'
        });
      }

      const opciones = { limite, pagina, estado };
      
      // Si es médico, solo ver sus propios historiales del paciente
      if (esMedico && !esAdmin) {
        const where = { paciente_id: parseInt(pacienteId), doctor_id: req.usuario.id };
        if (estado) where.estado = estado;

        const { count, rows } = await HistorialClinico.findAndCountAll({
          where,
          include: [
            {
              model: Usuario,
              as: 'doctor',
              attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
            }
          ],
          order: [['fecha_consulta', 'DESC']],
          limit: parseInt(limite),
          offset: (parseInt(pagina) - 1) * parseInt(limite)
        });

        return res.json({
          success: true,
          data: {
            docs: rows,
            totalDocs: count,
            limit: parseInt(limite),
            page: parseInt(pagina),
            totalPages: Math.ceil(count / parseInt(limite)),
            hasNextPage: parseInt(pagina) * parseInt(limite) < count,
            hasPrevPage: parseInt(pagina) > 1
          }
        });
      }

      // Para admin o el propio paciente, ver todos los historiales
      const historiales = await HistorialClinico.obtenerHistorialesPaciente(parseInt(pacienteId), opciones);

      res.json({
        success: true,
        data: {
          docs: historiales.rows,
          totalDocs: historiales.count,
          limit: parseInt(limite),
          page: parseInt(pagina),
          totalPages: Math.ceil(historiales.count / parseInt(limite)),
          hasNextPage: parseInt(pagina) * parseInt(limite) < historiales.count,
          hasPrevPage: parseInt(pagina) > 1
        }
      });

    } catch (error) {
      console.error('Error al obtener historiales del paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener historiales creados por un médico
  static async obtenerHistorialesMedico(req, res) {
    try {
      const { medicoId } = req.params;
      const { limite = 10, pagina = 1, estado, fechaInicio, fechaFin } = req.query;

      // Verificar permisos
      const esElMedico = parseInt(medicoId) === req.usuario.id;
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElMedico && !esAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estos historiales'
        });
      }

      const opciones = { limite, pagina, estado, fechaInicio, fechaFin };
      const historiales = await HistorialClinico.obtenerHistorialesMedico(parseInt(medicoId), opciones);

      res.json({
        success: true,
        data: {
          docs: historiales.rows,
          totalDocs: historiales.count,
          limit: parseInt(limite),
          page: parseInt(pagina),
          totalPages: Math.ceil(historiales.count / parseInt(limite)),
          hasNextPage: parseInt(pagina) * parseInt(limite) < historiales.count,
          hasPrevPage: parseInt(pagina) > 1
        }
      });

    } catch (error) {
      console.error('Error al obtener historiales del médico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Buscar historial por RFC del paciente
  static async buscarPorRFC(req, res) {
    try {
      const { rfc } = req.params;

      // Solo médicos y admin pueden buscar por RFC
      if (req.usuario.rol !== 'Doctor' && req.usuario.rol !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta búsqueda'
        });
      }

      // Buscar paciente por RFC
      const paciente = await Paciente.buscarPorRFC(rfc.toUpperCase());
      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró paciente con ese RFC'
        });
      }

      // Buscar historiales del paciente
      const historiales = await HistorialClinico.findAll({
        where: { paciente_id: paciente.id },
        include: [
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          }
        ],
        order: [['fecha_consulta', 'DESC']],
        limit: 10
      });

      res.json({
        success: true,
        data: {
          paciente,
          historiales
        }
      });

    } catch (error) {
      console.error('Error al buscar por RFC:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Validar completitud del historial
  static async validarCompletitud(req, res) {
    try {
      const { id } = req.params;

      const historial = await HistorialClinico.findByPk(id);
      if (!historial) {
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      const validacion = historial.validarCompletitud();

      res.json({
        success: true,
        data: validacion
      });

    } catch (error) {
      console.error('Error al validar completitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Cambiar estado del historial
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosPermitidos = ['borrador', 'completo', 'revisado'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      const historial = await HistorialClinico.findByPk(id);
      if (!historial) {
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Verificar permisos
      const esElMedico = historial.doctor_id === req.usuario.id;
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElMedico && !esAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cambiar el estado de este historial'
        });
      }

      await historial.update({
        estado,
        actualizado_por: req.usuario.id
      });

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: { estado: historial.estado }
      });

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar historial (solo admin)
  static async eliminarHistorial(req, res) {
    try {
      const { id } = req.params;

      const historial = await HistorialClinico.findByPk(id);
      if (!historial) {
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Solo admin puede eliminar
      if (req.usuario.rol !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar historiales'
        });
      }

      await historial.destroy();

      res.json({
        success: true,
        message: 'Historial eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de historiales
  static async obtenerEstadisticas(req, res) {
    try {
      // Solo médicos y admin
      if (req.usuario.rol !== 'Doctor' && req.usuario.rol !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver estadísticas'
        });
      }

      const filtros = {};
      if (req.usuario.rol === 'Doctor') {
        filtros.doctor_id = req.usuario.id;
      }

      const [totalHistoriales, porEstado, porMes, pacientesUnicos] = await Promise.all([
        // Total de historiales
        HistorialClinico.count({ where: filtros }),
        
        // Por estado
        HistorialClinico.findAll({
          where: filtros,
          attributes: [
            'estado',
            [HistorialClinico.sequelize.fn('COUNT', HistorialClinico.sequelize.col('id')), 'count']
          ],
          group: ['estado'],
          raw: true
        }),
        
        // Por mes (últimos 6 meses)
        HistorialClinico.findAll({
          where: {
            ...filtros,
            fecha_consulta: {
              [Op.gte]: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
            }
          },
          attributes: [
            [HistorialClinico.sequelize.fn('YEAR', HistorialClinico.sequelize.col('fecha_consulta')), 'año'],
            [HistorialClinico.sequelize.fn('MONTH', HistorialClinico.sequelize.col('fecha_consulta')), 'mes'],
            [HistorialClinico.sequelize.fn('COUNT', HistorialClinico.sequelize.col('id')), 'count']
          ],
          group: [
            HistorialClinico.sequelize.fn('YEAR', HistorialClinico.sequelize.col('fecha_consulta')),
            HistorialClinico.sequelize.fn('MONTH', HistorialClinico.sequelize.col('fecha_consulta'))
          ],
          order: [
            [HistorialClinico.sequelize.fn('YEAR', HistorialClinico.sequelize.col('fecha_consulta')), 'ASC'],
            [HistorialClinico.sequelize.fn('MONTH', HistorialClinico.sequelize.col('fecha_consulta')), 'ASC']
          ],
          raw: true
        }),

        // Pacientes únicos
        HistorialClinico.count({
          where: filtros,
          distinct: true,
          col: 'paciente_id'
        })
      ]);

      res.json({
        success: true,
        data: {
          total: totalHistoriales,
          porEstado,
          porMes,
          pacientesUnicos
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Exportar historial a PDF (preparar datos)
  static async exportarPDF(req, res) {
    try {
      const { id } = req.params;
      
      const historial = await HistorialClinico.findByPk(id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'correo_electronico', 'telefono', 'fecha_nacimiento', 'sexo', 'rfc']
          },
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          }
        ]
      });

      if (!historial) {
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Verificar permisos
      const esElPaciente = historial.paciente_id === req.usuario.paciente_id;
      const esElMedico = historial.doctor_id === req.usuario.id;
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElPaciente && !esElMedico && !esAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para exportar este historial'
        });
      }

      // Preparar datos para PDF
      const datosParaPDF = {
        encabezado: {
          clinica: 'Clínica Dental',
          fecha: new Date().toLocaleDateString('es-MX'),
          folio: historial.id.toString().padStart(8, '0')
        },
        paciente: {
          nombre: `${historial.paciente.nombre} ${historial.paciente.apellido_paterno} ${historial.paciente.apellido_materno || ''}`.trim(),
          edad: historial.paciente.calcularEdad(),
          sexo: historial.paciente.sexo === 'M' ? 'Masculino' : 'Femenino',
          rfc: historial.paciente.rfc,
          telefono: historial.paciente.telefono,
          email: historial.paciente.correo_electronico
        },
        medico: {
          nombre: `Dr(a). ${historial.doctor.nombre} ${historial.doctor.apellido_paterno} ${historial.doctor.apellido_materno || ''}`.trim(),
          especialidad: historial.doctor.especialidad
        },
        resumen: historial.generarResumen(),
        historial: historial.toJSON(),
        metadatos: {
          fechaCreacion: historial.fecha_creacion,
          version: historial.version,
          estado: historial.estado
        }
      };

      res.json({
        success: true,
        data: datosParaPDF,
        message: 'Datos preparados para exportación'
      });

    } catch (error) {
      console.error('Error al exportar historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Duplicar historial (para seguimiento)
  static async duplicarHistorial(req, res) {
    const transaction = await HistorialClinico.sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      const historialOriginal = await HistorialClinico.findByPk(id, { transaction });
      if (!historialOriginal) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Historial clínico no encontrado'
        });
      }

      // Verificar permisos (solo el médico que lo creó o admin)
      const esElMedico = historialOriginal.doctor_id === req.usuario.id;
      const esAdmin = req.usuario.rol === 'Administrador';

      if (!esElMedico && !esAdmin) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para duplicar este historial'
        });
      }

      // Crear copia
      const datosHistorial = historialOriginal.toJSON();
      delete datosHistorial.id;
      delete datosHistorial.fecha_creacion;

      const nuevoHistorial = await HistorialClinico.create({
        ...datosHistorial,
        fecha_consulta: new Date(),
        estado: 'borrador',
        version: 1,
        creado_por: req.usuario.id,
        actualizado_por: req.usuario.id,
        doctor_id: req.usuario.id
      }, { transaction });

      const historialCompleto = await HistorialClinico.findByPk(nuevoHistorial.id, {
        include: [
          {
            model: Paciente,
            as: 'paciente',
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno']
          },
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          }
        ],
        transaction
      });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Historial duplicado exitosamente',
        data: historialCompleto
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al duplicar historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Búsqueda avanzada de historiales
  static async busquedaAvanzada(req, res) {
    try {
      const {
        texto,
        fechaInicio,
        fechaFin,
        estado,
        medicoId,
        pacienteId,
        sexo,
        limite = 10,
        pagina = 1
      } = req.query;

      // Verificar permisos
      if (req.usuario.rol !== 'Doctor' && req.usuario.rol !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar búsquedas avanzadas'
        });
      }

      const whereHistorial = {};
      const wherePaciente = {};
      
      // Filtros de historial
      if (fechaInicio || fechaFin) {
        whereHistorial.fecha_consulta = {};
        if (fechaInicio) whereHistorial.fecha_consulta[Op.gte] = fechaInicio;
        if (fechaFin) whereHistorial.fecha_consulta[Op.lte] = fechaFin;
      }
      
      if (estado) whereHistorial.estado = estado;
      if (medicoId) whereHistorial.doctor_id = parseInt(medicoId);
      if (pacienteId) whereHistorial.paciente_id = parseInt(pacienteId);
      
      // Si es médico, solo sus historiales
      if (req.usuario.rol === 'Doctor') {
        whereHistorial.doctor_id = req.usuario.id;
      }

      // Filtros de paciente
      if (sexo) wherePaciente.sexo = sexo;
      
      // Búsqueda de texto
      if (texto) {
        wherePaciente[Op.or] = [
          { nombre: { [Op.like]: `%${texto}%` } },
          { apellido_paterno: { [Op.like]: `%${texto}%` } },
          { apellido_materno: { [Op.like]: `%${texto}%` } },
          { rfc: { [Op.like]: `%${texto}%` } }
        ];
      }

      const { count, rows } = await HistorialClinico.findAndCountAll({
        where: whereHistorial,
        include: [
          {
            model: Paciente,
            as: 'paciente',
            where: wherePaciente,
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'telefono', 'sexo', 'fecha_nacimiento']
          },
          {
            model: Usuario,
            as: 'doctor',
            attributes: ['nombre', 'apellido_paterno', 'apellido_materno', 'especialidad']
          }
        ],
        order: [['fecha_consulta', 'DESC']],
        limit: parseInt(limite),
        offset: (parseInt(pagina) - 1) * parseInt(limite)
      });

      res.json({
        success: true,
        data: {
          docs: rows,
          totalDocs: count,
          limit: parseInt(limite),
          page: parseInt(pagina),
          totalPages: Math.ceil(count / parseInt(limite)),
          hasNextPage: parseInt(pagina) * parseInt(limite) < count,
          hasPrevPage: parseInt(pagina) > 1
        }
      });

    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = HistorialClinicoController;