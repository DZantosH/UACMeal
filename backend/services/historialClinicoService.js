// services/historialClinicoService.js
const HistorialClinico = require('../models/HistorialClinico');
const Usuario = require('../models/Usuario');

class HistorialClinicoService {
  
  /**
   * Crear un historial clínico completo
   * @param {Object} datosHistorial - Datos del historial
   * @param {String} medicoId - ID del médico
   * @returns {Object} Historial creado
   */
  static async crearHistorialCompleto(datosHistorial, medicoId) {
    try {
      // Validar que el paciente existe
      const paciente = await Usuario.findById(datosHistorial.pacienteId);
      if (!paciente) {
        throw new Error('Paciente no encontrado');
      }

      // Calcular IMC si se proporciona peso y talla
      if (datosHistorial.antecedentes_personales_patologicos?.somatometria) {
        const somatometria = datosHistorial.antecedentes_personales_patologicos.somatometria;
        if (somatometria.peso && somatometria.talla) {
          const peso = parseFloat(somatometria.peso);
          const talla = parseFloat(somatometria.talla) / 100; // convertir cm a metros
          somatometria.imc = (peso / (talla * talla)).toFixed(2);
        }
      }

      // Crear el historial
      const nuevoHistorial = new HistorialClinico({
        ...datosHistorial,
        medicoId,
        creado_por: medicoId,
        actualizado_por: medicoId
      });

      const historialGuardado = await nuevoHistorial.save();
      await historialGuardado.getHistorialCompleto();

      return historialGuardado;

    } catch (error) {
      throw new Error(`Error al crear historial: ${error.message}`);
    }
  }

  /**
   * Validar datos del historial
   * @param {Object} datos - Datos a validar
   * @returns {Object} Resultado de validación
   */
  static validarDatosHistorial(datos) {
    const errores = [];

    // Validaciones básicas
    if (!datos.pacienteId) {
      errores.push('ID del paciente es requerido');
    }

    // Validar ficha de identificación
    if (datos.ficha_identificacion) {
      const ficha = datos.ficha_identificacion;
      
      if (ficha.nombre && ficha.nombre.length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
      }
      
      if (ficha.rfc && !/^[A-Z]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(ficha.rfc)) {
        errores.push('RFC no tiene formato válido');
      }
      
      if (ficha.email && !/\S+@\S+\.\S+/.test(ficha.email)) {
        errores.push('Email no tiene formato válido');
      }

      if (ficha.fechaNacimiento) {
        const fechaNac = new Date(ficha.fechaNacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        
        if (edad < 0 || edad > 120) {
          errores.push('Fecha de nacimiento no válida');
        }
      }
    }

    // Validar escalas numéricas
    if (datos.motivo_consulta?.escalaDolor) {
      const escala = parseInt(datos.motivo_consulta.escalaDolor);
      if (escala < 0 || escala > 10) {
        errores.push('Escala de dolor debe ser entre 0 y 10');
      }
    }

    // Validar signos vitales
    if (datos.antecedentes_personales_patologicos?.signos_vitales) {
      const signos = datos.antecedentes_personales_patologicos.signos_vitales;
      
      if (signos.temperatura) {
        const temp = parseFloat(signos.temperatura);
        if (temp < 30 || temp > 45) {
          errores.push('Temperatura debe estar entre 30 y 45°C');
        }
      }
      
      if (signos.tension_arterial_sistolica) {
        const sistolica = parseInt(signos.tension_arterial_sistolica);
        if (sistolica < 60 || sistolica > 250) {
          errores.push('Tensión sistólica debe estar entre 60 y 250 mmHg');
        }
      }
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Generar resumen del historial
   * @param {Object} historial - Historial clínico
   * @returns {Object} Resumen del historial
   */
  static generarResumenHistorial(historial) {
    const resumen = {
      paciente: {
        nombre: historial.ficha_identificacion?.nombre || 'No especificado',
        apellidos: `${historial.ficha_identificacion?.apellidoPaterno || ''} ${historial.ficha_identificacion?.apellidoMaterno || ''}`.trim(),
        edad: this.calcularEdad(historial.ficha_identificacion?.fechaNacimiento),
        sexo: historial.ficha_identificacion?.sexo || 'No especificado'
      },
      consulta: {
        motivo: historial.motivo_consulta?.motivo || 'No especificado',
        dolor: historial.motivo_consulta?.escalaDolor || 0,
        urgencia: historial.motivo_consulta?.nivelUrgencia || 'No especificado'
      },
      antecedentes: {
        patologicos: this.extraerAntecedentesPrincipal(historial.antecedentes_personales_patologicos),
        familiares: this.extraerAntecedentesFamiliares(historial.antecedentes_heredo_familiares)
      },
      examen: {
        extrabucal: this.extraerHallazgosExtrabucal(historial.examen_extrabucal),
        intrabucal: this.extraerHallazgosIntrabucal(historial.examen_intrabucal)
      },
      diagnostico: historial.auxiliares_diagnostico?.diagnostico_integro?.filter(d => d && d.trim()) || [],
      plan: historial.auxiliares_diagnostico?.plan_tratamiento?.filter(p => p && p.trim()) || []
    };

    return resumen;
  }

  /**
   * Calcular edad basada en fecha de nacimiento
   * @param {Date} fechaNacimiento - Fecha de nacimiento
   * @returns {Number} Edad en años
   */
  static calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  /**
   * Extraer antecedentes patológicos principales
   * @param {Object} antecedentes - Antecedentes patológicos
   * @returns {Array} Lista de antecedentes relevantes
   */
  static extraerAntecedentesPrincipal(antecedentes) {
    if (!antecedentes) return [];
    
    const relevantes = [];
    
    // Padecimientos previos
    if (antecedentes.padecimientos) {
      antecedentes.padecimientos.forEach(pad => {
        if (pad.padecimiento && pad.padecimiento.trim()) {
          relevantes.push(`${pad.padecimiento} (${pad.edad || 'edad no especificada'})`);
        }
      });
    }

    // Problemas con anestesia
    if (antecedentes.anestesia?.problema_anestesia && antecedentes.anestesia.descripcion_problema) {
      relevantes.push(`Problema con anestesia: ${antecedentes.anestesia.descripcion_problema}`);
    }

    return relevantes;
  }

  /**
   * Extraer antecedentes familiares relevantes
   * @param {Object} familiares - Antecedentes familiares
   * @returns {Array} Lista de antecedentes familiares
   */
  static extraerAntecedentesFamiliares(familiares) {
    if (!familiares) return [];
    
    const relevantes = [];
    
    // Enfermedades marcadas como presentes
    if (familiares.enfermedades_relevantes) {
      const enfermedades = familiares.enfermedades_relevantes;
      Object.keys(enfermedades).forEach(key => {
        if (enfermedades[key] === true) {
          relevantes.push(key.replace('_', ' '));
        }
      });
    }

    // Antecedentes específicos por familiar
    if (familiares.antecedentes) {
      familiares.antecedentes.forEach(ant => {
        if (ant.padecimientos && ant.padecimientos.trim() && ant.padecimientos.toLowerCase() !== 'ninguno') {
          relevantes.push(`${ant.parentesco}: ${ant.padecimientos}`);
        }
      });
    }

    return relevantes;
  }

  /**
   * Extraer hallazgos del examen extrabucal
   * @param {Object} examen - Examen extrabucal
   * @returns {Array} Hallazgos relevantes
   */
  static extraerHallazgosExtrabucal(examen) {
    if (!examen) return [];
    
    const hallazgos = [];
    
    // Revisar cada sección del examen
    Object.keys(examen).forEach(seccion => {
      const datos = examen[seccion];
      
      if (typeof datos === 'object' && datos !== null) {
        Object.keys(datos).forEach(campo => {
          if (datos[campo] && datos[campo].trim() && datos[campo].toLowerCase() !== 'normal') {
            hallazgos.push(`${seccion} - ${campo}: ${datos[campo]}`);
          }
        });
      } else if (datos && datos.trim() && datos.toLowerCase() !== 'normal') {
        hallazgos.push(`${seccion}: ${datos}`);
      }
    });

    return hallazgos;
  }

  /**
   * Extraer hallazgos del examen intrabucal
   * @param {Object} examen - Examen intrabucal
   * @returns {Array} Hallazgos relevantes
   */
  static extraerHallazgosIntrabucal(examen) {
    if (!examen) return [];
    
    const hallazgos = [];
    
    // Estructuras intrabucales
    if (examen.estructuras) {
      Object.keys(examen.estructuras).forEach(estructura => {
        const valor = examen.estructuras[estructura];
        if (valor && valor.trim() && valor.toLowerCase() !== 'normal') {
          hallazgos.push(`${estructura}: ${valor}`);
        }
      });
    }

    // Higiene oral
    if (examen.higiene_oral?.indice_placa) {
      hallazgos.push(`Índice de placa: ${examen.higiene_oral.indice_placa}%`);
    }

    // Encías
    if (examen.encias?.alteraciones_gingivales?.length > 0) {
      examen.encias.alteraciones_gingivales.forEach(alt => {
        if (alt.descripcion && alt.descripcion.trim()) {
          hallazgos.push(`Encías ${alt.localizacion || ''}: ${alt.descripcion}`);
        }
      });
    }

    return hallazgos;
  }

  /**
   * Generar reporte estadístico por médico
   * @param {String} medicoId - ID del médico
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @returns {Object} Estadísticas del médico
   */
  static async generarEstadisticasMedico(medicoId, fechaInicio, fechaFin) {
    try {
      const filtros = { medicoId };
      
      if (fechaInicio || fechaFin) {
        filtros.fecha_creacion = {};
        if (fechaInicio) filtros.fecha_creacion.$gte = fechaInicio;
        if (fechaFin) filtros.fecha_creacion.$lte = fechaFin;
      }

      const [
        totalHistoriales,
        historialesPorEstado,
        pacientesUnicos,
        promedioCompletitud
      ] = await Promise.all([
        HistorialClinico.countDocuments(filtros),
        
        HistorialClinico.aggregate([
          { $match: filtros },
          { $group: { _id: '$estado', count: { $sum: 1 } } }
        ]),
        
        HistorialClinico.distinct('pacienteId', filtros).then(arr => arr.length),
        
        this.calcularPromedioCompletitud(filtros)
      ]);

      return {
        totalHistoriales,
        historialesPorEstado,
        pacientesUnicos,
        promedioCompletitud,
        periodo: { fechaInicio, fechaFin }
      };

    } catch (error) {
      throw new Error(`Error al generar estadísticas: ${error.message}`);
    }
  }

  /**
   * Calcular promedio de completitud de historiales
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Number} Promedio de completitud
   */
  static async calcularPromedioCompletitud(filtros) {
    const historiales = await HistorialClinico.find(filtros);
    
    if (historiales.length === 0) return 0;
    
    let sumaCompletitud = 0;
    
    historiales.forEach(historial => {
      const validacion = historial.validarCompletitud();
      // Calcular porcentaje basado en campos completados
      const completitud = validacion.esCompleto ? 100 : this.calcularPorcentajeCompletitud(historial);
      sumaCompletitud += completitud;
    });
    
    return Math.round(sumaCompletitud / historiales.length);
  }

  /**
   * Calcular porcentaje de completitud de un historial
   * @param {Object} historial - Historial clínico
   * @returns {Number} Porcentaje de completitud
   */
  static calcularPorcentajeCompletitud(historial) {
    const secciones = [
      'ficha_identificacion',
      'motivo_consulta',
      'antecedentes_heredo_familiares',
      'antecedentes_personales_no_patologicos',
      'antecedentes_personales_patologicos',
      'examen_extrabucal',
      'examen_intrabucal',
      'auxiliares_diagnostico'
    ];
    
    let seccionesCompletas = 0;
    
    secciones.forEach(seccion => {
      if (this.evaluarCompletitudSeccion(historial[seccion])) {
        seccionesCompletas++;
      }
    });
    
    return Math.round((seccionesCompletas / secciones.length) * 100);
  }

  /**
   * Evaluar si una sección está completa
   * @param {Object} seccion - Sección del historial
   * @returns {Boolean} Si la sección está completa
   */
  static evaluarCompletitudSeccion(seccion) {
    if (!seccion) return false;
    
    // Verificar si tiene al menos algunos campos completados
    const campos = Object.keys(seccion);
    let camposCompletos = 0;
    
    campos.forEach(campo => {
      const valor = seccion[campo];
      if (this.tieneValor(valor)) {
        camposCompletos++;
      }
    });
    
    // Considerar completa si al menos 30% de campos tienen datos
    return camposCompletos > 0 && (camposCompletos / campos.length) >= 0.3;
  }

  /**
   * Verificar si un valor tiene contenido válido
   * @param {Any} valor - Valor a verificar
   * @returns {Boolean} Si tiene valor válido
   */
  static tieneValor(valor) {
    if (valor === null || valor === undefined) return false;
    if (typeof valor === 'string') return valor.trim().length > 0;
    if (typeof valor === 'number') return !isNaN(valor);
    if (typeof valor === 'boolean') return true;
    if (Array.isArray(valor)) return valor.length > 0 && valor.some(item => this.tieneValor(item));
    if (typeof valor === 'object') {
      return Object.values(valor).some(val => this.tieneValor(val));
    }
    return true;
  }

  /**
   * Buscar historiales con criterios avanzados
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Array} Historiales encontrados
   */
  static async busquedaAvanzada(criterios) {
    try {
      const {
        texto,
        fechaInicio,
        fechaFin,
        estado,
        medicoId,
        pacienteId,
        edad,
        sexo,
        limite = 10,
        pagina = 1
      } = criterios;

      // Construir filtros de MongoDB
      const filtros = {};
      
      if (fechaInicio || fechaFin) {
        filtros.fecha_creacion = {};
        if (fechaInicio) filtros.fecha_creacion.$gte = new Date(fechaInicio);
        if (fechaFin) filtros.fecha_creacion.$lte = new Date(fechaFin);
      }
      
      if (estado) filtros.estado = estado;
      if (medicoId) filtros.medicoId = medicoId;
      if (pacienteId) filtros.pacienteId = pacienteId;
      if (sexo) filtros['ficha_identificacion.sexo'] = sexo;
      
      // Búsqueda de texto en múltiples campos
      if (texto) {
        filtros.$or = [
          { 'ficha_identificacion.nombre': { $regex: texto, $options: 'i' } },
          { 'ficha_identificacion.apellidoPaterno': { $regex: texto, $options: 'i' } },
          { 'ficha_identificacion.apellidoMaterno': { $regex: texto, $options: 'i' } },
          { 'ficha_identificacion.rfc': { $regex: texto, $options: 'i' } },
          { 'motivo_consulta.motivo': { $regex: texto, $options: 'i' } }
        ];
      }

      const opciones = {
        page: parseInt(pagina),
        limit: parseInt(limite),
        sort: { fecha_creacion: -1 },
        populate: [
          { path: 'pacienteId', select: 'nombre apellidoPaterno apellidoMaterno' },
          { path: 'medicoId', select: 'nombre apellidoPaterno apellidoMaterno especialidad' }
        ]
      };

      const resultados = await HistorialClinico.paginate(filtros, opciones);
      
      // Filtrar por edad si se especifica
      if (edad) {
        resultados.docs = resultados.docs.filter(historial => {
          const edadPaciente = this.calcularEdad(historial.ficha_identificacion?.fechaNacimiento);
          return edadPaciente === parseInt(edad);
        });
      }

      return resultados;

    } catch (error) {
      throw new Error(`Error en búsqueda avanzada: ${error.message}`);
    }
  }

  /**
   * Exportar datos del historial para PDF
   * @param {String} historialId - ID del historial
   * @returns {Object} Datos formateados para PDF
   */
  static async prepararDatosParaPDF(historialId) {
    try {
      const historial = await HistorialClinico.findById(historialId)
        .populate('pacienteId', 'nombre apellidoPaterno apellidoMaterno email telefono')
        .populate('medicoId', 'nombre apellidoPaterno apellidoMaterno especialidad cedula');

      if (!historial) {
        throw new Error('Historial no encontrado');
      }

      return {
        encabezado: {
          clinica: 'Clínica Dental',
          fecha: new Date().toLocaleDateString('es-MX'),
          folio: historial._id.toString().slice(-8).toUpperCase()
        },
        paciente: {
          nombre: `${historial.ficha_identificacion?.nombre || ''} ${historial.ficha_identificacion?.apellidoPaterno || ''} ${historial.ficha_identificacion?.apellidoMaterno || ''}`.trim(),
          edad: this.calcularEdad(historial.ficha_identificacion?.fechaNacimiento),
          sexo: historial.ficha_identificacion?.sexo,
          rfc: historial.ficha_identificacion?.rfc,
          telefono: historial.ficha_identificacion?.telefono,
          email: historial.ficha_identificacion?.email
        },
        medico: {
          nombre: `Dr(a). ${historial.medicoId?.nombre || ''} ${historial.medicoId?.apellidoPaterno || ''} ${historial.medicoId?.apellidoMaterno || ''}`.trim(),
          especialidad: historial.medicoId?.especialidad,
          cedula: historial.medicoId?.cedula
        },
        resumen: this.generarResumenHistorial(historial),
        historial: historial.toObject(),
        metadatos: {
          fechaCreacion: historial.fecha_creacion,
          version: historial.version,
          estado: historial.estado
        }
      };

    } catch (error) {
      throw new Error(`Error al preparar datos para PDF: ${error.message}`);
    }
  }
}

module.exports = HistorialClinicoService;