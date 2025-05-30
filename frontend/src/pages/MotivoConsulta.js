import React, { useState, useEffect } from 'react';

const MotivoConsulta = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    motivo_principal: '',
    sintomas_principales: '',
    tiempo_evolucion: '',
    dolor_presente: false,
    intensidad_dolor: '',
    tipo_dolor: '',
    factores_desencadenantes: '',
    factores_atenuantes: '',
    tratamientos_previos: '',
    expectativas_paciente: ''
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData({ ...formData, ...data });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    const newFormData = {
      ...formData,
      [name]: newValue
    };
    
    setFormData(newFormData);
    onUpdate(newFormData);
  };

  const motivosComunes = [
    'Dolor dental',
    'Revisión general',
    'Limpieza dental',
    'Sangrado de encías',
    'Mal aliento',
    'Diente roto o fracturado',
    'Pérdida de empaste',
    'Sensibilidad dental',
    'Inflamación',
    'Emergencia dental',
    'Otro'
  ];

  const tiposDolor = [
    'Punzante',
    'Pulsátil',
    'Continuo',
    'Intermitente',
    'Sordo',
    'Agudo',
    'Quemante',
    'Eléctrico'
  ];

  return (
    <div className="motivo-consulta">
      <div className="form-section">
        <h4>Motivo Principal de la Consulta</h4>
        
        <div className="form-group">
          <label htmlFor="motivo_principal">¿Cuál es el motivo principal de su visita?</label>
          <textarea
            id="motivo_principal"
            name="motivo_principal"
            value={formData.motivo_principal}
            onChange={handleChange}
            placeholder="Describa en sus propias palabras el motivo por el cual solicita atención dental..."
            rows="4"
          />
        </div>

        <div className="motivos-sugeridos">
          <p><strong>Motivos frecuentes:</strong></p>
          <div className="motivos-grid">
            {motivosComunes.map((motivo) => (
              <button
                key={motivo}
                type="button"
                className="motivo-btn"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  motivo_principal: prev.motivo_principal ? 
                    `${prev.motivo_principal}. ${motivo}` : motivo
                }))}
              >
                {motivo}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Descripción de Síntomas</h4>
        
        <div className="form-group">
          <label htmlFor="sintomas_principales">Síntomas Principales</label>
          <textarea
            id="sintomas_principales"
            name="sintomas_principales"
            value={formData.sintomas_principales}
            onChange={handleChange}
            placeholder="Describa detalladamente los síntomas que presenta..."
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tiempo_evolucion">Tiempo de Evolución</label>
            <select
              id="tiempo_evolucion"
              name="tiempo_evolucion"
              value={formData.tiempo_evolucion}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="Menos de 1 día">Menos de 1 día</option>
              <option value="1-3 días">1-3 días</option>
              <option value="1 semana">1 semana</option>
              <option value="2-3 semanas">2-3 semanas</option>
              <option value="1 mes">1 mes</option>
              <option value="2-3 meses">2-3 meses</option>
              <option value="6 meses">6 meses</option>
              <option value="1 año">1 año</option>
              <option value="Más de 1 año">Más de 1 año</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Evaluación del Dolor</h4>
        
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="dolor_presente"
              name="dolor_presente"
              checked={formData.dolor_presente}
              onChange={handleChange}
            />
            <label htmlFor="dolor_presente">¿Presenta dolor actualmente?</label>
          </div>
        </div>

        {formData.dolor_presente && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="intensidad_dolor">Intensidad del Dolor (0-10)</label>
                <div className="dolor-scale">
                  <input
                    type="range"
                    id="intensidad_dolor"
                    name="intensidad_dolor"
                    min="0"
                    max="10"
                    value={formData.intensidad_dolor}
                    onChange={handleChange}
                    className="dolor-slider"
                  />
                  <div className="dolor-labels">
                    <span>0 - Sin dolor</span>
                    <span className="dolor-value">{formData.intensidad_dolor}</span>
                    <span>10 - Dolor insoportable</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo_dolor">Tipo de Dolor</label>
                <select
                  id="tipo_dolor"
                  name="tipo_dolor"
                  value={formData.tipo_dolor}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposDolor.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="factores_desencadenantes">Factores que Desencadenan el Dolor</label>
                <textarea
                  id="factores_desencadenantes"
                  name="factores_desencadenantes"
                  value={formData.factores_desencadenantes}
                  onChange={handleChange}
                  placeholder="Ej: masticar, bebidas frías/calientes, dulces, presión..."
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="factores_atenuantes">Factores que Alivian el Dolor</label>
                <textarea
                  id="factores_atenuantes"
                  name="factores_atenuantes"
                  value={formData.factores_atenuantes}
                  onChange={handleChange}
                  placeholder="Ej: analgésicos, enjuagues, compresas frías/calientes..."
                  rows="2"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h4>Antecedentes del Problema Actual</h4>
        
        <div className="form-group">
          <label htmlFor="tratamientos_previos">Tratamientos Previos para este Problema</label>
          <textarea
            id="tratamientos_previos"
            name="tratamientos_previos"
            value={formData.tratamientos_previos}
            onChange={handleChange}
            placeholder="Mencione si ha recibido algún tratamiento anterior para este problema, medicamentos utilizados, etc..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="expectativas_paciente">Expectativas del Tratamiento</label>
          <textarea
            id="expectativas_paciente"
            name="expectativas_paciente"
            value={formData.expectativas_paciente}
            onChange={handleChange}
            placeholder="¿Qué espera lograr con el tratamiento dental?"
            rows="2"
          />
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> La información proporcionada ayudará al dentista a realizar un diagnóstico más preciso y planificar el mejor tratamiento para su caso.</p>
      </div>

      <style jsx>{`
        .motivos-sugeridos {
          margin-top: 15px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .motivos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .motivo-btn {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .motivo-btn:hover {
          background-color: #e9ecef;
          border-color: #3498db;
        }

        .dolor-scale {
          width: 100%;
        }

        .dolor-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #ddd;
          outline: none;
          -webkit-appearance: none;
        }

        .dolor-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e74c3c;
          cursor: pointer;
        }

        .dolor-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e74c3c;
          cursor: pointer;
          border: none;
        }

        .dolor-labels {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 12px;
          color: #666;
        }

        .dolor-value {
          background: #e74c3c;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
        }

        .info-note {
          margin-top: 20px;
          padding: 15px;
          background-color: #e8f4fd;
          border-left: 4px solid #3498db;
          border-radius: 0 8px 8px 0;
        }

        .info-note p {
          margin: 0;
          color: #2c3e50;
          font-size: 14px;
        }

        .form-section {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ecf0f1;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .form-section h4 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default MotivoConsulta;