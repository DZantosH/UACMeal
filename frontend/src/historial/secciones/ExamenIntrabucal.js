import React, { useState, useEffect, useCallback } from 'react';

const ExamenIntrabucal = ({ datos: externalData, onChange: externalOnChange, errores = {} }) => {
  const [formData, setFormData] = useState({
    // Estructuras intrabucales
    estructuras: {
      labios: '',
      carrillos: '',
      musculos_pterigoideo_interno: '',
      musculos_pterigoideo_externo: '',
      glandulas_salivales: '',
      frenillos: '',
      istmo_fauces: '',
      paladar: '',
      lengua: '',
      piso_boca: '',
      arco_mandibular: ''
    },
    
    // Examen de higiene oral (O'Leary)
    higiene_oral: {
      indice_placa: '',
      localizacion_placa: '',
      observaciones_higiene: '',
      superficies_con_placa: {}
    },
    
    // Encías
    encias: {
      alteraciones_gingivales: [],
      descripcion_general: ''
    },
    
    // Oclusión y relación dental
    oclusion: {
      // Relación molar
      molar_derecho: '',
      molar_izquierdo: '',
      canino_derecho: '',
      canino_izquierdo: '',
      
      // Armonía de arcos
      arco_superior_amplitud: '',
      arco_superior_boveda: '',
      arco_superior_plana: '',
      arco_inferior_amplitud: '',
      
      // Simetría del arco
      antero_posterior_derecho: '',
      antero_posterior_izquierdo: '',
      buco_lingual_derecho: '',
      buco_lingual_izquierdo: '',
      
      // Tipos de relación dental
      relaciones_dentales: {
        sobre_mordida_vertical: '',
        sobre_mordida_horizontal: '',
        borde_a_borde: '',
        mordida_abierta: '',
        mordida_cruzada_anterior: '',
        mordida_cruzada_posterior: '',
        linea_media_maxilar: '',
        linea_media_mandibular: '',
        diastemas: '',
        apiñamiento: '',
        facetas_desgaste: ''
      }
    },
    
    // Alteraciones dentales
    alteraciones_dentales: {
      descripcion_general: '',
      dientes_afectados: '',
      alteraciones_especificas: []
    },
    
    // Examen dental detallado
    examen_dental: {
      dientes_presentes: {},
      dientes_ausentes: {},
      restauraciones: {},
      caries: {},
      observaciones_generales: ''
    },
    
    // Periodontograma
    periodontograma: {
      profundidad_sondaje: {},
      sangrado_sondaje: {},
      supuracion: {},
      movilidad: {},
      furca: {},
      observaciones: ''
    }
  });

  // Usar datos externos si están disponibles
  const data = externalData || formData;

  useEffect(() => {
    if (externalData && Object.keys(externalData).length > 0) {
      // Asegurar que la estructura esté completa
      const dataWithDefaults = {
        ...formData,
        ...externalData,
        higiene_oral: {
          indice_placa: '',
          localizacion_placa: '',
          observaciones_higiene: '',
          superficies_con_placa: {},
          ...externalData.higiene_oral
        },
        encias: {
          alteraciones_gingivales: [],
          descripcion_general: '',
          ...externalData.encias
        },
        oclusion: {
          molar_derecho: '',
          molar_izquierdo: '',
          canino_derecho: '',
          canino_izquierdo: '',
          arco_superior_amplitud: '',
          arco_superior_boveda: '',
          arco_superior_plana: '',
          arco_inferior_amplitud: '',
          antero_posterior_derecho: '',
          antero_posterior_izquierdo: '',
          buco_lingual_derecho: '',
          buco_lingual_izquierdo: '',
          relaciones_dentales: {
            sobre_mordida_vertical: '',
            sobre_mordida_horizontal: '',
            borde_a_borde: '',
            mordida_abierta: '',
            mordida_cruzada_anterior: '',
            mordida_cruzada_posterior: '',
            linea_media_maxilar: '',
            linea_media_mandibular: '',
            diastemas: '',
            apiñamiento: '',
            facetas_desgaste: '',
            ...externalData.oclusion?.relaciones_dentales
          },
          ...externalData.oclusion
        },
        alteraciones_dentales: {
          descripcion_general: '',
          dientes_afectados: '',
          alteraciones_especificas: [],
          ...externalData.alteraciones_dentales
        },
        periodontograma: {
          profundidad_sondaje: {},
          sangrado_sondaje: {},
          supuracion: {},
          movilidad: {},
          furca: {},
          observaciones: '',
          ...externalData.periodontograma
        }
      };
      setFormData(dataWithDefaults);
    }
  }, [externalData]);

  const handleChange = useCallback((section, field, value) => {
    const newFormData = {
      ...data,
      [section]: {
        ...(data[section] || {}),
        [field]: value
      }
    };
    
    if (externalOnChange) {
      externalOnChange(newFormData);
    } else {
      setFormData(newFormData);
    }
  }, [data, externalOnChange]);

  const handleNestedChange = useCallback((section, subsection, field, value) => {
    const newFormData = {
      ...data,
      [section]: {
        ...(data[section] || {}),
        [subsection]: {
          ...(data[section]?.[subsection] || {}),
          [field]: value
        }
      }
    };
    
    if (externalOnChange) {
      externalOnChange(newFormData);
    } else {
      setFormData(newFormData);
    }
  }, [data, externalOnChange]);

  const handleArrayChange = useCallback((section, field, index, newItem) => {
    // Asegurar que la sección exista
    const currentSection = data[section] || {};
    const currentArray = currentSection[field] || [];
    const newArray = [...currentArray];
    
    if (index >= 0) {
      newArray[index] = newItem;
    } else {
      newArray.push(newItem);
    }
    
    // Actualizar la sección completa
    const newFormData = {
      ...data,
      [section]: {
        ...currentSection,
        [field]: newArray
      }
    };
    
    if (externalOnChange) {
      externalOnChange(newFormData);
    } else {
      setFormData(newFormData);
    }
  }, [data, externalOnChange]);

  const removeArrayItem = useCallback((section, field, index) => {
    const currentSection = data[section] || {};
    const currentArray = currentSection[field] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    
    const newFormData = {
      ...data,
      [section]: {
        ...currentSection,
        [field]: newArray
      }
    };
    
    if (externalOnChange) {
      externalOnChange(newFormData);
    } else {
      setFormData(newFormData);
    }
  }, [data, externalOnChange]);

  // Toggle superficie con placa
  const toggleSuperficiePlaca = useCallback((diente, superficie) => {
    const key = `${diente}_${superficie}`;
    const currentSuperficies = data.higiene_oral?.superficies_con_placa || {};
    const newSuperficies = {
      ...currentSuperficies,
      [key]: !currentSuperficies[key]
    };
    handleChange('higiene_oral', 'superficies_con_placa', newSuperficies);
  }, [data.higiene_oral?.superficies_con_placa, handleChange]);

  // Listas de dientes
  const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Estructuras intrabucales
  const estructurasIntrabucales = [
    { key: 'labios', label: 'Labios' },
    { key: 'carrillos', label: 'Carrillos' },
    { key: 'musculos_pterigoideo_interno', label: 'Músculos pterigoideo interno' },
    { key: 'musculos_pterigoideo_externo', label: 'Músculos pterigoideo externo' },
    { key: 'glandulas_salivales', label: 'Glándulas salivales' },
    { key: 'frenillos', label: 'Frenillos' },
    { key: 'istmo_fauces', label: 'Istmo de las fauces (pilares úvula, amígdalas y paladar blando)' },
    { key: 'paladar', label: 'Paladar (Torus, otros)' },
    { key: 'lengua', label: 'Lengua' },
    { key: 'piso_boca', label: 'Piso de boca' },
    { key: 'arco_mandibular', label: 'Arco mandibular (Torus, otros)' }
  ];

  // Opciones para localización de placa
  const opcionesLocalizacionPlaca = [
    'Generalizada',
    'Sector anterior',
    'Sector posterior',
    'Vestibular',
    'Lingual',
    'Interproximal',
    'Cervical'
  ];

  // Opciones para relación molar y canina
  const opcionesRelacion = [
    { value: 'clase_i', label: 'Clase I' },
    { value: 'clase_ii_div1', label: 'Clase II Div 1' },
    { value: 'clase_ii_div2', label: 'Clase II Div 2' },
    { value: 'clase_iii', label: 'Clase III' }
  ];

  // Opciones para armonía de arcos
  const opcionesArmonia = [
    { value: 'amplio', label: 'Amplio (cuadrado)' },
    { value: 'normal', label: 'Normal (oval)' },
    { value: 'estrecho', label: 'Estrecho (triangular)' }
  ];

  // Opciones para bóveda palatina
  const opcionesBoveda = [
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'plana', label: 'Plana' }
  ];

  // Tipos de relación dental
  const tiposRelacionDental = [
    { key: 'sobre_mordida_vertical', label: 'Sobre-mordida vertical (Over Bite)' },
    { key: 'sobre_mordida_horizontal', label: 'Sobre-mordida Horizontal (Over Jet)' },
    { key: 'borde_a_borde', label: 'Borde a borde' },
    { key: 'mordida_abierta', label: 'Mordida abierta' },
    { key: 'mordida_cruzada_anterior', label: 'Mordida cruzada anterior' },
    { key: 'mordida_cruzada_posterior', label: 'Mordida cruzada posterior' },
    { key: 'linea_media_maxilar', label: 'Relación de La línea media maxilar' },
    { key: 'linea_media_mandibular', label: 'Relación de La línea media mandibular' },
    { key: 'diastemas', label: 'Diastemas' },
    { key: 'apiñamiento', label: 'Apiñamiento' },
    { key: 'facetas_desgaste', label: 'Facetas de desgaste' }
  ];

  return (
    <div className="examen-intrabucal-moderno">
      
      {/* Header de la sección */}
      <div className="seccion-header-custom">
        <div className="header-content">
          <h3>IV. EXAMEN INTRABUCAL</h3>
          <p className="header-subtitle">
            Evaluación sistemática de estructuras intraorales y diagnóstico dental
          </p>
        </div>
      </div>

      {/* Estructuras intrabucales */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Estructuras Intrabucales</h4>
          <span className="card-badge estructuras-badge">Evaluación</span>
        </div>
        
        <div className="form-group-enhanced">
          <p className="section-description">
            Describa las alteraciones que se presentan en cada estructura
          </p>
          
          <div className="estructuras-grid">
            {estructurasIntrabucales.map((estructura) => (
              <div key={estructura.key} className="form-field">
                <label className="form-label-enhanced">{estructura.label}</label>
                <textarea
                  className="form-textarea-enhanced"
                  value={data.estructuras?.[estructura.key] || ''}
                  onChange={(e) => handleChange('estructuras', estructura.key, e.target.value)}
                  placeholder="Describir alteraciones o 'Normal'"
                  style={{ minHeight: '80px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Examen de higiene oral (O'Leary) */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Examen de Higiene Oral (O'Leary)</h4>
          <span className="card-badge higiene-badge">Índice de Placa</span>
        </div>
        
        <div className="form-group-enhanced">
          <div className="odontograma-container">
            <h5>Índice de Placa Dentobacteriana</h5>
            <p className="section-description">
              Haga clic en las superficies dentales que presenten placa bacteriana
            </p>
            
            <div className="odontograma">
              <div className="dientes-superiores">
                {dientesSuperiores.map((diente) => (
                  <div key={diente} className="diente-container">
                    <span className="numero-diente">{diente}</span>
                    <div className="diente-surfaces">
                      {['vestibular', 'mesial', 'distal', 'lingual'].map((superficie) => (
                        <div
                          key={superficie}
                          className={`surface ${superficie} ${
                            data.higiene_oral?.superficies_con_placa?.[`${diente}_${superficie}`] ? 'con-placa' : ''
                          }`}
                          title={superficie}
                          onClick={() => toggleSuperficiePlaca(diente, superficie)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="dientes-inferiores">
                {dientesInferiores.map((diente) => (
                  <div key={diente} className="diente-container">
                    <div className="diente-surfaces">
                      {['vestibular', 'mesial', 'distal', 'lingual'].map((superficie) => (
                        <div
                          key={superficie}
                          className={`surface ${superficie} ${
                            data.higiene_oral?.superficies_con_placa?.[`${diente}_${superficie}`] ? 'con-placa' : ''
                          }`}
                          title={superficie}
                          onClick={() => toggleSuperficiePlaca(diente, superficie)}
                        />
                      ))}
                    </div>
                    <span className="numero-diente">{diente}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="placa-legend">
              <p><strong>Instrucciones:</strong> Haga clic en las superficies dentales que presenten placa bacteriana</p>
              <div className="legend-items">
                <div className="legend-item">
                  <div className="surface-example normal"></div>
                  <span>Sin placa</span>
                </div>
                <div className="legend-item">
                  <div className="surface-example con-placa"></div>
                  <span>Con placa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label-enhanced">Índice de Placa (%)</label>
              <input
                type="number"
                className="form-input-enhanced"
                value={data.higiene_oral?.indice_placa || ''}
                onChange={(e) => handleChange('higiene_oral', 'indice_placa', e.target.value)}
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>
            
            <div className="form-field">
              <label className="form-label-enhanced">Localización Predominante de Placa</label>
              <select
                className="form-select-enhanced"
                value={data.higiene_oral?.localizacion_placa || ''}
                onChange={(e) => handleChange('higiene_oral', 'localizacion_placa', e.target.value)}
              >
                <option value="">Seleccionar</option>
                {opcionesLocalizacionPlaca.map(opcion => (
                  <option key={opcion} value={opcion}>{opcion}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label-enhanced">Observaciones sobre Higiene Oral</label>
            <textarea
              className="form-textarea-enhanced"
              value={data.higiene_oral?.observaciones_higiene || ''}
              onChange={(e) => handleChange('higiene_oral', 'observaciones_higiene', e.target.value)}
              placeholder="Calidad del cepillado, uso de auxiliares, motivación del paciente..."
            />
          </div>
        </div>
      </div>

      {/* Encías */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Encías</h4>
          <span className="card-badge encias-badge">Alteraciones gingivales</span>
        </div>
        
        <div className="form-group-enhanced">
          <p className="section-description">
            Alteraciones gingivales papilares y de la inserción
          </p>
          
          <div className="encias-section">
            <h5>Alteraciones Gingivales</h5>
            {(data.encias?.alteraciones_gingivales || []).map((alteracion, index) => (
              <div key={index} className="alteracion-item">
                <div className="form-row">
                  <div className="form-field">
                    <label>Localización</label>
                    <input
                      type="text"
                      className="form-input-enhanced"
                      value={alteracion.localizacion || ''}
                      onChange={(e) => handleArrayChange('encias', 'alteraciones_gingivales', index, {
                        ...alteracion,
                        localizacion: e.target.value
                      })}
                      placeholder="Ej: Sector antero-superior, diente 12..."
                    />
                  </div>
                  <div className="form-field">
                    <label>Descripción de la Alteración</label>
                    <input
                      type="text"
                      className="form-input-enhanced"
                      value={alteracion.descripcion || ''}
                      onChange={(e) => handleArrayChange('encias', 'alteraciones_gingivales', index, {
                        ...alteracion,
                        descripcion: e.target.value
                      })}
                      placeholder="Inflamación, sangrado, recesión..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('encias', 'alteraciones_gingivales', index)}
                    className="btn-remove"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                console.log('Agregando alteración gingival...');
                handleArrayChange('encias', 'alteraciones_gingivales', -1, {
                  localizacion: '',
                  descripcion: ''
                });
              }}
              className="btn-add"
            >
              + Agregar Alteración Gingival
            </button>
          </div>

          <div className="form-field" style={{ marginTop: '20px' }}>
            <label className="form-label-enhanced">Descripción General de Encías</label>
            <textarea
              className="form-textarea-enhanced"
              value={data.encias?.descripcion_general || ''}
              onChange={(e) => handleChange('encias', 'descripcion_general', e.target.value)}
              placeholder="Estado general de las encías, color, textura, consistencia..."
            />
          </div>
        </div>
      </div>

      {/* Oclusión */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>16. Oclusión</h4>
          <span className="card-badge dental-badge">Relación dental</span>
        </div>
        
        <div className="form-group-enhanced">
          <div className="oclusion-section">
            <div className="oclusion-visual">
              <h6>Señale con una diagonal azul los dientes presentes y con una roja los ausentes</h6>
              <div className="oclusion-diagram">
                <div className="arcos-dentales">
                  <div className="arco-superior">
                    {dientesSuperiores.map((diente) => (
                      <div key={diente} className="diente-oclusion">
                        {diente}
                      </div>
                    ))}
                  </div>
                  <div className="arco-inferior">
                    {dientesInferiores.map((diente) => (
                      <div key={diente} className="diente-oclusion">
                        {diente}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <h5>Armonía de los maxilares (Describir)</h5>
            <table className="armonia-table">
              <thead>
                <tr>
                  <th>Amplitud del arco dentario Superior</th>
                  <th>Amplio (cuadrado)</th>
                  <th>Normal (oval)</th>
                  <th>Estrecho (triangular)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="categoria-header">Bóveda palatina</td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={data.oclusion?.arco_superior_boveda === 'alto'}
                      onChange={(e) => handleChange('oclusion', 'arco_superior_boveda', e.target.checked ? 'alto' : '')}
                    />
                  </td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={data.oclusion?.arco_superior_boveda === 'normal'}
                      onChange={(e) => handleChange('oclusion', 'arco_superior_boveda', e.target.checked ? 'normal' : '')}
                    />
                  </td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={data.oclusion?.arco_superior_boveda === 'plana'}
                      onChange={(e) => handleChange('oclusion', 'arco_superior_boveda', e.target.checked ? 'plana' : '')}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="categoria-header">Plana</td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={data.oclusion?.arco_superior_plana === 'normal'}
                      onChange={(e) => handleChange('oclusion', 'arco_superior_plana', e.target.checked ? 'normal' : '')}
                    />
                  </td>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={data.oclusion?.arco_superior_plana === 'alta'}
                      onChange={(e) => handleChange('oclusion', 'arco_superior_plana', e.target.checked ? 'alta' : '')}
                    />
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <th>Amplitud del arco dentario inferior</th>
                  <th>Amplio (cuadrado)</th>
                  <th>Normal (oval)</th>
                  <th>Estrecho (triangular)</th>
                </tr>
              </tbody>
            </table>

            <h5>Simetría del arco</h5>
            <div className="simetria-grid">
              <div className="simetria-field">
                <label>Relación antero-posterior Derecho</label>
                <input
                  type="text"
                  className="form-input-enhanced"
                  value={data.oclusion?.antero_posterior_derecho || ''}
                  onChange={(e) => handleChange('oclusion', 'antero_posterior_derecho', e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="simetria-field">
                <label>Izquierdo</label>
                <input
                  type="text"
                  className="form-input-enhanced"
                  value={data.oclusion?.antero_posterior_izquierdo || ''}
                  onChange={(e) => handleChange('oclusion', 'antero_posterior_izquierdo', e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="simetria-field">
                <label>Relación buco lingual Derecho</label>
                <input
                  type="text"
                  className="form-input-enhanced"
                  value={data.oclusion?.buco_lingual_derecho || ''}
                  onChange={(e) => handleChange('oclusion', 'buco_lingual_derecho', e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="simetria-field">
                <label>Izquierdo</label>
                <input
                  type="text"
                  className="form-input-enhanced"
                  value={data.oclusion?.buco_lingual_izquierdo || ''}
                  onChange={(e) => handleChange('oclusion', 'buco_lingual_izquierdo', e.target.value)}
                  placeholder="mm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maloclusiones Clasificación de Angle */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Maloclusiones Clasificación de Angle</h4>
          <span className="card-badge dental-badge">Clasificación</span>
        </div>
        
        <div className="form-group-enhanced">
          <div className="molar-canino-grid">
            <div className="molar-canino-section">
              <h6>Derecho</h6>
              <div className="lado-grid">
                <div className="lado-field">
                  <label>Molar</label>
                  <select
                    className="form-select-enhanced"
                    value={data.oclusion?.molar_derecho || ''}
                    onChange={(e) => handleChange('oclusion', 'molar_derecho', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {opcionesRelacion.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                    ))}
                  </select>
                </div>
                <div className="lado-field">
                  <label>Canino</label>
                  <select
                    className="form-select-enhanced"
                    value={data.oclusion?.canino_derecho || ''}
                    onChange={(e) => handleChange('oclusion', 'canino_derecho', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {opcionesRelacion.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="molar-canino-section">
              <h6>Izquierdo</h6>
              <div className="lado-grid">
                <div className="lado-field">
                  <label>Molar</label>
                  <select
                    className="form-select-enhanced"
                    value={data.oclusion?.molar_izquierdo || ''}
                    onChange={(e) => handleChange('oclusion', 'molar_izquierdo', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {opcionesRelacion.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                    ))}
                  </select>
                </div>
                <div className="lado-field">
                  <label>Canino</label>
                  <select
                    className="form-select-enhanced"
                    value={data.oclusion?.canino_izquierdo || ''}
                    onChange={(e) => handleChange('oclusion', 'canino_izquierdo', e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {opcionesRelacion.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>{opcion.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relación dental */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Relación dental</h4>
          <span className="card-badge dental-badge">Tipos de relación</span>
        </div>
        
        <div className="form-group-enhanced">
          <div className="relacion-dental-section">
            <table className="relacion-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Describir</th>
                </tr>
              </thead>
              <tbody>
                {tiposRelacionDental.map((tipo) => (
                  <tr key={tipo.key}>
                    <td className="tipo-cell">{tipo.label}</td>
                    <td>
                      <textarea
                        value={data.oclusion?.relaciones_dentales?.[tipo.key] || ''}
                        onChange={(e) => handleNestedChange('oclusion', 'relaciones_dentales', tipo.key, e.target.value)}
                        placeholder="Describir alteración..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alteraciones dentales */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Alteraciones dentales</h4>
          <span className="card-badge dental-badge">Forma, tamaño, número, estructura, color, posición, erupción</span>
        </div>
        
        <div className="form-group-enhanced">
          <div className="alteraciones-dentales-section">
            <table className="alteraciones-table">
              <thead>
                <tr>
                  <th>Dientes</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dientes-cell">
                    <textarea
                      placeholder="Especificar dientes afectados..."
                      value={data.alteraciones_dentales?.dientes_afectados || ''}
                      onChange={(e) => handleChange('alteraciones_dentales', 'dientes_afectados', e.target.value)}
                    />
                  </td>
                  <td>
                    <textarea
                      placeholder="Describir alteraciones..."
                      value={data.alteraciones_dentales?.descripcion_general || ''}
                      onChange={(e) => handleChange('alteraciones_dentales', 'descripcion_general', e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Examen Dental con Odontograma */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>Examen Dental</h4>
          <span className="card-badge dental-badge">Odontograma clínico</span>
        </div>
        
        <div className="form-group-enhanced">
          <div className="dental-odontograma">
            <h5>Odontograma Clínico</h5>
            <div className="odontograma-clinical">
              <div className="dientes-superiores">
                {dientesSuperiores.map((diente) => (
                  <div key={diente} className="diente-clinical">
                    <span className="numero-diente">{diente}</span>
                    <div className="diente-crown">
                      <div className="crown-sections">
                        <div className="section oclusal" title="Oclusal"></div>
                        <div className="section vestibular" title="Vestibular"></div>
                        <div className="section mesial" title="Mesial"></div>
                        <div className="section distal" title="Distal"></div>
                        <div className="section lingual" title="Lingual"></div>
                      </div>
                    </div>
                    <div className="diente-root"></div>
                  </div>
                ))}
              </div>
              
              <div className="dientes-inferiores">
                {dientesInferiores.map((diente) => (
                  <div key={diente} className="diente-clinical">
                    <div className="diente-root"></div>
                    <div className="diente-crown">
                      <div className="crown-sections">
                        <div className="section oclusal" title="Oclusal"></div>
                        <div className="section vestibular" title="Vestibular"></div>
                        <div className="section mesial" title="Mesial"></div>
                        <div className="section distal" title="Distal"></div>
                        <div className="section lingual" title="Lingual"></div>
                      </div>
                    </div>
                    <span className="numero-diente">{diente}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="odontograma-legend">
              <h6>Simbología Odontológica</h6>
              <div className="legend-grid">
                <div className="legend-item">
                  <div className="symbol caries"></div>
                  <span>Caries</span>
                </div>
                <div className="legend-item">
                  <div className="symbol restauracion"></div>
                  <span>Restauración</span>
                </div>
                <div className="legend-item">
                  <div className="symbol corona"></div>
                  <span>Corona</span>
                </div>
                <div className="legend-item">
                  <div className="symbol ausente"></div>
                  <span>Ausente</span>
                </div>
                <div className="legend-item">
                  <div className="symbol endodoncia"></div>
                  <span>Endodoncia</span>
                </div>
                <div className="legend-item">
                  <div className="symbol protesis"></div>
                  <span>Prótesis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hallazgos-dentales">
            <h5>Observaciones Generales del Examen Dental</h5>
            <div className="form-field">
              <label className="form-label-enhanced">Resumen de hallazgos, prioridades de tratamiento, observaciones relevantes</label>
              <textarea
                className="form-textarea-enhanced"
                value={data.examen_dental?.observaciones_generales || ''}
                onChange={(e) => handleChange('examen_dental', 'observaciones_generales', e.target.value)}
                placeholder="Resumen de hallazgos, prioridades de tratamiento, observaciones relevantes..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Periodontograma */}
      <div className="form-section-card">
        <div className="card-header">
          <h4>20. Periodontograma</h4>
          <span className="card-badge periodonto-badge">Evaluación periodontal</span>
        </div>
        
        <div className="form-group-enhanced">
          <p className="section-description">
            Marque con color rojo el límite de las lesiones gingivales y con azul las periodontales
          </p>
          
          <div className="periodontograma-container">
            <div className="periodonto-visual">
              <h6>Periodontograma Visual</h6>
              <div className="periodonto-image">
                Espacio para diagrama periodontal
                <br />
                (Se puede implementar como imagen o SVG interactivo)
              </div>
            </div>
            
            <div className="periodonto-chart">
              <div className="chart-header">
                <span>Diente</span>
                <span>PS (mm)</span>
                <span>Sangrado</span>
                <span>Supuración</span>
                <span>Movilidad</span>
                <span>Furca</span>
              </div>
              
              <div className="chart-body">
                {[...dientesSuperiores, ...dientesInferiores].map((diente) => (
                  <div key={diente} className="chart-row">
                    <span className="diente-num">{diente}</span>
                    <div className="chart-cell">
                      <input 
                        type="text" 
                        placeholder="PS"
                        className="perio-input"
                        value={data.periodontograma?.profundidad_sondaje?.[diente] || ''}
                        onChange={(e) => handleNestedChange('periodontograma', 'profundidad_sondaje', diente, e.target.value)}
                      />
                    </div>
                    <div className="chart-cell">
                      <input 
                        type="checkbox" 
                        className="perio-checkbox"
                        checked={data.periodontograma?.sangrado_sondaje?.[diente] || false}
                        onChange={(e) => handleNestedChange('periodontograma', 'sangrado_sondaje', diente, e.target.checked)}
                      />
                    </div>
                    <div className="chart-cell">
                      <input 
                        type="checkbox" 
                        className="perio-checkbox"
                        checked={data.periodontograma?.supuracion?.[diente] || false}
                        onChange={(e) => handleNestedChange('periodontograma', 'supuracion', diente, e.target.checked)}
                      />
                    </div>
                    <div className="chart-cell">
                      <select 
                        className="perio-select"
                        value={data.periodontograma?.movilidad?.[diente] || ''}
                        onChange={(e) => handleNestedChange('periodontograma', 'movilidad', diente, e.target.value)}
                      >
                        <option value="">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                    <div className="chart-cell">
                      <select 
                        className="perio-select"
                        value={data.periodontograma?.furca?.[diente] || ''}
                        onChange={(e) => handleNestedChange('periodontograma', 'furca', diente, e.target.value)}
                      >
                        <option value="">0</option>
                        <option value="1">I</option>
                        <option value="2">II</option>
                        <option value="3">III</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-field" style={{ marginTop: '20px' }}>
            <label className="form-label-enhanced">Observaciones del Periodontograma</label>
            <textarea
              className="form-textarea-enhanced"
              value={data.periodontograma?.observaciones || ''}
              onChange={(e) => handleChange('periodontograma', 'observaciones', e.target.value)}
              placeholder="Patrones de enfermedad periodontal, distribución de lesiones, pronóstico..."
            />
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="info-note-enhanced">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <h6>Información importante</h6>
          <p>
            El examen intrabucal es fundamental para el diagnóstico odontológico. Registre todos los 
            hallazgos de manera sistemática y detallada. Utilice los odontogramas interactivos para 
            marcar las condiciones encontradas en cada diente.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ExamenIntrabucal;