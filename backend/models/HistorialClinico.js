// models/HistorialClinico.js
const mongoose = require('mongoose');

// Esquema para Ficha de Identificación
const fichaIdentificacionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellidoPaterno: { type: String, required: true },
  apellidoMaterno: { type: String, required: true },
  sexo: { type: String, required: true, enum: ['Masculino', 'Femenino', 'Otro'] },
  fechaNacimiento: { type: Date, required: true },
  rfc: { type: String, required: true },
  telefono: { type: String, required: true },
  email: { type: String, required: true }
});

// Esquema para Motivo de Consulta
const motivoConsultaSchema = new mongoose.Schema({
  motivo: { type: String, required: true },
  escalaDolor: { type: Number, min: 0, max: 10, default: 0 },
  nivelUrgencia: { type: String, enum: ['baja', 'media', 'alta', 'urgente'] },
  duracionSintomas: { type: String },
  tratamientoPrevio: { type: String }
});

// Esquema para Antecedentes Heredo-Familiares
const antecedentesFamiliarSchema = new mongoose.Schema({
  parentesco: String,
  padecimientos: String,
  edad: String,
  vivo: { type: Boolean, default: true }
});

const antecedentesHeredoFamiliaresSchema = new mongoose.Schema({
  antecedentes: [antecedentesFamiliarSchema],
  enfermedades_relevantes: {
    diabetes: { type: Boolean, default: false },
    hipertension: { type: Boolean, default: false },
    cardiopatias: { type: Boolean, default: false },
    cancer: { type: Boolean, default: false },
    enfermedades_mentales: { type: Boolean, default: false },
    malformaciones_congenitas: { type: Boolean, default: false },
    enfermedades_autoinmunes: { type: Boolean, default: false },
    alergias: { type: Boolean, default: false },
    otras: String
  }
});

// Esquema para Antecedentes Personales No Patológicos
const antecedentesPersonalesNoPatologicosSchema = new mongoose.Schema({
  servicios_publicos: {
    drenaje: Boolean,
    agua: Boolean,
    luz: Boolean,
    telefono: Boolean,
    otros: String
  },
  vivienda: {
    tipo: String,
    riesgos_ambientales: String,
    convivencia_mascotas: String
  },
  higiene: {
    general: String,
    bucal: String
  },
  alimentarios: {
    comidas_por_dia: String,
    cantidad_agua: String,
    desayuno: String,
    comida: String,
    cena: String,
    entre_comidas: String,
    riesgos: {
      cardiovascular: { type: Boolean, default: false },
      litiasis_renal: { type: Boolean, default: false },
      colesterol_trigliceridos: { type: Boolean, default: false },
      desnutricion: { type: Boolean, default: false },
      obesidad: { type: Boolean, default: false },
      caries: { type: Boolean, default: false },
      periodontitis: { type: Boolean, default: false }
    }
  },
  habitos_perniciosos: {
    alcoholismo: {
      tiene: { type: Boolean, default: false },
      frecuencia: String,
      cantidad: String,
      tipo: String
    },
    tabaquismo: {
      tiene: { type: Boolean, default: false },
      frecuencia: String,
      cantidad: String,
      tipo: String
    },
    otras_adicciones: {
      tiene: { type: Boolean, default: false },
      descripcion: String
    },
    habitos_orales: {
      onicofagia: { type: Boolean, default: false },
      succion_digital: { type: Boolean, default: false },
      morder_objetos: { type: Boolean, default: false },
      bricomania: { type: Boolean, default: false },
      bruxismo: { type: Boolean, default: false },
      respirador_bucal: { type: Boolean, default: false },
      otros: String
    }
  },
  antecedentes_medicos: {
    inmunizaciones: String,
    hospitalizaciones: String,
    fracturas: String,
    tipo_sangre: { type: String, enum: ['A', 'B', 'AB', 'O'] },
    factor_rh: { type: String, enum: ['Positivo', 'Negativo'] },
    transfusiones_fecha: String,
    transfusiones_motivo: String
  },
  antecedentes_sexuales: {
    vida_sexual_activa: Boolean,
    numero_parejas: String,
    orientacion_sexual: String,
    metodo_proteccion: String
  },
  antecedentes_gineco: {
    edad_menarca: String,
    periodos_regulares: Boolean,
    sangrados_abundantes: Boolean,
    metodo_anticonceptivo: Boolean,
    cual_anticonceptivo: String,
    embarazos: String,
    abortos: String,
    edad_menopausia: String,
    fecha_ultima_menstruacion: Date
  },
  padecimiento_actual: String
});

