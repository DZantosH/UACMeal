import React, { useState, useEffect } from 'react';

const AntecedentesHeredoFamiliares = ({ data, onUpdate }) => {
  const [antecedentes, setAntecedentes] = useState([
    { parentesco: 'Padre', padecimientos: '', edad: '', vivo: true },
    { parentesco: 'Madre', padecimientos: '', edad: '', vivo: true },
    { parentesco: 'Hermanos', padecimientos: '', edad: '', vivo: true },
    { parentesco: 'Abuelos paternos', padecimientos: '', edad: '', vivo: true },
    { parentesco: 'Abuelos maternos', padecimientos: '', edad: '', vivo: true },
    { parentesco: 'Tíos', padecimientos: '', edad: '', vivo: true }
  ]);

  const [enfermedadesRelevantes, setEnfermedadesRelevantes] = useState({
    diabetes: false,
    hipertension: false,
    cardiopatias: false,
    cancer: false,
    enfermedades_mentales: false,
    malformaciones_congenitas: false,
    enfermedades_autoinmunes: false,
    alergias: false,
    otras: ''
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      if (data.antecedentes) {
        setAntecedentes(data.antecedentes);
      }
      if (data.enfermedades_relevantes) {
        setEnfermedadesRelevantes(data.enfermedades_relevantes);
      }
    }
  }, [data]);

  const updateData = (newAntecedentes, newEnfermedades) => {
    const updatedData = {
      antecedentes: newAntecedentes || antecedentes,
      enfermedades_relevantes: newEnfermedades || enfermedadesRelevantes
    };
    onUpdate(updatedData);
  };

  const handleAntecedenteChange = (index, field, value) => {
    const newAntecedentes = [...antecedentes];
    newAntecedentes[index] = {
      ...newAntecedentes[index],
      [field]: value
    };
    setAntecedentes(newAntecedentes);
    updateData(newAntecedentes, null);
  };

  const handleEnfermedadChange = (field, value) => {
    const newEnfermedades = {
      ...enfermedadesRelevantes,
      [field]: value
    };
    setEnfermedadesRelevantes(newEnfermedades);
    updateData(null, newEnfermedades);
  };

  const agregarFamiliar = () => {
    const newAntecedentes = [
      ...antecedentes,
      { parentesco: '', padecimientos: '', edad: '', vivo: true }
    ];
    setAntecedentes(newAntecedentes);
    updateData(newAntecedentes, null);
  };

  const eliminarFamiliar = (index) => {
    const newAntecedentes = antecedentes.filter((_, i) => i !== index);
    setAntecedentes(newAntecedentes);
    updateData(newAntecedentes, null);
  };

  const padecimientesComunes = [
    'Diabetes Mellitus',
    'Hipertensión Arterial',
    'Infarto al Miocardio',
    'Cáncer',
    'Asma',
    'Artritis',
    'Osteoporosis',
    'Alzheimer',
    'Epilepsia',
    'Depresión',
    'Obesidad',
    'Tiroides',
    'Riñones',
    'Hígado',
    'Ninguno'
  ];

  return (
    <div className="antecedentes-heredo-familiares">
      <div className="form-section">
        <h4>Antecedentes Familiares por Parentesco</h4>
        <p className="section-description">
          Registre las enfermedades o padecimientos que han presentado sus familiares directos.
        </p>

        <div className="antecedentes-table">
          <div className="table-header">
            <div className="col-parentesco">Parentesco</div>
            <div className="col-padecimientos">Padecimientos</div>
            <div className="col-edad">Edad</div>
            <div className="col-estado">Estado</div>
            <div className="col-acciones">Acciones</div>
          </div>

          {antecedentes.map((antecedente, index) => (
            <div key={index} className="table-row">
              <div className="col-parentesco">
                <input
                  type="text"
                  value={antecedente.parentesco}
                  onChange={(e) => handleAntecedenteChange(index, 'parentesco', e.target.value)}
                  placeholder="Ej: Padre, Hermana mayor"
                />
              </div>

              <div className="col-padecimientos">
                <textarea
                  value={antecedente.padecimientos}
                  onChange={(e) => handleAntecedenteChange(index, 'padecimientos', e.target.value)}
                  placeholder="Describir padecimientos o 'Ninguno'"
                  rows="2"
                />
                <div className="padecimientos-sugeridos">
                  {padecimientosComunes.map((padecimiento) => (
                    <button
                      key={padecimiento}
                      type="button"
                      className="padecimiento-btn"
                      onClick={() => {
                        const currentValue = antecedente.padecimientos;
                        const newValue = currentValue 
                          ? `${currentValue}, ${padecimiento}`
                          : padecimiento;
                        handleAntecedenteChange(index, 'padecimientos', newValue);
                      }}
                    >
                      {padecimiento}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-edad">
                <input
                  type="text"
                  value={antecedente.edad}
                  onChange={(e) => handleAntecedenteChange(index, 'edad', e.target.value)}
                  placeholder="Edad actual o de fallecimiento"
                />
              </div>

              <div className="col-estado">
                <select
                  value={antecedente.vivo}
                  onChange={(e) => handleAntecedenteChange(index, 'vivo', e.target.value === 'true')}
                >
                  <option value={true}>Vivo</option>
                  <option value={false}>Finado</option>
                </select>
              </div>

              <div className="col-acciones">
                {index >= 6 && (
                  <button
                    type="button"
                    onClick={() => eliminarFamiliar(index)}
                    className="btn-eliminar"
                    title="Eliminar familiar"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={agregarFamiliar}
          className="btn-agregar-familiar"
        >
          + Agregar Familiar
        </button>
      </div>

      <div className="form-section">
        <h4>Enfermedades Hereditarias Relevantes</h4>
        <p className="section-description">
          Marque las enfermedades que han presentado familiares directos y que pueden tener componente hereditario.
        </p>

        <div className="enfermedades-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="diabetes"
              checked={enfermedadesRelevantes.diabetes}
              onChange={(e) => handleEnfermedadChange('diabetes', e.target.checked)}
            />
            <label htmlFor="diabetes">Diabetes Mellitus</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="hipertension"
              checked={enfermedadesRelevantes.hipertension}
              onChange={(e) => handleEnfermedadChange('hipertension', e.target.checked)}
            />
            <label htmlFor="hipertension">Hipertensión Arterial</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="cardiopatias"
              checked={enfermedadesRelevantes.cardiopatias}
              onChange={(e) => handleEnfermedadChange('cardiopatias', e.target.checked)}
            />
            <label htmlFor="cardiopatias">Cardiopatías</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="cancer"
              checked={enfermedadesRelevantes.cancer}
              onChange={(e) => handleEnfermedadChange('cancer', e.target.checked)}
            />
            <label htmlFor="cancer">Cáncer</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="enfermedades_mentales"
              checked={enfermedadesRelevantes.enfermedades_mentales}
              onChange={(e) => handleEnfermedadChange('enfermedades_mentales', e.target.checked)}
            />
            <label htmlFor="enfermedades_mentales">Enfermedades Mentales</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="malformaciones_congenitas"
              checked={enfermedadesRelevantes.malformaciones_congenitas}
              onChange={(e) => handleEnfermedadChange('malformaciones_congenitas', e.target.checked)}
            />
            <label htmlFor="malformaciones_congenitas">Malformaciones Congénitas</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="enfermedades_autoinmunes"
              checked={enfermedadesRelevantes.enfermedades_autoinmunes}
              onChange={(e) => handleEnfermedadChange('enfermedades_autoinmunes', e.target.checked)}
            />
            <label htmlFor="enfermedades_autoinmunes">Enfermedades Autoinmunes</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="alergias"
              checked={enfermedadesRelevantes.alergias}
              onChange={(e) => handleEnfermedadChange('alergias', e.target.checked)}
            />
            <label htmlFor="alergias">Alergias Hereditarias</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="otras_enfermedades">Otras Enfermedades Hereditarias</label>
          <textarea
            id="otras_enfermedades"
            value={enfermedadesRelevantes.otras}
            onChange={(e) => handleEnfermedadChange('otras', e.target.value)}
            placeholder="Especifique otras enfermedades hereditarias no mencionadas anteriormente..."
            rows="3"
          />
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> Esta información es crucial para identificar factores de riesgo y planificar tratamientos preventivos. La información hereditaria puede influir en el desarrollo de enfermedades bucales y sistémicas.</p>
      </div>

      <style jsx>{`
        .antecedentes-table {
          background: white;
          border: 1px solid #e1e8ed;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 150px 1fr 100px 80px 60px;
          background-color: #f8f9fa;
          padding: 12px 15px;
          font-weight: 600;
          color: #2c3e50;
          border-bottom: 1px solid #e1e8ed;
          font-size: 14px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 150px 1fr 100px 80px 60px;
          padding: 15px;
          border-bottom: 1px solid #f1f3f4;
          align-items: start;
          gap: 15px;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .col-parentesco input,
        .col-edad input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
        }

        .col-padecimientos textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
          resize: vertical;
        }

        .col-estado select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
        }

        .padecimientos-sugeridos {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }

        .padecimiento-btn {
          padding: 4px 8px;
          border: 1px solid #dee2e6;
          background: #f8f9fa;
          border-radius: 3px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s ease;
        }

        .padecimiento-btn:hover {
          background-color: #e9ecef;
          border-color: #3498db;
        }

        .btn-eliminar {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .btn-eliminar:hover {
          background-color: #f8d7da;
        }

        .btn-agregar-familiar {
          padding: 10px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }

        .btn-agregar-familiar:hover {
          background-color: #2980b9;
        }

        .enfermedades-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .checkbox-group:hover {
          background-color: #f8f9fa;
        }

        .checkbox-group input[type="checkbox"] {
          width: 16px;
          height: 16px;
          margin: 0;
        }

        .checkbox-group label {
          margin: 0;
          cursor: pointer;
          font-size: 14px;
          color: #2c3e50;
        }

        .section-description {
          color: #7f8c8d;
          font-size: 14px;
          margin-bottom: 20px;
          font-style: italic;
        }

        .info-note {
          margin-top: 25px;
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
          padding-bottom: 25px;
          border-bottom: 1px solid #ecf0f1;
        }

        .form-section:last-child {
          border-bottom: none;
        }

        .form-section h4 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 18px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .table-header {
            display: none;
          }

          .table-row {
            border: 1px solid #e1e8ed;
            border-radius: 8px;
            margin-bottom: 10px;
            background: #fafafa;
          }

          .table-row > div::before {
            content: attr(data-label);
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
            color: #2c3e50;
          }

          .enfermedades-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default AntecedentesHeredoFamiliares;