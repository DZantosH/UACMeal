import React, { useState, useEffect, useCallback } from 'react';

const ExamenExtrabucal = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Habitus exterior
    habitus_exterior: '',
    
    // Somatometría
    somatometria: {
      peso: '',
      talla: '',
      imc: ''
    },
    
    // Signos vitales
    signos_vitales: {
      temperatura: '',
      tension_arterial_sistolica: '',
      tension_arterial_diastolica: '',
      frecuencia_respiratoria: '',
      frecuencia_cardiaca: '',
      pulso: ''
    },
    
    // Cabeza
    cabeza: {
      craneo: '',
      biotipo_facial: '',
      perfil: ''
    },
    
    // Cadenas ganglionares
    cadenas_ganglionares: {
      cervicales_anteriores: '',
      cervicales_posteriores: '',
      occipitales: '',
      periauriculares: '',
      parotideos: '',
      submentonianas: '',
      submandibulares: ''
    },
    
    // Tiroides
    tiroides: '',
    
    // Músculos del cuello
    musculos_cuello: {
      esternocleidomastoideo: '',
      subclavio: '',
      trapecios: ''
    },
    
    // ATM
    atm: {
      alteracion: '',
      apertura_maxima: '',
      lateralidad_derecha: '',
      lateralidad_izquierda: '',
      masticacion_bilateral: null,
      descripcion_masticacion: ''
    },
    
    // Músculos faciales
    musculos_faciales: {
      masetero: '',
      temporal: '',
      borla_menton: '',
      orbicular_labios: '',
      risorio_santorini: ''
    },
    
    // Piel
    piel: {
      color: '',
      integridad: '',
      pigmentaciones: '',
      nevos: ''
    },
    
    // Estructuras faciales
    estructuras_faciales: {
      frente: '',
      cejas: '',
      ojos: '',
      nariz: '',
      orejas: '',
      labios: ''
    }
  });

  // ✅ useEffect con dependencias correctas
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData(prevData => ({ ...prevData, ...data }));
    }
  }, [data]);

  // ✅ handleChange estable con useCallback
  const handleChange = useCallback((section, field, value) => {
    const newFormData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(newFormData);
    onUpdate(newFormData);
  }, [formData, onUpdate]);

  const handleDirectChange = useCallback((field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
    onUpdate(newFormData);
  }, [formData, onUpdate]);

  // ✅ useEffect con dependencias correctas para cálculo de IMC
  useEffect(() => {
    const peso = parseFloat(formData.somatometria.peso);
    const tallaMetros = parseFloat(formData.somatometria.talla) / 100;
    
    if (peso && tallaMetros && tallaMetros > 0) {
      const imc = (peso / (tallaMetros * tallaMetros)).toFixed(1);
      if (imc !== formData.somatometria.imc) {
        handleChange('somatometria', 'imc', imc);
      }
    }
  }, [formData.somatometria.peso, formData.somatometria.talla, formData.somatometria.imc, handleChange]);

  const getImcClassification = (imc) => {
    const imcValue = parseFloat(imc);
    if (imcValue < 18.5) return 'Bajo peso';
    if (imcValue < 25) return 'Normal';
    if (imcValue < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  return (
    <div className="examen-extrabucal">
      <div className="form-section">
        <h4>Habitus Exterior</h4>
        <p className="section-description">
          Facies, marcha, lenguaje verbal y corporal, actitud
        </p>
        
        <div className="form-group">
          <label htmlFor="habitus_exterior">Descripción del Habitus Exterior</label>
          <textarea
            id="habitus_exterior"
            value={formData.habitus_exterior}
            onChange={(e) => handleDirectChange('habitus_exterior', e.target.value)}
            placeholder="Describa la apariencia general del paciente, su estado de ánimo, cooperación, facies característica..."
            rows="4"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Somatometría</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="peso">Peso (kg)</label>
            <input
              type="number"
              id="peso"
              value={formData.somatometria.peso}
              onChange={(e) => handleChange('somatometria', 'peso', e.target.value)}
              placeholder="70.5"
              step="0.1"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="talla">Talla (cm)</label>
            <input
              type="number"
              id="talla"
              value={formData.somatometria.talla}
              onChange={(e) => handleChange('somatometria', 'talla', e.target.value)}
              placeholder="170"
              step="0.1"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="imc">IMC</label>
            <div className="imc-container">
              <input
                type="text"
                id="imc"
                value={formData.somatometria.imc}
                readOnly
                className="imc-input"
                placeholder="Calculado automáticamente"
              />
              {formData.somatometria.imc && (
                <span className={`imc-classification ${getImcClassification(formData.somatometria.imc).toLowerCase().replace(' ', '-')}`}>
                  {getImcClassification(formData.somatometria.imc)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Signos Vitales</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="temperatura">Temperatura (°C)</label>
            <input
              type="number"
              id="temperatura"
              value={formData.signos_vitales.temperatura}
              onChange={(e) => handleChange('signos_vitales', 'temperatura', e.target.value)}
              placeholder="36.5"
              step="0.1"
              min="35"
              max="42"
            />
          </div>
          
          <div className="form-group">
            <label>Tensión Arterial (mmHg)</label>
            <div className="tension-arterial">
              <input
                type="number"
                value={formData.signos_vitales.tension_arterial_sistolica}
                onChange={(e) => handleChange('signos_vitales', 'tension_arterial_sistolica', e.target.value)}
                placeholder="120"
                min="80"
                max="200"
              />
              <span>/</span>
              <input
                type="number"
                value={formData.signos_vitales.tension_arterial_diastolica}
                onChange={(e) => handleChange('signos_vitales', 'tension_arterial_diastolica', e.target.value)}
                placeholder="80"
                min="40"
                max="120"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="frecuencia_respiratoria">Frecuencia Respiratoria (por minuto)</label>
            <input
              type="number"
              id="frecuencia_respiratoria"
              value={formData.signos_vitales.frecuencia_respiratoria}
              onChange={(e) => handleChange('signos_vitales', 'frecuencia_respiratoria', e.target.value)}
              placeholder="16"
              min="10"
              max="30"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="frecuencia_cardiaca">Frecuencia Cardíaca (por minuto)</label>
            <input
              type="number"
              id="frecuencia_cardiaca"
              value={formData.signos_vitales.frecuencia_cardiaca}
              onChange={(e) => handleChange('signos_vitales', 'frecuencia_cardiaca', e.target.value)}
              placeholder="72"
              min="40"
              max="120"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pulso">Pulso (por minuto)</label>
            <input
              type="number"
              id="pulso"
              value={formData.signos_vitales.pulso}
              onChange={(e) => handleChange('signos_vitales', 'pulso', e.target.value)}
              placeholder="72"
              min="40"
              max="120"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Cabeza</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="craneo">Cráneo</label>
            <select
              id="craneo"
              value={formData.cabeza.craneo}
              onChange={(e) => handleChange('cabeza', 'craneo', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Braquicéfalo">Braquicéfalo</option>
              <option value="Mesocéfalo">Mesocéfalo</option>
              <option value="Dolicocéfalo">Dolicocéfalo</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="biotipo_facial">Biotipo Facial</label>
            <select
              id="biotipo_facial"
              value={formData.cabeza.biotipo_facial}
              onChange={(e) => handleChange('cabeza', 'biotipo_facial', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Braquifacial">Braquifacial</option>
              <option value="Mesofacial">Mesofacial</option>
              <option value="Dolicofacial">Dolicofacial</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="perfil">Perfil</label>
            <select
              id="perfil"
              value={formData.cabeza.perfil}
              onChange={(e) => handleChange('cabeza', 'perfil', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Recto">Recto</option>
              <option value="Cóncavo">Cóncavo</option>
              <option value="Convexo">Convexo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Cadenas Ganglionares</h4>
        <p className="section-description">
          Anotar solo si existe alguna alteración
        </p>
        
        <div className="ganglionares-grid">
          {Object.keys(formData.cadenas_ganglionares).map((cadena) => (
            <div key={cadena} className="form-group">
              <label htmlFor={cadena}>
                {cadena.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <textarea
                id={cadena}
                value={formData.cadenas_ganglionares[cadena]}
                onChange={(e) => handleChange('cadenas_ganglionares', cadena, e.target.value)}
                placeholder="Describir alteración o dejar vacío si normal"
                rows="2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>Tiroides</h4>
        
        <div className="form-group">
          <label htmlFor="tiroides">Examen de Tiroides</label>
          <textarea
            id="tiroides"
            value={formData.tiroides}
            onChange={(e) => handleDirectChange('tiroides', e.target.value)}
            placeholder="Anotar solo si existe alguna alteración. Describir tamaño, consistencia, movilidad..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Músculos del Cuello</h4>
        <p className="section-description">
          Descripción de alteración (trismus, cansancio, atónicos, espásticos, hipotónicos, hipertónicos, parestesia, paresia, atróficos, hipertróficos, dolor)
        </p>
        
        <div className="musculos-grid">
          {Object.keys(formData.musculos_cuello).map((musculo) => (
            <div key={musculo} className="form-group">
              <label htmlFor={musculo}>
                {musculo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <textarea
                id={musculo}
                value={formData.musculos_cuello[musculo]}
                onChange={(e) => handleChange('musculos_cuello', musculo, e.target.value)}
                placeholder="Describir alteración o 'Normal'"
                rows="2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>Articulación Temporo-Mandibular (ATM)</h4>
        
        <div className="form-group">
          <label htmlFor="atm_alteracion">Descripción de Alteraciones</label>
          <textarea
            id="atm_alteracion"
            value={formData.atm.alteracion}
            onChange={(e) => handleChange('atm', 'alteracion', e.target.value)}
            placeholder="Anotar si existe alteración y describirla (chasquidos, crepitación, dolor, limitación...)"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="apertura_maxima">Apertura Máxima (mm)</label>
            <input
              type="number"
              id="apertura_maxima"
              value={formData.atm.apertura_maxima}
              onChange={(e) => handleChange('atm', 'apertura_maxima', e.target.value)}
              placeholder="45-50"
              min="0"
              max="80"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lateralidad_derecha">Lateralidad Derecha (mm)</label>
            <input
              type="number"
              id="lateralidad_derecha"
              value={formData.atm.lateralidad_derecha}
              onChange={(e) => handleChange('atm', 'lateralidad_derecha', e.target.value)}
              placeholder="10-12"
              min="0"
              max="20"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lateralidad_izquierda">Lateralidad Izquierda (mm)</label>
            <input
              type="number"
              id="lateralidad_izquierda"
              value={formData.atm.lateralidad_izquierda}
              onChange={(e) => handleChange('atm', 'lateralidad_izquierda', e.target.value)}
              placeholder="10-12"
              min="0"
              max="20"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Masticación bilateral</label>
          <div className="radio-group">
            <div className="radio-option">
              <input
                type="radio"
                id="masticacion_si"
                name="masticacion_bilateral"
                checked={formData.atm.masticacion_bilateral === true}
                onChange={() => handleChange('atm', 'masticacion_bilateral', true)}
              />
              <label htmlFor="masticacion_si">Sí</label>
            </div>
            <div className="radio-option">
              <input
                type="radio"
                id="masticacion_no"
                name="masticacion_bilateral"
                checked={formData.atm.masticacion_bilateral === false}
                onChange={() => handleChange('atm', 'masticacion_bilateral', false)}
              />
              <label htmlFor="masticacion_no">No</label>
            </div>
          </div>
        </div>

        {formData.atm.masticacion_bilateral === false && (
          <div className="form-group">
            <label htmlFor="descripcion_masticacion">Descripción de la masticación</label>
            <textarea
              id="descripcion_masticacion"
              value={formData.atm.descripcion_masticacion}
              onChange={(e) => handleChange('atm', 'descripcion_masticacion', e.target.value)}
              placeholder="Describir el patrón de masticación (unilateral derecha, izquierda, anterior...)"
              rows="2"
            />
          </div>
        )}
      </div>

      <div className="form-section">
        <h4>Músculos Faciales</h4>
        <p className="section-description">
          Descripción de alteración (trismus, cansancio, astenia, atónicos, espásticos, hipotónicos, hipertónicos, parestesia, paresia, atróficos, hipertróficos, dolor)
        </p>
        
        <div className="musculos-grid">
          {Object.keys(formData.musculos_faciales).map((musculo) => (
            <div key={musculo} className="form-group">
              <label htmlFor={musculo}>
                {musculo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <textarea
                id={musculo}
                value={formData.musculos_faciales[musculo]}
                onChange={(e) => handleChange('musculos_faciales', musculo, e.target.value)}
                placeholder="Describir alteración o 'Normal'"
                rows="2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <h4>Piel</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color_piel">Color</label>
            <input
              type="text"
              id="color_piel"
              value={formData.piel.color}
              onChange={(e) => handleChange('piel', 'color', e.target.value)}
              placeholder="Normal, pálida, ictérica, cianótica..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="integridad_piel">Integridad</label>
            <input
              type="text"
              id="integridad_piel"
              value={formData.piel.integridad}
              onChange={(e) => handleChange('piel', 'integridad', e.target.value)}
              placeholder="Íntegra, lesiones, cicatrices..."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="pigmentaciones">Pigmentaciones</label>
            <input
              type="text"
              id="pigmentaciones"
              value={formData.piel.pigmentaciones}
              onChange={(e) => handleChange('piel', 'pigmentaciones', e.target.value)}
              placeholder="Manchas, hiperpigmentación, vitíligo..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="nevos">Nevos</label>
            <input
              type="text"
              id="nevos"
              value={formData.piel.nevos}
              onChange={(e) => handleChange('piel', 'nevos', e.target.value)}
              placeholder="Ubicación y características de lunares..."
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Estructuras Faciales</h4>
        
        <div className="estructuras-grid">
          {Object.keys(formData.estructuras_faciales).map((estructura) => (
            <div key={estructura} className="form-group">
              <label htmlFor={estructura}>
                {estructura.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <textarea
                id={estructura}
                value={formData.estructuras_faciales[estructura]}
                onChange={(e) => handleChange('estructuras_faciales', estructura, e.target.value)}
                placeholder="Describir alteración o características relevantes"
                rows="2"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="info-note">
        <p><strong>Nota:</strong> El examen extrabucal permite identificar signos sistémicos que pueden influir en el tratamiento dental y detectar patologías que requieran interconsulta médica.</p>
      </div>

      <style jsx>{`
        .imc-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .imc-input {
          background-color: #f8f9fa;
          border: 2px solid #e9ecef;
        }

        .imc-classification {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .imc-classification.bajo-peso {
          background-color: #cce5ff;
          color: #0066cc;
        }

        .imc-classification.normal {
          background-color: #d4edda;
          color: #155724;
        }

        .imc-classification.sobrepeso {
          background-color: #fff3cd;
          color: #856404;
        }

        .imc-classification.obesidad {
          background-color: #f8d7da;
          color: #721c24;
        }

        .tension-arterial {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .tension-arterial input {
          width: 70px;
        }

        .tension-arterial span {
          font-weight: bold;
          color: #495057;
        }

        .ganglionares-grid,
        .musculos-grid,
        .estructuras-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .radio-group {
          display: flex;
          gap: 20px;
          margin-top: 5px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .radio-option input[type="radio"] {
          width: 16px;
          height: 16px;
          margin: 0;
        }

        .radio-option label {
          margin: 0;
          cursor: pointer;
          font-size: 14px;
          color: #2c3e50;
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
          .ganglionares-grid,
          .musculos-grid,
          .estructuras-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .tension-arterial {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .tension-arterial input {
            width: 100%;
          }

          .imc-container {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .radio-group {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ExamenExtrabucal;