// Esquema para Antecedentes Personales Patológicos
const padecimientoSchema = new mongoose.Schema({
  padecimiento: String,
  edad: String,
  control_medico: String,
  complicaciones: String
});

const antecedentesPersonalesPatologicosSchema = new mongoose.Schema({
  padecimientos: [padecimientoSchema],
  anestesia: {
    ha_recibido: Boolean,
    problema_anestesia: Boolean,
    descripcion_problema: String
  },
  antecedentes_sistemicos: {
    nutricionales: String,
    infecciosos: String,
    hemorragicos: String,
    alergicos: String,
    padecimientos_nombres: String
  },
  habitus_exterior: String,
  somatometria: {
    peso: String,
    talla: String,
    imc: String
  },
  signos_vitales: {
    temperatura: String,
    tension_arterial_sistolica: String,
    tension_arterial_diastolica: String,
    frecuencia_respiratoria: String,
    frecuencia_cardiaca: String,
    pulso: String
  }
});

// Esquema para Examen Extrabucal
const examenExtrabucalSchema = new mongoose.Schema({
  cabeza: {
    craneo: String,
    biotipo_facial: String,
    perfil: String
  },
  cadenas_ganglionares: {
    cervicales_anteriores: String,
    cervicales_posteriores: String,
    occipitales: String,
    periauriculares: String,
    parotideos: String,
    submentonianas: String,
    submandibulares: String
  },
  tiroides: String,
  musculos_cuello: {
    esternocleidomastoideo: String,
    subclavio: String,
    trapecios: String
  },
  atm: {
    alteracion: String,
    apertura_maxima: String,
    lateralidad_derecha: String,
    lateralidad_izquierda: String,
    masticacion_bilateral: Boolean,
    descripcion_masticacion: String
  },
  musculos_faciales: {
    masetero: String,
    temporal: String,
    borla_menton: String,
    orbicular_labios: String,
    risorio_santorini: String
  },
  piel: {
    color: String,
    integridad: String,
    pigmentaciones: String,
    nevos: String
  },
  estructuras_faciales: {
    frente: String,
    cejas: String,
    ojos: String,
    nariz: String,
    orejas: String,
    labios: String
  }
});

// Esquema para Examen Intrabucal
const examenIntrabucalSchema = new mongoose.Schema({
  estructuras: {
    labios: String,
    carrillos: String,
    musculos_pterigoideo_interno: String,
    musculos_pterigoideo_externo: String,
    glandulas_salivales: String,
    frenillos: String,
    istmo_fauces: String,
    paladar: String,
    lengua: String,
    piso_boca: String,
    arco_mandibular: String
  },
  higiene_oral: {
    indice_placa: String,
    localizacion_placa: String,
    observaciones_higiene: String,
    superficies_con_placa: mongoose.Schema.Types.Mixed
  },
  encias: {
    alteraciones_gingivales: [{
      localizacion: String,
      descripcion: String
    }],
    descripcion_general: String
  },
  oclusion: {
    molar_derecho: String,
    molar_izquierdo: String,
    canino_derecho: String,
    canino_izquierdo: String,
    arco_superior_amplitud: String,
    arco_superior_boveda: String,
    arco_superior_plana: String,
    arco_inferior_amplitud: String,
    antero_posterior_derecho: String,
    antero_posterior_izquierdo: String,
    buco_lingual_derecho: String,
    buco_lingual_izquierdo: String,
    relaciones_dentales: {
      sobre_mordida_vertical: String,
      sobre_mordida_horizontal: String,
      borde_a_borde: String,
      mordida_abierta: String,
      mordida_cruzada_anterior: String,
      mordida_cruzada_posterior: String,
      linea_media_maxilar: String,
      linea_media_mandibular: String,
      diastemas: String,
      apiñamiento: String,
      facetas_desgaste: String
    }
  },
  alteraciones_dentales: {
    descripcion_general: String,
    dientes_afectados: String,
    alteraciones_especificas: [String]
  },
  examen_dental: {
    dientes_presentes: mongoose.Schema.Types.Mixed,
    dientes_ausentes: mongoose.Schema.Types.Mixed,
    restauraciones: mongoose.Schema.Types.Mixed,
    caries: mongoose.Schema.Types.Mixed,
    observaciones_generales: String
  },
  periodontograma: {
    profundidad_sondaje: mongoose.Schema.Types.Mixed,
    sangrado_sondaje: mongoose.Schema.Types.Mixed,
    supuracion: mongoose.Schema.Types.Mixed,
    movilidad: mongoose.Schema.Types.Mixed,
    furca: mongoose.Schema.Types.Mixed,
    observaciones: String
  }
});

// Esquema para Auxiliares de Diagnóstico
const auxiliaresDiagnosticoSchema = new mongoose.Schema({
  modelos_estudio: {
    hallazgos: [String]
  },
  radiografias_intraorales: [{
    region: String,
    hallazgos: String
  }],
  radiografias_extraorales: [{
    tipo: String,
    hallazgos: String
  }],
  examenes_laboratorio: {
    biometria_hematica: String,
    quimica_sanguinea: String,
    general_orina: String,
    pruebas_sanguineas_coagulacion: String,
    cultivo_antibiograma: String,
    otros: String
  },
  diagnostico_integro: [String],
  pronostico: [String],
  plan_tratamiento: [String]
});

// Esquema principal del Historial Clínico
const historialClinicoSchema = new mongoose.Schema({
  pacienteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  medicoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  
  // Secciones del historial
  ficha_identificacion: fichaIdentificacionSchema,
  motivo_consulta: motivoConsultaSchema,
  antecedentes_heredo_familiares: antecedentesHeredoFamiliaresSchema,
  antecedentes_personales_no_patologicos: antecedentesPersonalesNoPatologicosSchema,
  antecedentes_personales_patologicos: antecedentesPersonalesPatologicosSchema,
  examen_extrabucal: examenExtrabucalSchema,
  examen_intrabucal: examenIntrabucalSchema,
  auxiliares_diagnostico: auxiliaresDiagnosticoSchema,
  
  // Metadatos
  fecha_creacion: { type: Date, default: Date.now },
  fecha_actualizacion: { type: Date, default: Date.now },
  estado: { 
    type: String, 
    enum: ['borrador', 'completo', 'revisado'], 
    default: 'borrador' 
  },
  version: { type: Number, default: 1 },
  
  // Campos de auditoría
  creado_por: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario' 
  },
  actualizado_por: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario' 
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
historialClinicoSchema.index({ pacienteId: 1, fecha_creacion: -1 });
historialClinicoSchema.index({ medicoId: 1, fecha_creacion: -1 });
historialClinicoSchema.index({ 'ficha_identificacion.rfc': 1 });
historialClinicoSchema.index({ estado: 1 });

// Middleware para actualizar fecha de modificación
historialClinicoSchema.pre('save', function(next) {
  this.fecha_actualizacion = new Date();
  next();
});

// Método para obtener historial completo con información de paciente y médico
historialClinicoSchema.methods.getHistorialCompleto = function() {
  return this.populate([
    {
      path: 'pacienteId',
      select: 'nombre apellidoPaterno apellidoMaterno email telefono'
    },
    {
      path: 'medicoId',
      select: 'nombre apellidoPaterno apellidoMaterno especialidad'
    }
  ]);
};

// Método para validar completitud del historial
historialClinicoSchema.methods.validarCompletitud = function() {
  const campos_obligatorios = [
    'ficha_identificacion.nombre',
    'ficha_identificacion.apellidoPaterno',
    'ficha_identificacion.apellidoMaterno',
    'motivo_consulta.motivo'
  ];
  
  const errores = [];
  
  campos_obligatorios.forEach(campo => {
    const valor = campo.split('.').reduce((obj, key) => obj && obj[key], this);
    if (!valor || valor.trim() === '') {
      errores.push(`El campo ${campo} es obligatorio`);
    }
  });
  
  return {
    esCompleto: errores.length === 0,
    errores: errores
  };
};

// Método estático para buscar por RFC
historialClinicoSchema.statics.buscarPorRFC = function(rfc) {
  return this.findOne({ 'ficha_identificacion.rfc': rfc });
};

// Método estático para obtener historiales de un paciente
historialClinicoSchema.statics.obtenerHistorialesPaciente = function(pacienteId) {
  return this.find({ pacienteId })
    .sort({ fecha_creacion: -1 })
    .populate('medicoId', 'nombre apellidoPaterno apellidoMaterno especialidad');
};

module.exports = mongoose.model('HistorialClinico', historialClinicoSchema);