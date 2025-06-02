import React, { useState, useEffect } from 'react';

const AuxiliaresDiagnostico = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Modelos de estudio
    modelos_estudio: {
      realizados: false,
      hallazgos: '',
      analisis_modelos: '',
      fecha_toma: ''
    },
    
    // Radiografías intraorales
    radiografias_intraorales: [],
    
    // Radiografías extraorales
    radiografias_extraorales: [],
    
    // Exámenes de laboratorio
    examenes_laboratorio: {
      biometria_hematica: {
        solicitado: false,
        fecha: '',
        hallazgo: ''
      },
      quimica_sanguinea: {
        solicitado: false,
        fecha: '',
        hallazgo: ''
      },
      general_orina: {
        solicitado: false,
        fecha: '',
        hallazgo: ''
      },
      pruebas_coagulacion: {
        solicitado: false,
        fecha: '',
        hallazgo: ''
      },
      cultivo_antibiograma: {
        solicitado: false,
        fecha: '',
        hallazgo: ''
      },
      otros_examenes: []
    }
  });

  useEffect(() => {
  if (data && Object.keys(data).length > 0) {
    setFormData(prevData => ({ ...prevData, ...data })); // ✅ Usa función updater
  }
}, [data]); //

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

  const handleNestedChange = (section, subsection, field, value) => {
    const newFormData = {
      ...formData,
      [section]: {
        ...formData[section],
        [subsection]: {
          ...formData[section][subsection],
          [field]: value
        }
      }
    };
    setFormData(newFormData);
    onUpdate(newFormData);
  };

  const handleArrayChange = (section, index, newItem) => {
    const newArray = [...formData[section]];
    if (index >= 0) {
      newArray[index] = newItem;
    } else {
      newArray.push(newItem);
    }
    handleDirectChange(section, newArray);
  };

  const removeArrayItem = (section, index) => {
    const newArray = formData[section].filter((_, i) => i !== index);
    handleDirectChange(section, newArray);
  };

  // Tipos de radiografías
  const tiposRadiografiasIntraorales = [
    'Periapical',
    'Bitewing',
    'Oclusal',
    'Endodóntica',
    'Serie completa'
  ];

  const tiposRadiografiasExtraorales = [
    'Panorámica',
    'Lateral de cráneo',
    'Posteroanterior',
    'Submentovértex',
    'Towne',
    'Temporomandibular',
    'Tomografía',
    'CBCT'
  ];

  return (
    <div className="auxiliares-diagnostico">
      <div className="form-section">
        <h4>Modelos de Estudio</h4>
        
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="modelos_realizados"
              checked={formData.modelos_estudio.realizados}
              onChange={(e) => handleChange('modelos_estudio', 'realizados', e.target.checked)}
            />
            <label htmlFor="modelos_realizados">¿Se realizaron modelos de estudio?</label>
          </div>
        </div>

        {formData.modelos_estudio.realizados && (
          <>
            <div className="form-group">
              <label htmlFor="fecha_toma_modelos">Fecha de Toma</label>
              <input
                type="date"
                id="fecha_toma_modelos"
                value={formData.modelos_estudio.fecha_toma}
                onChange={(e) => handleChange('modelos_estudio', 'fecha_toma', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="hallazgos_modelos">Hallazgos en Modelos</label>
              <textarea
                id="hallazgos_modelos"
                value={formData.modelos_estudio.hallazgos}
                onChange={(e) => handleChange('modelos_estudio', 'hallazgos', e.target.value)}
                placeholder="Descripción de hallazgos encontrados en los modelos de estudio..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="analisis_modelos">Análisis de Modelos</label>
              <textarea
                id="analisis_modelos"
                value={formData.modelos_estudio.analisis_modelos}
                onChange={(e) => handleChange('modelos_estudio', 'analisis_modelos', e.target.value)}
                placeholder="Análisis cefalométrico, mediciones, relaciones intermaxilares..."
                rows="4"
              />
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h4>Estudio Radiográfico - Radiografías Intraorales</h4>
        
        <div className="radiografias-section">
          {formData.radiografias_intraorales.map((radiografia, index) => (
            <div key={index} className="radiografia-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Radiografía</label>
                  <select
                    value={radiografia.tipo || ''}
                    onChange={(e) => handleArrayChange('radiografias_intraorales', index, {
                      ...radiografia,
                      tipo: e.target.value
                    })}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposRadiografiasIntraorales.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Región</label>
                  <input
                    type="text"
                    value={radiografia.region || ''}
                    onChange={(e) => handleArrayChange('radiografias_intraorales', index, {
                      ...radiografia,
                      region: e.target.value
                    })}
                    placeholder="Ej: Sector anterior superior, molar inferior derecho..."
                  />
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={radiografia.fecha || ''}
                    onChange={(e) => handleArrayChange('radiografias_intraorales', index, {
                      ...radiografia,
                      fecha: e.target.value
                    })}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeArrayItem('radiografias_intraorales', index)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>

              <div className="form-group">
                <label>Hallazgos Radiográficos</label>
                <textarea
                  value={radiografia.hallazgos || ''}
                  onChange={(e) => handleArrayChange('radiografias_intraorales', index, {
                    ...radiografia,
                    hallazgos: e.target.value
                  })}
                  placeholder="Describir hallazgos radiográficos..."
                  rows="3"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleArrayChange('radiografias_intraorales', -1, {
              tipo: '',
              region: '',
              fecha: '',
              hallazgos: ''
            })}
            className="btn-add"
          >
            + Agregar Radiografía Intraoral
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4>Radiografías Extraorales</h4>
        
        <div className="radiografias-section">
          {formData.radiografias_extraorales.map((radiografia, index) => (
            <div key={index} className="radiografia-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Radiografía</label>
                  <select
                    value={radiografia.tipo || ''}
                    onChange={(e) => handleArrayChange('radiografias_extraorales', index, {
                      ...radiografia,
                      tipo: e.target.value
                    })}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposRadiografiasExtraorales.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={radiografia.fecha || ''}
                    onChange={(e) => handleArrayChange('radiografias_extraorales', index, {
                      ...radiografia,
                      fecha: e.target.value
                    })}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeArrayItem('radiografias_extraorales', index)}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>

              <div className="form-group">
                <label>Hallazgos Radiográficos</label>
                <textarea
                  value={radiografia.hallazgos || ''}
                  onChange={(e) => handleArrayChange('radiografias_extraorales', index, {
                    ...radiografia,
                    hallazgos: e.target.value
                  })}
                  placeholder="Describir hallazgos radiográficos..."
                  rows="3"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => handleArrayChange('radiografias_extraorales', -1, {
              tipo: '',
              fecha: '',
              hallazgos: ''
            })}
            className="btn-add"
          >
            + Agregar Radiografía Extraoral
          </button>
        </div>
      </div>

      <div className="form-section">
        <h4>Exámenes de Laboratorio</h4>
        
        <div className="laboratorio-grid">
          <div className="examen-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="biometria_hematica"
                checked={formData.examenes_laboratorio.biometria_hematica.solicitado}
                onChange={(e) => handleNestedChange('examenes_laboratorio', 'biometria_hematica', 'solicitado', e.target.checked)}
              />
              <label htmlFor="biometria_hematica">Biometría Hemática</label>
            </div>
            
            {formData.examenes_laboratorio.biometria_hematica.solicitado && (
              <>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.examenes_laboratorio.biometria_hematica.fecha}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'biometria_hematica', 'fecha', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hallazgo</label>
                  <textarea
                    value={formData.examenes_laboratorio.biometria_hematica.hallazgo}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'biometria_hematica', 'hallazgo', e.target.value)}
                    placeholder="Resultados y valores relevantes..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>

          <div className="examen-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="quimica_sanguinea"
                checked={formData.examenes_laboratorio.quimica_sanguinea.solicitado}
                onChange={(e) => handleNestedChange('examenes_laboratorio', 'quimica_sanguinea', 'solicitado', e.target.checked)}
              />
              <label htmlFor="quimica_sanguinea">Química Sanguínea</label>
            </div>
            
            {formData.examenes_laboratorio.quimica_sanguinea.solicitado && (
              <>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.examenes_laboratorio.quimica_sanguinea.fecha}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'quimica_sanguinea', 'fecha', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hallazgo</label>
                  <textarea
                    value={formData.examenes_laboratorio.quimica_sanguinea.hallazgo}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'quimica_sanguinea', 'hallazgo', e.target.value)}
                    placeholder="Glucosa, creatinina, urea, etc..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>

          <div className="examen-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="general_orina"
                checked={formData.examenes_laboratorio.general_orina.solicitado}
                onChange={(e) => handleNestedChange('examenes_laboratorio', 'general_orina', 'solicitado', e.target.checked)}
              />
              <label htmlFor="general_orina">General de Orina</label>
            </div>
            
            {formData.examenes_laboratorio.general_orina.solicitado && (
              <>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.examenes_laboratorio.general_orina.fecha}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'general_orina', 'fecha', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hallazgo</label>
                  <textarea
                    value={formData.examenes_laboratorio.general_orina.hallazgo}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'general_orina', 'hallazgo', e.target.value)}
                    placeholder="Resultados del examen de orina..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>

          <div className="examen-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="pruebas_coagulacion"
                checked={formData.examenes_laboratorio.pruebas_coagulacion.solicitado}
                onChange={(e) => handleNestedChange('examenes_laboratorio', 'pruebas_coagulacion', 'solicitado', e.target.checked)}
              />
              <label htmlFor="pruebas_coagulacion">Pruebas de Coagulación</label>
            </div>
            
            {formData.examenes_laboratorio.pruebas_coagulacion.solicitado && (
              <>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.examenes_laboratorio.pruebas_coagulacion.fecha}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'pruebas_coagulacion', 'fecha', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hallazgo</label>
                  <textarea
                    value={formData.examenes_laboratorio.pruebas_coagulacion.hallazgo}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'pruebas_coagulacion', 'hallazgo', e.target.value)}
                    placeholder="TP, TPT, INR, tiempo de sangrado..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>

          <div className="examen-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="cultivo_antibiograma"
                checked={formData.examenes_laboratorio.cultivo_antibiograma.solicitado}
                onChange={(e) => handleNestedChange('examenes_laboratorio', 'cultivo_antibiograma', 'solicitado', e.target.checked)}
              />
              <label htmlFor="cultivo_antibiograma">Cultivo y Antibiograma</label>
            </div>
            
            {formData.examenes_laboratorio.cultivo_antibiograma.solicitado && (
              <>
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.examenes_laboratorio.cultivo_antibiograma.fecha}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'cultivo_antibiograma', 'fecha', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Hallazgo</label>
                  <textarea
                    value={formData.examenes_laboratorio.cultivo_antibiograma.hallazgo}
                    onChange={(e) => handleNestedChange('examenes_laboratorio', 'cultivo_antibiograma', 'hallazgo', e.target.value)}
                    placeholder="Microorganismos identificados, sensibilidad antibiótica..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="otros-examenes-section">
          <h5>Otros Exámenes</h5>
          {formData.examenes_laboratorio.otros_examenes.map((examen, index) => (
            <div key={index} className="otro-examen-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Examen</label>
                  <input
                    type="text"
                    value={examen.nombre || ''}
                    onChange={(e) => {
                      const newArray = [...formData.examenes_laboratorio.otros_examenes];
                      newArray[index] = { ...examen, nombre: e.target.value };
                      handleChange('examenes_laboratorio', 'otros_examenes', newArray);
                    }}
                    placeholder="Ej: Perfil lipídico, TSH, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={examen.fecha || ''}
                    onChange={(e) => {
                      const newArray = [...formData.examenes_laboratorio.otros_examenes];
                      newArray[index] = { ...examen, fecha: e.target.value };
                      handleChange('examenes_laboratorio', 'otros_examenes', newArray);
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newArray = formData.examenes_laboratorio.otros_examenes.filter((_, i) => i !== index);
                    handleChange('examenes_laboratorio', 'otros_examenes', newArray);
                  }}
                  className="btn-remove"
                >
                  🗑️
                </button>
              </div>

              <div className="form-group">
                <label>Hallazgo</label>
                <textarea
                  value={examen.hallazgo || ''}
                  onChange={(e) => {
                    const newArray = [...formData.examenes_laboratorio.otros_examenes];
                    newArray[index] = { ...examen, hallazgo: e.target.value };
                    handleChange('examenes_laboratorio', 'otros_examenes', newArray);
                  }}
                  placeholder="Resultados del examen..."
                  rows="2"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const newArray = [...formData.examenes_laboratorio.otros_examenes, {
                nombre: '',
                fecha: '',
                hallazgo: ''
              }];
              handleChange('examenes_laboratorio', 'otros_examenes', newArray);
            }}
            className="btn-add"
          >
            + Agregar Otro Examen
          </button>
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> Los auxiliares de diagnóstico complementan el examen clínico y son fundamentales para establecer un diagnóstico preciso y planificar el tratamiento adecuado.</p>
      </div>

      <style jsx>{`
        .radiografias-section,
        .otros-examenes-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .radiografia-item,
        .otro-examen-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          border: 1px solid #e9ecef;
        }

        .laboratorio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 15px 0;
        }

        .examen-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 15px;
        }

        .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin: 0;
        }

        .checkbox-group label {
          margin: 0;
          cursor: pointer;
          font-size: 15px;
          color: #2c3e50;
          font-weight: 600;
        }

        .btn-add {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
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

        .otros-examenes-section h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
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
          .laboratorio-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .radiografia-item .form-row,
          .otro-examen-item .form-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .examen-item {
            padding: 12px;
          }

          .radiografias-section,
          .otros-examenes-section {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuxiliaresDiagnostico;