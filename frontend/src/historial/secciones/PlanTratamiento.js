import React, { useState, useEffect } from 'react';

const PlanTratamiento = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    plan_general: '',
    fases_tratamiento: {
      fase_sistematica: [],
      fase_correctiva: [],
      fase_mantenimiento: []
    },
    programa_tratamiento: [],
    alternativas_tratamiento: [],
    consideraciones_especiales: '',
    estimacion_costos: {
      costo_total_estimado: '',
      forma_pago: '',
      observaciones_costo: ''
    },
    cronograma: {
      duracion_estimada: '',
      numero_citas_estimadas: '',
      frecuencia_citas: '',
      observaciones_cronograma: ''
    },
    consentimiento_informado: {
      explicacion_tratamiento: '',
      riesgos_beneficios: '',
      alternativas_explicadas: '',
      fecha_consentimiento: '',
      acepta_tratamiento: false
    }
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData(prevData => ({ ...prevData, ...data }));
    }
  }, [data]);

  const handleChange = (section, field, value) => {
    const newFormData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(newFormData);
    onUpdate(newFormData);
  };

  const handleDirectChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    onUpdate(newFormData);
  };

  const handleArrayChange = (section, subsection, index, newItem) => {
    const currentArray = formData[section][subsection] || [];
    const newArray = [...currentArray];
    
    if (index >= 0) {
      newArray[index] = newItem;
    } else {
      newArray.push(newItem);
    }
    
    handleChange(section, subsection, newArray);
  };

  const handleSimpleArrayChange = (field, index, newItem) => {
    const currentArray = formData[field] || [];
    const newArray = [...currentArray];
    
    if (index >= 0) {
      newArray[index] = newItem;
    } else {
      newArray.push(newItem);
    }
    
    handleDirectChange(field, newArray);
  };

  const removeArrayItem = (section, subsection, index) => {
    const currentArray = formData[section][subsection] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleChange(section, subsection, newArray);
  };

  const removeSimpleArrayItem = (field, index) => {
    const currentArray = formData[field] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleDirectChange(field, newArray);
  };

  const especialidades = [
    'Operatoria Dental',
    'Endodoncia', 
    'Periodoncia',
    'Cirugía Bucal',
    'Prótesis Fija',
    'Prótesis Removible',
    'Ortodoncia',
    'Odontopediatría',
    'Prevención',
    'Otro'
  ];

  const prioridadesTratamiento = [
    'Urgente',
    'Alta',
    'Media', 
    'Baja'
  ];

  return (
    <div className="plan-tratamiento">
      <div className="form-section">
        <h4>Plan de Tratamiento General</h4>
        <div className="form-group">
          <label htmlFor="plan_general">Descripción General del Plan de Tratamiento</label>
          <textarea
            id="plan_general"
            value={formData.plan_general}
            onChange={(e) => handleDirectChange('plan_general', e.target.value)}
            placeholder="Descripción general del plan de tratamiento, objetivos principales, enfoque terapéutico..."
            rows="6"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Fases del Tratamiento</h4>
        
        <div className="fases-container">
          <div className="fase-section">
            <h5>Fase Sistemática (Urgencias y Control de Infección)</h5>
            <div className="procedimientos-list">
              {(formData.fases_tratamiento.fase_sistematica || []).map((procedimiento, index) => (
                <div key={index} className="procedimiento-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Procedimiento</label>
                      <input
                        type="text"
                        value={procedimiento.descripcion || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_sistematica', index, {
                          ...procedimiento,
                          descripcion: e.target.value
                        })}
                        placeholder="Ej: Control de dolor, tratamiento de urgencias..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Diente/Región</label>
                      <input
                        type="text"
                        value={procedimiento.diente || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_sistematica', index, {
                          ...procedimiento,
                          diente: e.target.value
                        })}
                        placeholder="Ej: 16, Sector anterior..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Prioridad</label>
                      <select
                        value={procedimiento.prioridad || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_sistematica', index, {
                          ...procedimiento,
                          prioridad: e.target.value
                        })}
                      >
                        <option value="">Seleccionar</option>
                        {prioridadesTratamiento.map((prioridad) => (
                          <option key={prioridad} value={prioridad}>{prioridad}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeArrayItem('fases_tratamiento', 'fase_sistematica', index)}
                      className="btn-remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => handleArrayChange('fases_tratamiento', 'fase_sistematica', -1, {
                  descripcion: '',
                  diente: '',
                  prioridad: ''
                })}
                className="btn-add-small"
              >
                + Agregar Procedimiento
              </button>
            </div>
          </div>

          <div className="fase-section">
            <h5>Fase Correctiva (Tratamiento Definitivo)</h5>
            <div className="procedimientos-list">
              {(formData.fases_tratamiento.fase_correctiva || []).map((procedimiento, index) => (
                <div key={index} className="procedimiento-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Procedimiento</label>
                      <input
                        type="text"
                        value={procedimiento.descripcion || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_correctiva', index, {
                          ...procedimiento,
                          descripcion: e.target.value
                        })}
                        placeholder="Ej: Restauración, endodoncia, prótesis..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Diente/Región</label>
                      <input
                        type="text"
                        value={procedimiento.diente || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_correctiva', index, {
                          ...procedimiento,
                          diente: e.target.value
                        })}
                        placeholder="Ej: 16, Sector anterior..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Especialidad</label>
                      <select
                        value={procedimiento.especialidad || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_correctiva', index, {
                          ...procedimiento,
                          especialidad: e.target.value
                        })}
                      >
                        <option value="">Seleccionar</option>
                        {especialidades.map((especialidad) => (
                          <option key={especialidad} value={especialidad}>{especialidad}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeArrayItem('fases_tratamiento', 'fase_correctiva', index)}
                      className="btn-remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => handleArrayChange('fases_tratamiento', 'fase_correctiva', -1, {
                  descripcion: '',
                  diente: '',
                  especialidad: ''
                })}
                className="btn-add-small"
              >
                + Agregar Procedimiento
              </button>
            </div>
          </div>

          <div className="fase-section">
            <h5>Fase de Mantenimiento</h5>
            <div className="procedimientos-list">
              {(formData.fases_tratamiento.fase_mantenimiento || []).map((procedimiento, index) => (
                <div key={index} className="procedimiento-item">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Procedimiento</label>
                      <input
                        type="text"
                        value={procedimiento.descripcion || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_mantenimiento', index, {
                          ...procedimiento,
                          descripcion: e.target.value
                        })}
                        placeholder="Ej: Control periódico, profilaxis, revisiones..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Frecuencia</label>
                      <input
                        type="text"
                        value={procedimiento.frecuencia || ''}
                        onChange={(e) => handleArrayChange('fases_tratamiento', 'fase_mantenimiento', index, {
                          ...procedimiento,
                          frecuencia: e.target.value
                        })}
                        placeholder="Ej: Cada 6 meses, anual..."
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeArrayItem('fases_tratamiento', 'fase_mantenimiento', index)}
                      className="btn-remove"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => handleArrayChange('fases_tratamiento', 'fase_mantenimiento', -1, {
                  descripcion: '',
                  frecuencia: ''
                })}
                className="btn-add-small"
              >
                + Agregar Procedimiento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Programa de Tratamiento Detallado</h4>
        
        <div className="programa-table">
          <div className="table-header">
            <span>No. Cita</span>
            <span>Procedimiento</span>
            <span>Instrumental y Material</span>
            <span>Costo</span>
            <span>Acciones</span>
          </div>
          
          <div className="table-body">
            {(formData.programa_tratamiento || []).map((cita, index) => (
              <div key={index} className="table-row">
                <div className="form-group">
                  <input
                    type="number"
                    value={cita.numero_cita || ''}
                    onChange={(e) => handleSimpleArrayChange('programa_tratamiento', index, {
                      ...cita,
                      numero_cita: e.target.value
                    })}
                    placeholder="#"
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <textarea
                    value={cita.procedimiento || ''}
                    onChange={(e) => handleSimpleArrayChange('programa_tratamiento', index, {
                      ...cita,
                      procedimiento: e.target.value
                    })}
                    placeholder="Descripción del procedimiento..."
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <textarea
                    value={cita.instrumental_material || ''}
                    onChange={(e) => handleSimpleArrayChange('programa_tratamiento', index, {
                      ...cita,
                      instrumental_material: e.target.value
                    })}
                    placeholder="Instrumental y materiales necesarios..."
                    rows="2"
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="number"
                    value={cita.costo || ''}
                    onChange={(e) => handleSimpleArrayChange('programa_tratamiento', index, {
                      ...cita,
                      costo: e.target.value
                    })}
                    placeholder="$0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <button
                    type="button"
                    onClick={() => removeSimpleArrayItem('programa_tratamiento', index)}
                    className="btn-remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => handleSimpleArrayChange('programa_tratamiento', -1, {
              numero_cita: '',
              procedimiento: '',
              instrumental_material: '',
              costo: ''
            })}
            className="btn-add"
          >
            + Agregar Cita al Programa
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4>Estimación de Costos</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="costo_total_estimado">Costo Total Estimado</label>
            <input
              type="number"
              id="costo_total_estimado"
              value={formData.estimacion_costos.costo_total_estimado}
              onChange={(e) => handleChange('estimacion_costos', 'costo_total_estimado', e.target.value)}
              placeholder="$0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="forma_pago">Forma de Pago</label>
            <select
              id="forma_pago"
              value={formData.estimacion_costos.forma_pago}
              onChange={(e) => handleChange('estimacion_costos', 'forma_pago', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Contado">Contado</option>
              <option value="Financiado">Financiado</option>
              <option value="Por etapas">Por etapas</option>
              <option value="Seguro médico">Seguro médico</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="observaciones_costo">Observaciones sobre Costos</label>
          <textarea
            id="observaciones_costo"
            value={formData.estimacion_costos.observaciones_costo}
            onChange={(e) => handleChange('estimacion_costos', 'observaciones_costo', e.target.value)}
            placeholder="Detalles sobre el costo, descuentos, planes de pago..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Consentimiento Informado</h4>
        
        <div className="form-group">
          <label htmlFor="explicacion_tratamiento">Explicación del Tratamiento al Paciente</label>
          <textarea
            id="explicacion_tratamiento"
            value={formData.consentimiento_informado.explicacion_tratamiento}
            onChange={(e) => handleChange('consentimiento_informado', 'explicacion_tratamiento', e.target.value)}
            placeholder="Resumen de la explicación dada al paciente sobre el tratamiento propuesto..."
            rows="4"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha_consentimiento">Fecha del Consentimiento</label>
            <input
              type="date"
              id="fecha_consentimiento"
              value={formData.consentimiento_informado.fecha_consentimiento}
              onChange={(e) => handleChange('consentimiento_informado', 'fecha_consentimiento', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="acepta_tratamiento"
                checked={formData.consentimiento_informado.acepta_tratamiento}
                onChange={(e) => handleChange('consentimiento_informado', 'acepta_tratamiento', e.target.checked)}
              />
              <label htmlFor="acepta_tratamiento">El paciente acepta el tratamiento propuesto</label>
            </div>
          </div>
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> El plan de tratamiento debe ser individualizado, basado en evidencia científica y ajustado a las necesidades, expectativas y posibilidades del paciente.</p>
      </div>
    </div>
  );
};

export default PlanTratamiento;