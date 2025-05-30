import React, { useState, useEffect } from 'react';

const AntecedentesPersonalesNoPatologicos = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    // Accesibilidad a servicios públicos
    servicios_publicos: {
      drenaje: false,
      agua: false,
      luz: false,
      telefono: false,
      otros: ''
    },
    
    // Hábitus
    tipo_vivienda: '',
    riesgos_ambientales: '',
    convivencia_mascotas: '',
    
    // Hábitos de higiene
    higiene: {
      general: '',
      bucal: ''
    },
    
    // Hábitos alimentarios
    alimentarios: {
      numero_comidas: '',
      cantidad_agua: '',
      desayuno: '',
      comida: '',
      cena: '',
      entre_comidas: '',
      riesgo_cardiovascular: false,
      riesgo_litiasis: false,
      riesgo_colesterol: false,
      riesgo_desnutricion: false,
      riesgo_obesidad: false,
      riesgo_caries: false,
      riesgo_periodontitis: false
    },
    
    // Hábitos perniciosos
    habitos_perniciosos: {
      alcoholismo: false,
      tabaquismo: false,
      otras_adicciones: false,
      descripcion_adicciones: ''
    },
    
    // Hábitos orales
    habitos_orales: {
      onicofagia: false,
      succion_digital: false,
      morder_objetos: false,
      bricomania: false,
      bruxismo: false,
      respirador_bucal: false,
      otros: ''
    }
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setFormData({ ...formData, ...data });
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

  return (
    <div className="antecedentes-no-patologicos">
      <div className="form-section">
        <h4>Accesibilidad a Servicios Públicos</h4>
        <div className="servicios-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="drenaje"
              checked={formData.servicios_publicos.drenaje}
              onChange={(e) => handleChange('servicios_publicos', 'drenaje', e.target.checked)}
            />
            <label htmlFor="drenaje">Drenaje</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="agua"
              checked={formData.servicios_publicos.agua}
              onChange={(e) => handleChange('servicios_publicos', 'agua', e.target.checked)}
            />
            <label htmlFor="agua">Agua Potable</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="luz"
              checked={formData.servicios_publicos.luz}
              onChange={(e) => handleChange('servicios_publicos', 'luz', e.target.checked)}
            />
            <label htmlFor="luz">Energía Eléctrica</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="telefono"
              checked={formData.servicios_publicos.telefono}
              onChange={(e) => handleChange('servicios_publicos', 'telefono', e.target.checked)}
            />
            <label htmlFor="telefono">Teléfono</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="otros_servicios">Otros Servicios</label>
          <input
            type="text"
            id="otros_servicios"
            value={formData.servicios_publicos.otros}
            onChange={(e) => handleChange('servicios_publicos', 'otros', e.target.value)}
            placeholder="Internet, cable, gas natural, etc."
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Hábitus y Vivienda</h4>
        
        <div className="form-group">
          <label htmlFor="tipo_vivienda">Tipo de Vivienda</label>
          <select
            id="tipo_vivienda"
            value={formData.tipo_vivienda}
            onChange={(e) => handleDirectChange('tipo_vivienda', e.target.value)}
          >
            <option value="">Seleccionar</option>
            <option value="Casa propia">Casa propia</option>
            <option value="Casa rentada">Casa rentada</option>
            <option value="Departamento propio">Departamento propio</option>
            <option value="Departamento rentado">Departamento rentado</option>
            <option value="Casa familiar">Casa familiar</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="riesgos_ambientales">Riesgos Ambientales</label>
          <textarea
            id="riesgos_ambientales"
            value={formData.riesgos_ambientales}
            onChange={(e) => handleDirectChange('riesgos_ambientales', e.target.value)}
            placeholder="Contaminación, ruido, químicos, radiación, etc."
            rows="2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="convivencia_mascotas">Convivencia con Mascotas</label>
          <input
            type="text"
            id="convivencia_mascotas"
            value={formData.convivencia_mascotas}
            onChange={(e) => handleDirectChange('convivencia_mascotas', e.target.value)}
            placeholder="Tipo y número de mascotas o 'Ninguna'"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Hábitos de Higiene</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="higiene_general">Higiene General</label>
            <textarea
              id="higiene_general"
              value={formData.higiene.general}
              onChange={(e) => handleChange('higiene', 'general', e.target.value)}
              placeholder="Frecuencia de baño, cambio de ropa, etc."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="higiene_bucal">Higiene Bucal</label>
            <textarea
              id="higiene_bucal"
              value={formData.higiene.bucal}
              onChange={(e) => handleChange('higiene', 'bucal', e.target.value)}
              placeholder="Frecuencia de cepillado, uso de hilo dental, enjuague, etc."
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Hábitos Alimentarios</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numero_comidas">Número de Comidas al Día</label>
            <select
              id="numero_comidas"
              value={formData.alimentarios.numero_comidas}
              onChange={(e) => handleChange('alimentarios', 'numero_comidas', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="1">1 comida</option>
              <option value="2">2 comidas</option>
              <option value="3">3 comidas</option>
              <option value="4">4 comidas</option>
              <option value="5">5 o más comidas</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cantidad_agua">Cantidad de Agua por Día (litros)</label>
            <input
              type="number"
              id="cantidad_agua"
              value={formData.alimentarios.cantidad_agua}
              onChange={(e) => handleChange('alimentarios', 'cantidad_agua', e.target.value)}
              placeholder="1.5"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <div className="comidas-detalle">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="desayuno">Desayuno</label>
              <textarea
                id="desayuno"
                value={formData.alimentarios.desayuno}
                onChange={(e) => handleChange('alimentarios', 'desayuno', e.target.value)}
                placeholder="Descripción del desayuno habitual"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comida">Comida</label>
              <textarea
                id="comida"
                value={formData.alimentarios.comida}
                onChange={(e) => handleChange('alimentarios', 'comida', e.target.value)}
                placeholder="Descripción de la comida habitual"
                rows="2"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cena">Cena</label>
              <textarea
                id="cena"
                value={formData.alimentarios.cena}
                onChange={(e) => handleChange('alimentarios', 'cena', e.target.value)}
                placeholder="Descripción de la cena habitual"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="entre_comidas">Entre Comidas</label>
              <textarea
                id="entre_comidas"
                value={formData.alimentarios.entre_comidas}
                onChange={(e) => handleChange('alimentarios', 'entre_comidas', e.target.value)}
                placeholder="Snacks, colaciones, bebidas, etc."
                rows="2"
              />
            </div>
          </div>
        </div>

        <div className="riesgos-alimentarios">
          <h5>Tipo de riesgo que presenta el paciente de acuerdo a sus hábitos alimenticios:</h5>
          <div className="riesgos-grid">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_cardiovascular"
                checked={formData.alimentarios.riesgo_cardiovascular}
                onChange={(e) => handleChange('alimentarios', 'riesgo_cardiovascular', e.target.checked)}
              />
              <label htmlFor="riesgo_cardiovascular">Cardiovascular</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_litiasis"
                checked={formData.alimentarios.riesgo_litiasis}
                onChange={(e) => handleChange('alimentarios', 'riesgo_litiasis', e.target.checked)}
              />
              <label htmlFor="riesgo_litiasis">Litiasis renal</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_colesterol"
                checked={formData.alimentarios.riesgo_colesterol}
                onChange={(e) => handleChange('alimentarios', 'riesgo_colesterol', e.target.checked)}
              />
              <label htmlFor="riesgo_colesterol">Colesterol y triglicéridos altos</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_desnutricion"
                checked={formData.alimentarios.riesgo_desnutricion}
                onChange={(e) => handleChange('alimentarios', 'riesgo_desnutricion', e.target.checked)}
              />
              <label htmlFor="riesgo_desnutricion">Desnutrición</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_obesidad"
                checked={formData.alimentarios.riesgo_obesidad}
                onChange={(e) => handleChange('alimentarios', 'riesgo_obesidad', e.target.checked)}
              />
              <label htmlFor="riesgo_obesidad">Obesidad</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_caries"
                checked={formData.alimentarios.riesgo_caries}
                onChange={(e) => handleChange('alimentarios', 'riesgo_caries', e.target.checked)}
              />
              <label htmlFor="riesgo_caries">Riesgo para caries</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="riesgo_periodontitis"
                checked={formData.alimentarios.riesgo_periodontitis}
                onChange={(e) => handleChange('alimentarios', 'riesgo_periodontitis', e.target.checked)}
              />
              <label htmlFor="riesgo_periodontitis">Riesgo periodontitis</label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Hábitos Perniciosos</h4>
        
        <div className="habitos-perniciosos-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="alcoholismo"
              checked={formData.habitos_perniciosos.alcoholismo}
              onChange={(e) => handleChange('habitos_perniciosos', 'alcoholismo', e.target.checked)}
            />
            <label htmlFor="alcoholismo">Alcoholismo</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="tabaquismo"
              checked={formData.habitos_perniciosos.tabaquismo}
              onChange={(e) => handleChange('habitos_perniciosos', 'tabaquismo', e.target.checked)}
            />
            <label htmlFor="tabaquismo">Tabaquismo</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="otras_adicciones"
              checked={formData.habitos_perniciosos.otras_adicciones}
              onChange={(e) => handleChange('habitos_perniciosos', 'otras_adicciones', e.target.checked)}
            />
            <label htmlFor="otras_adicciones">Otras Adicciones</label>
          </div>
        </div>

        {formData.habitos_perniciosos.otras_adicciones && (
          <div className="form-group">
            <label htmlFor="descripcion_adicciones">Descripción de Otras Adicciones</label>
            <textarea
              id="descripcion_adicciones"
              value={formData.habitos_perniciosos.descripcion_adicciones}
              onChange={(e) => handleChange('habitos_perniciosos', 'descripcion_adicciones', e.target.value)}
              placeholder="Especifique las adicciones..."
              rows="2"
            />
          </div>
        )}
      </div>

      <div className="form-section">
        <h4>Hábitos Orales</h4>
        
        <div className="habitos-orales-grid">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="onicofagia"
              checked={formData.habitos_orales.onicofagia}
              onChange={(e) => handleChange('habitos_orales', 'onicofagia', e.target.checked)}
            />
            <label htmlFor="onicofagia">Onicofagia (morderse las uñas)</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="succion_digital"
              checked={formData.habitos_orales.succion_digital}
              onChange={(e) => handleChange('habitos_orales', 'succion_digital', e.target.checked)}
            />
            <label htmlFor="succion_digital">Succión Digital</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="morder_objetos"
              checked={formData.habitos_orales.morder_objetos}
              onChange={(e) => handleChange('habitos_orales', 'morder_objetos', e.target.checked)}
            />
            <label htmlFor="morder_objetos">Morder Objetos</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="bricomania"
              checked={formData.habitos_orales.bricomania}
              onChange={(e) => handleChange('habitos_orales', 'bricomania', e.target.checked)}
            />
            <label htmlFor="bricomania">Bricomania</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="bruxismo"
              checked={formData.habitos_orales.bruxismo}
              onChange={(e) => handleChange('habitos_orales', 'bruxismo', e.target.checked)}
            />
            <label htmlFor="bruxismo">Bruxismo</label>
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="respirador_bucal"
              checked={formData.habitos_orales.respirador_bucal}
              onChange={(e) => handleChange('habitos_orales', 'respirador_bucal', e.target.checked)}
            />
            <label htmlFor="respirador_bucal">Respirador Bucal</label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="otros_habitos_orales">Otros Hábitos Orales</label>
          <textarea
            id="otros_habitos_orales"
            value={formData.habitos_orales.otros}
            onChange={(e) => handleChange('habitos_orales', 'otros', e.target.value)}
            placeholder="Especifique otros hábitos orales observados..."
            rows="2"
          />
        </div>
      </div>

      <style jsx>{`
        .servicios-grid,
        .riesgos-grid,
        .habitos-perniciosos-grid,
        .habitos-orales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

        .form-section h5 {
          color: #34495e;
          margin-bottom: 15px;
          font-size: 16px;
          font-weight: 500;
        }

        .riesgos-alimentarios {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        .comidas-detalle {
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .servicios-grid,
          .riesgos-grid,
          .habitos-perniciosos-grid,
          .habitos-orales-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default AntecedentesPersonalesNoPatologicos;