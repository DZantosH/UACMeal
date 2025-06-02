import React, { useState, useEffect } from 'react';

const DiagnosticoPronostico = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Diagnóstico integral
    diagnostico_integral: '',
    
    // Diagnósticos específicos por especialidad
    diagnosticos_especificos: {
      operatoria: [],
      endodoncia: [],
      periodoncia: [],
      cirugia: [],
      protesis: [],
      ortodoncia: [],
      odontopediatria: [],
      patologia_oral: []
    },
    
    // Diagnóstico diferencial
    diagnostico_diferencial: '',
    
    // Pronóstico
    pronostico: {
      general: '',
      individual_por_diente: [],
      factores_pronostico: {
        edad_paciente: '',
        estado_salud_general: '',
        higiene_oral: '',
        cooperacion_paciente: '',
        factores_economicos: '',
        complejidad_caso: ''
      },
      clasificacion_pronostico: ''
    },
    
    // Lista de problemas prioritarios
    problemas_prioritarios: [],
    
    // Interconsultas necesarias
    interconsultas: [],
    
    // Observaciones adicionales
    observaciones_adicionales: ''
  });

  useEffect(() => {
  if (data && Object.keys(data).length > 0) {
    setFormData(prevData => ({ ...prevData, ...data })); // ✅ Usa función updater
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
    { key: 'operatoria', name: 'Operatoria Dental' },
    { key: 'endodoncia', name: 'Endodoncia' },
    { key: 'periodoncia', name: 'Periodoncia' },
    { key: 'cirugia', name: 'Cirugía Bucal' },
    { key: 'protesis', name: 'Prótesis' },
    { key: 'ortodoncia', name: 'Ortodoncia' },
    { key: 'odontopediatria', name: 'Odontopediatría' },
    { key: 'patologia_oral', name: 'Patología Oral' }
  ];

  const clasificacionesPronostico = [
    'Excelente',
    'Bueno',
    'Regular',
    'Reservado',
    'Malo'
  ];

  const tiposInterconsulta = [
    'Medicina Interna',
    'Cardiología',
    'Endocrinología',
    'Hematología',
    'Neurología',
    'Psiquiatría',
    'Dermatología',
    'Otorrinolaringología',
    'Anestesiología',
    'Cirugía Maxilofacial',
    'Otro'
  ];

  return (
    <div className="diagnostico-pronostico">
      <div className="form-section">
        <h4>Diagnóstico Integral</h4>
        <div className="form-group">
          <label htmlFor="diagnostico_integral">Diagnóstico Integral</label>
          <textarea
            id="diagnostico_integral"
            value={formData.diagnostico_integral}
            onChange={(e) => handleDirectChange('diagnostico_integral', e.target.value)}
            placeholder="Descripción completa del diagnóstico integral del paciente, considerando todos los hallazgos clínicos, radiográficos y de laboratorio..."
            rows="6"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Diagnósticos Específicos por Especialidad</h4>
        
        <div className="especialidades-container">
          {especialidades.map((especialidad) => (
            <div key={especialidad.key} className="especialidad-section">
              <h5>{especialidad.name}</h5>
              
              <div className="diagnosticos-list">
                {(formData.diagnosticos_especificos[especialidad.key] || []).map((diagnostico, index) => (
                  <div key={index} className="diagnostico-item">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Diente/Región</label>
                        <input
                          type="text"
                          value={diagnostico.diente || ''}
                          onChange={(e) => handleArrayChange('diagnosticos_especificos', especialidad.key, index, {
                            ...diagnostico,
                            diente: e.target.value
                          })}
                          placeholder="Ej: 16, Sector anterior, etc."
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Diagnóstico</label>
                        <input
                          type="text"
                          value={diagnostico.diagnostico || ''}
                          onChange={(e) => handleArrayChange('diagnosticos_especificos', especialidad.key, index, {
                            ...diagnostico,
                            diagnostico: e.target.value
                          })}
                          placeholder="Diagnóstico específico..."
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeArrayItem('diagnosticos_especificos', especialidad.key, index)}
                        className="btn-remove"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label>Observaciones</label>
                      <textarea
                        value={diagnostico.observaciones || ''}
                        onChange={(e) => handleArrayChange('diagnosticos_especificos', especialidad.key, index, {
                          ...diagnostico,
                          observaciones: e.target.value
                        })}
                        placeholder="Detalles adicionales del diagnóstico..."
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => handleArrayChange('diagnosticos_especificos', especialidad.key, -1, {
                    diente: '',
                    diagnostico: '',
                    observaciones: ''
                  })}
                  className="btn-add-small"
                >
                  + Agregar Diagnóstico
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>Diagnóstico Diferencial</h4>
        <div className="form-group">
          <label htmlFor="diagnostico_diferencial">Diagnóstico Diferencial</label>
          <textarea
            id="diagnostico_diferencial"
            value={formData.diagnostico_diferencial}
            onChange={(e) => handleDirectChange('diagnostico_diferencial', e.target.value)}
            placeholder="Diagnósticos alternativos considerados y razones para descartarlos..."
            rows="4"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Pronóstico</h4>
        
        <div className="form-group">
          <label htmlFor="pronostico_general">Pronóstico General</label>
          <textarea
            id="pronostico_general"
            value={formData.pronostico.general}
            onChange={(e) => handleChange('pronostico', 'general', e.target.value)}
            placeholder="Evaluación general del pronóstico del caso..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="clasificacion_pronostico">Clasificación del Pronóstico</label>
          <select
            id="clasificacion_pronostico"
            value={formData.pronostico.clasificacion_pronostico}
            onChange={(e) => handleChange('pronostico', 'clasificacion_pronostico', e.target.value)}
          >
            <option value="">Seleccionar clasificación</option>
            {clasificacionesPronostico.map((clasificacion) => (
              <option key={clasificacion} value={clasificacion}>{clasificacion}</option>
            ))}
          </select>
        </div>

        <div className="factores-pronostico">
          <h5>Factores que Afectan el Pronóstico</h5>
          
          <div className="factores-grid">
            <div className="form-group">
              <label htmlFor="edad_paciente">Edad del Paciente</label>
              <select
                id="edad_paciente"
                value={formData.pronostico.factores_pronostico.edad_paciente}
                onChange={(e) => handleChange('pronostico', 'factores_pronostico', {
                  ...formData.pronostico.factores_pronostico,
                  edad_paciente: e.target.value
                })}
              >
                <option value="">Seleccionar</option>
                <option value="Favorable">Favorable</option>
                <option value="Neutro">Neutro</option>
                <option value="Desfavorable">Desfavorable</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado_salud_general">Estado de Salud General</label>
              <select
                id="estado_salud_general"
                value={formData.pronostico.factores_pronostico.estado_salud_general}
                onChange={(e) => handleChange('pronostico', 'factores_pronostico', {
                  ...formData.pronostico.factores_pronostico,
                  estado_salud_general: e.target.value
                })}
              >
                <option value="">Seleccionar</option>
                <option value="Favorable">Favorable</option>
                <option value="Neutro">Neutro</option>
                <option value="Desfavorable">Desfavorable</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="higiene_oral">Higiene Oral</label>
              <select
                id="higiene_oral"
                value={formData.pronostico.factores_pronostico.higiene_oral}
                onChange={(e) => handleChange('pronostico', 'factores_pronostico', {
                  ...formData.pronostico.factores_pronostico,
                  higiene_oral: e.target.value
                })}
              >
                <option value="">Seleccionar</option>
                <option value="Favorable">Favorable</option>
                <option value="Neutro">Neutro</option>
                <option value="Desfavorable">Desfavorable</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cooperacion_paciente">Cooperación del Paciente</label>
              <select
                id="cooperacion_paciente"
                value={formData.pronostico.factores_pronostico.cooperacion_paciente}
                onChange={(e) => handleChange('pronostico', 'factores_pronostico', {
                  ...formData.pronostico.factores_pronostico,
                  cooperacion_paciente: e.target.value
                })}
              >
                <option value="">Seleccionar</option>
                <option value="Favorable">Favorable</option>
                <option value="Neutro">Neutro</option>
                <option value="Desfavorable">Desfavorable</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="factores_economicos">Factores Económicos</label>
              <select
                id="factores_economicos"
                value={formData.pronostico.factores_pronostico.factores_economicos}
                onChange={(e) => handleChange('pronostico', 'factores_pronostico', {
                  ...formData.pronostico.factores_pronostico,
                  factores_economicos: e.target.value
                })}
              >
                <option value="">Seleccionar</option>
                <option value="Favorable">Favorable</option>
                <option value="Neutro">Neutro</option>
                <option value="Desfavorable">Desfavorable</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="complejidad_caso">Complejidad del Caso</label>
              <select
                id="complejidad_caso"
                value={formData.pronostico.factores_pronostico.complejidad_caso}
                onChange={(e) => handleChange('pronostico', 'factores_pronostico', {
                  ...formData.pronostico.factores_pronostico,
                  complejidad_caso: e.target.value
                })}
              >
                <option value="">Seleccionar</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pronostico-individual">
          <h5>Pronóstico Individual por Diente</h5>
          {(formData.pronostico.individual_por_diente || []).map((item, index) => (
            <div key={index} className="pronostico-diente-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Diente</label>
                  <input
                    type="text"
                    value={item.diente || ''}
                    onChange={(e) => {
                      const newArray = [...formData.pronostico.individual_por_diente];
                      newArray[index] = { ...item, diente: e.target.value };
                      handleChange('pronostico', 'individual_por_diente', newArray);
                    }}
                    placeholder="Ej: 16, 21..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Pronóstico</label>
                  <select
                    value={item.pronostico || ''}
                    onChange={(e) => {
                      const newArray = [...formData.pronostico.individual_por_diente];
                      newArray[index] = { ...item, pronostico: e.target.value };
                      handleChange('pronostico', 'individual_por_diente', newArray);
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {clasificacionesPronostico.map((clasificacion) => (
                      <option key={clasificacion} value={clasificacion}>{clasificacion}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const newArray = formData.pronostico.individual_por_diente.filter((_, i) => i !== index);
                    handleChange('pronostico', 'individual_por_diente', newArray);
                  }}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
              
              <div className="form-group">
                <label>Justificación</label>
                <textarea
                  value={item.justificacion || ''}
                  onChange={(e) => {
                    const newArray = [...formData.pronostico.individual_por_diente];
                    newArray[index] = { ...item, justificacion: e.target.value };
                    handleChange('pronostico', 'individual_por_diente', newArray);
                  }}
                  placeholder="Razones que justifican el pronóstico..."
                  rows="2"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => {
              const newArray = [...(formData.pronostico.individual_por_diente || []), {
                diente: '',
                pronostico: '',
                justificacion: ''
              }];
              handleChange('pronostico', 'individual_por_diente', newArray);
            }}
            className="btn-add-small"
          >
            + Agregar Pronóstico Individual
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4>Lista de Problemas Prioritarios</h4>
        
        <div className="problemas-list">
          {(formData.problemas_prioritarios || []).map((problema, index) => (
            <div key={index} className="problema-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Prioridad</label>
                  <select
                    value={problema.prioridad || ''}
                    onChange={(e) => handleSimpleArrayChange('problemas_prioritarios', index, {
                      ...problema,
                      prioridad: e.target.value
                    })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Problema</label>
                  <input
                    type="text"
                    value={problema.descripcion || ''}
                    onChange={(e) => handleSimpleArrayChange('problemas_prioritarios', index, {
                      ...problema,
                      descripcion: e.target.value
                    })}
                    placeholder="Descripción del problema..."
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => removeSimpleArrayItem('problemas_prioritarios', index)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleSimpleArrayChange('problemas_prioritarios', -1, {
              prioridad: '',
              descripcion: ''
            })}
            className="btn-add"
          >
            + Agregar Problema Prioritario
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4>Interconsultas Necesarias</h4>
        
        <div className="interconsultas-list">
          {(formData.interconsultas || []).map((interconsulta, index) => (
            <div key={index} className="interconsulta-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Especialidad</label>
                  <select
                    value={interconsulta.especialidad || ''}
                    onChange={(e) => handleSimpleArrayChange('interconsultas', index, {
                      ...interconsulta,
                      especialidad: e.target.value
                    })}
                  >
                    <option value="">Seleccionar especialidad</option>
                    {tiposInterconsulta.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Urgencia</label>
                  <select
                    value={interconsulta.urgencia || ''}
                    onChange={(e) => handleSimpleArrayChange('interconsultas', index, {
                      ...interconsulta,
                      urgencia: e.target.value
                    })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Prioritaria">Prioritaria</option>
                    <option value="Electiva">Electiva</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeSimpleArrayItem('interconsultas', index)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>
              
              <div className="form-group">
                <label>Motivo de la Interconsulta</label>
                <textarea
                  value={interconsulta.motivo || ''}
                  onChange={(e) => handleSimpleArrayChange('interconsultas', index, {
                    ...interconsulta,
                    motivo: e.target.value
                  })}
                  placeholder="Razón por la cual se solicita la interconsulta..."
                  rows="2"
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => handleSimpleArrayChange('interconsultas', -1, {
              especialidad: '',
              urgencia: '',
              motivo: ''
            })}
            className="btn-add"
          >
            + Agregar Interconsulta
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4>Observaciones Adicionales</h4>
        <div className="form-group">
          <label htmlFor="observaciones_adicionales">Observaciones Adicionales</label>
          <textarea
            id="observaciones_adicionales"
            value={formData.observaciones_adicionales}
            onChange={(e) => handleDirectChange('observaciones_adicionales', e.target.value)}
            placeholder="Cualquier observación adicional relevante para el diagnóstico y pronóstico..."
            rows="4"
          />
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> El diagnóstico y pronóstico son fundamentales para el éxito del tratamiento. Deben ser precisos, basados en evidencia clínica y actualizados según la evolución del caso.</p>
      </div>

      <style jsx>{`
        .especialidades-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }

        .especialidad-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .especialidad-section h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          padding-bottom: 10px;
          border-bottom: 2px solid #dee2e6;
        }

        .diagnosticos-list {
          margin-top: 15px;
        }

        .diagnostico-item,
        .problema-item,
        .interconsulta-item,
        .pronostico-diente-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 15px;
          border: 1px solid #e9ecef;
        }

        .factores-pronostico {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .factores-pronostico h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .factores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .pronostico-individual {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .pronostico-individual h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .btn-add {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          margin-top: 15px;
          transition: background-color 0.3s ease;
        }

        .btn-add:hover {
          background-color: #218838;
        }

        .btn-add-small {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          margin-top: 10px;
          transition: background-color 0.3s ease;
        }

        .btn-add-small:hover {
          background-color: #0056b3;
        }

        .btn-remove {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          align-self: center;
          transition: background-color 0.3s ease;
        }

        .btn-remove:hover {
          background-color: #c82333;
        }

        .info-note {
          margin-top: 25px;
          padding: 15px;
          background-color: #e8f4fd;
          border-left: 4px solid #007bff;
          border-radius: 0 8px 8px 0;
        }

        .info-note p {
          margin: 0;
          color: #2c3e50;
          font-size: 14px;
        }

        .form-section {
          margin-bottom: 30px;
          padding-bottom: 25px;
          border-bottom: 1px solid #ecf0f1;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .form-section h4 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .especialidades-container {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .factores-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .especialidad-section {
            padding: 15px;
          }

          .diagnostico-item .form-row,
          .problema-item .form-row,
          .interconsulta-item .form-row,
          .pronostico-diente-item .form-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default DiagnosticoPronostico;