import React, { useState, useEffect } from 'react';

const ExamenIntrabucal = ({ data, onUpdate }) => {
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
      observaciones_higiene: ''
    },
    
    // Encías
    encias: {
      alteraciones_gingivales: [],
      descripcion_general: ''
    },
    
    // Examen dental detallado
    examen_dental: {
      dientes_presentes: [],
      dientes_ausentes: [],
      restauraciones: [],
      caries: [],
      alteraciones_dentales: '',
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

  const handleArrayChange = (section, field, index, newItem) => {
    const currentArray = formData[section][field] || [];
    const newArray = [...currentArray];
    
    if (index >= 0) {
      newArray[index] = newItem;
    } else {
      newArray.push(newItem);
    }
    
    handleChange(section, field, newArray);
  };

  const removeArrayItem = (section, field, index) => {
    const currentArray = formData[section][field] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleChange(section, field, newArray);
  };

  // Lista de dientes
  const dientesSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const dientesInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="examen-intrabucal">
      <div className="form-section">
        <h4>Examen de Estructuras Intrabucales</h4>
        <p className="section-description">
          Describa las alteraciones que se presentan en cada estructura
        </p>
        
        <div className="estructuras-grid">
          {Object.keys(formData.estructuras).map((estructura) => (
            <div key={estructura} className="form-group">
              <label htmlFor={estructura}>
                {estructura.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <textarea
                id={estructura}
                value={formData.estructuras[estructura]}
                onChange={(e) => handleChange('estructuras', estructura, e.target.value)}
                placeholder="Describir alteraciones o 'Normal'"
                rows="3"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>Examen de Higiene Oral (O'Leary)</h4>
        
        <div className="higiene-visual">
          <div className="odontograma-container">
            <h5>Odontograma para Índice de Placa</h5>
            <div className="odontograma">
              <div className="dientes-superiores">
                {dientesSuperiores.map((diente) => (
                  <div key={diente} className="diente-container">
                    <span className="numero-diente">{diente}</span>
                    <div className="diente-surfaces">
                      <div className="surface vestibular" title="Vestibular"></div>
                      <div className="surface mesial" title="Mesial"></div>
                      <div className="surface distal" title="Distal"></div>
                      <div className="surface lingual" title="Lingual"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="dientes-inferiores">
                {dientesInferiores.map((diente) => (
                  <div key={diente} className="diente-container">
                    <div className="diente-surfaces">
                      <div className="surface vestibular" title="Vestibular"></div>
                      <div className="surface mesial" title="Mesial"></div>
                      <div className="surface distal" title="Distal"></div>
                      <div className="surface lingual" title="Lingual"></div>
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="indice_placa">Índice de Placa (%)</label>
            <input
              type="number"
              id="indice_placa"
              value={formData.higiene_oral.indice_placa}
              onChange={(e) => handleChange('higiene_oral', 'indice_placa', e.target.value)}
              placeholder="0-100"
              min="0"
              max="100"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="localizacion_placa">Localización Predominante de Placa</label>
            <select
              id="localizacion_placa"
              value={formData.higiene_oral.localizacion_placa}
              onChange={(e) => handleChange('higiene_oral', 'localizacion_placa', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Generalizada">Generalizada</option>
              <option value="Sector anterior">Sector anterior</option>
              <option value="Sector posterior">Sector posterior</option>
              <option value="Vestibular">Vestibular</option>
              <option value="Lingual">Lingual</option>
              <option value="Interproximal">Interproximal</option>
              <option value="Cervical">Cervical</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="observaciones_higiene">Observaciones sobre Higiene Oral</label>
          <textarea
            id="observaciones_higiene"
            value={formData.higiene_oral.observaciones_higiene}
            onChange={(e) => handleChange('higiene_oral', 'observaciones_higiene', e.target.value)}
            placeholder="Calidad del cepillado, uso de auxiliares, motivación del paciente..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Encías</h4>
        <p className="section-description">
          Alteraciones gingivales papilares y de la inserción
        </p>
        
        <div className="encias-section">
          <h5>Alteraciones Gingivales</h5>
          {formData.encias.alteraciones_gingivales.map((alteracion, index) => (
            <div key={index} className="alteracion-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Localización</label>
                  <input
                    type="text"
                    value={alteracion.localizacion || ''}
                    onChange={(e) => handleArrayChange('encias', 'alteraciones_gingivales', index, {
                      ...alteracion,
                      localizacion: e.target.value
                    })}
                    placeholder="Ej: Sector antero-superior, diente 12..."
                  />
                </div>
                <div className="form-group">
                  <label>Descripción de la Alteración</label>
                  <input
                    type="text"
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
            onClick={() => handleArrayChange('encias', 'alteraciones_gingivales', -1, {
              localizacion: '',
              descripcion: ''
            })}
            className="btn-add"
          >
            + Agregar Alteración Gingival
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion_general_encias">Descripción General de Encías</label>
          <textarea
            id="descripcion_general_encias"
            value={formData.encias.descripcion_general}
            onChange={(e) => handleChange('encias', 'descripcion_general', e.target.value)}
            placeholder="Estado general de las encías, color, textura, consistencia..."
            rows="4"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Examen Dental</h4>
        
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
          <h5>Hallazgos Dentales Específicos</h5>
          
          <div className="form-group">
            <label htmlFor="alteraciones_dentales">Alteraciones Dentales</label>
            <textarea
              id="alteraciones_dentales"
              value={formData.examen_dental.alteraciones_dentales}
              onChange={(e) => handleChange('examen_dental', 'alteraciones_dentales', e.target.value)}
              placeholder="Forma, tamaño, número, estructura, color, posición, erupción..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="observaciones_generales">Observaciones Generales del Examen Dental</label>
            <textarea
              id="observaciones_generales"
              value={formData.examen_dental.observaciones_generales}
              onChange={(e) => handleChange('examen_dental', 'observaciones_generales', e.target.value)}
              placeholder="Resumen de hallazgos, prioridades de tratamiento, observaciones relevantes..."
              rows="4"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Periodontograma</h4>
        <p className="section-description">
          Marque con color rojo el límite de las lesiones gingivales y con azul las periodontales
        </p>
        
        <div className="periodontograma-container">
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
                  <input 
                    type="text" 
                    placeholder="PS"
                    className="perio-input"
                  />
                  <input 
                    type="checkbox" 
                    className="perio-checkbox"
                  />
                  <input 
                    type="checkbox" 
                    className="perio-checkbox"
                  />
                  <select className="perio-select">
                    <option value="">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                  <select className="perio-select">
                    <option value="">0</option>
                    <option value="1">I</option>
                    <option value="2">II</option>
                    <option value="3">III</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="observaciones_periodonto">Observaciones del Periodontograma</label>
          <textarea
            id="observaciones_periodonto"
            value={formData.periodontograma.observaciones}
            onChange={(e) => handleChange('periodontograma', 'observaciones', e.target.value)}
            placeholder="Patrones de enfermedad periodontal, distribución de lesiones, pronóstico..."
            rows="4"
          />
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> El examen intrabucal es fundamental para el diagnóstico odontológico. Registre todos los hallazgos de manera sistemática y detallada.</p>
      </div>

      <style jsx>{`
        .estructuras-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .odontograma-container {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .odontograma {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .dientes-superiores,
        .dientes-inferiores {
          display: flex;
          gap: 2px;
        }

        .diente-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
        }

        .numero-diente {
          font-size: 10px;
          font-weight: bold;
          color: #495057;
        }

        .diente-surfaces {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          width: 20px;
          height: 20px;
          border: 1px solid #dee2e6;
          background: white;
          cursor: pointer;
        }

        .surface {
          border: 0.5px solid #dee2e6;
          transition: background-color 0.2s ease;
        }

        .surface:hover {
          background-color: #e9ecef;
        }

        .surface.vestibular { grid-area: 1 / 1 / 2 / 3; }
        .surface.mesial { grid-area: 2 / 1 / 3 / 2; }
        .surface.distal { grid-area: 2 / 2 / 3 / 3; }
        .surface.lingual { grid-area: 3 / 1 / 4 / 3; }

        .placa-legend {
          margin-top: 15px;
          text-align: center;
        }

        .legend-items {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .surface-example {
          width: 20px;
          height: 15px;
          border: 1px solid #dee2e6;
        }

        .surface-example.normal {
          background: white;
        }

        .surface-example.con-placa {
          background: #ff6b6b;
        }

        .odontograma-clinical {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .diente-clinical {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 35px;
          margin: 0 1px;
        }

        .diente-crown {
          width: 25px;
          height: 25px;
          border: 2px solid #333;
          background: white;
          position: relative;
          border-radius: 3px;
        }

        .crown-sections {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .section {
          border: 0.5px solid #ccc;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .section:hover {
          background-color: #f0f0f0;
        }

        .diente-root {
          width: 8px;
          height: 15px;
          background: #e9ecef;
          border: 1px solid #adb5bd;
        }

        .odontograma-legend {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }

        .legend-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .symbol {
          width: 20px;
          height: 15px;
          border: 1px solid #333;
          margin-right: 8px;
        }

        .symbol.caries { background: #ff4757; }
        .symbol.restauracion { background: #5352ed; }
        .symbol.corona { background: #ffa502; }
        .symbol.ausente { background: #000; }
        .symbol.endodoncia { background: #ff6348; }
        .symbol.protesis { background: #70a1ff; }

        .alteracion-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          border: 1px solid #e9ecef;
        }

        .btn-add {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
          transition: background-color 0.3s ease;
        }

        .btn-add:hover {
          background-color: #218838;
        }

        .btn-remove {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          align-self: center;
          transition: background-color 0.3s ease;
        }

        .btn-remove:hover {
          background-color: #c82333;
        }

        .periodontograma-container {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
        }

        .periodonto-chart {
          min-width: 800px;
        }

        .chart-header {
          display: grid;
          grid-template-columns: 60px repeat(5, 1fr);
          gap: 10px;
          padding: 10px;
          background: #e9ecef;
          font-weight: bold;
          border-radius: 4px 4px 0 0;
        }

        .chart-body {
          max-height: 400px;
          overflow-y: auto;
        }

        .chart-row {
          display: grid;
          grid-template-columns: 60px repeat(5, 1fr);
          gap: 10px;
          padding: 8px 10px;
          border-bottom: 1px solid #dee2e6;
          align-items: center;
        }

        .diente-num {
          font-weight: bold;
          text-align: center;
        }

        .perio-input {
          width: 100%;
          padding: 4px;
          border: 1px solid #ced4da;
          border-radius: 3px;
          text-align: center;
          font-size: 12px;
        }

        .perio-checkbox {
          justify-self: center;
        }

        .perio-select {
          width: 100%;
          padding: 4px;
          border: 1px solid #ced4da;
          border-radius: 3px;
          font-size: 12px;
        }

        .encias-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .encias-section h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .dental-odontograma {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .dental-odontograma h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .dental-odontograma h6 {
          color: #6c757d;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .hallazgos-dentales {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
          border: 1px solid #e9ecef;
        }

        .hallazgos-dentales h5 {
          color: #495057;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }

        .section-description {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 20px;
          font-style: italic;
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
          .estructuras-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .dientes-superiores,
          .dientes-inferiores {
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
          }

          .legend-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }

          .periodontograma-container {
            padding: 10px;
          }

          .chart-header,
          .chart-row {
            grid-template-columns: 40px repeat(5, 1fr);
            gap: 5px;
            font-size: 12px;
          }

          .odontograma-clinical {
            padding: 10px;
          }

          .diente-clinical {
            width: 25px;
          }

          .diente-crown {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ExamenIntrabucal;