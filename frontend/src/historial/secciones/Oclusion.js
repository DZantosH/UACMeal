import React, { useState, useEffect } from 'react';

const Oclusion = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState({
    armonia_maxilares: '',
    arco_superior: {
      amplitud: '',
      boveda_palatina: ''
    },
    arco_inferior: {
      amplitud: ''
    },
    simetria_arco: {
      relacion_anteroposterior_derecho: '',
      relacion_anteroposterior_izquierdo: '',
      relacion_bucolingual_derecho: '',
      relacion_bucolingual_izquierdo: ''
    },
    clasificacion_angle: {
      derecho_molar: '',
      derecho_canino: '',
      izquierdo_molar: '',
      izquierdo_canino: ''
    },
    relacion_dental: {
      sobremordida_vertical: '',
      sobremordida_horizontal: '',
      borde_a_borde: false,
      mordida_abierta: false,
      mordida_cruzada_anterior: false,
      mordida_cruzada_posterior: false,
      descripcion_sobremordida_vertical: '',
      descripcion_sobremordida_horizontal: '',
      descripcion_mordida_abierta: '',
      descripcion_mordida_cruzada_anterior: '',
      descripcion_mordida_cruzada_posterior: ''
    },
    lineas_medias: {
      relacion_linea_media_maxilar: '',
      relacion_linea_media_mandibular: ''
    },
    espaciamiento: {
      diastemas: '',
      apiñamiento: ''
    },
    desgastes: {
      facetas_desgaste: ''
    },
    alteraciones_dentales: {
      forma: '',
      tamaño: '',
      numero: '',
      estructura: '',
      color: '',
      posicion: '',
      erupcion: ''
    }
  });

  // ✅ CORRECTO: useEffect con dependencias correctas
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

  return (
    <div className="oclusion">
      <div className="form-section">
        <h4>Análisis Oclusal</h4>
        <p className="section-description">
          Evaluación completa de la oclusión y relaciones intermaxilares
        </p>
        
        <div className="form-group">
          <label htmlFor="armonia_maxilares">Armonía de los Maxilares</label>
          <textarea
            id="armonia_maxilares"
            value={formData.armonia_maxilares}
            onChange={(e) => handleDirectChange('armonia_maxilares', e.target.value)}
            placeholder="Describe la armonía general entre maxilar superior e inferior..."
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Amplitud del Arco Dentario Superior</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amplitud_superior">Amplitud</label>
            <select
              id="amplitud_superior"
              value={formData.arco_superior.amplitud}
              onChange={(e) => handleChange('arco_superior', 'amplitud', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Amplio (cuadrado)">Amplio (cuadrado)</option>
              <option value="Normal (oval)">Normal (oval)</option>
              <option value="Estrecho (triangular)">Estrecho (triangular)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="boveda_palatina">Bóveda Palatina</label>
            <select
              id="boveda_palatina"
              value={formData.arco_superior.boveda_palatina}
              onChange={(e) => handleChange('arco_superior', 'boveda_palatina', e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Plana">Plana</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Amplitud del Arco Dentario Inferior</h4>
        
        <div className="form-group">
          <label htmlFor="amplitud_inferior">Amplitud</label>
          <select
            id="amplitud_inferior"
            value={formData.arco_inferior.amplitud}
            onChange={(e) => handleChange('arco_inferior', 'amplitud', e.target.value)}
          >
            <option value="">Seleccionar</option>
            <option value="Amplio (cuadrado)">Amplio (cuadrado)</option>
            <option value="Normal (oval)">Normal (oval)</option>
            <option value="Estrecho (triangular)">Estrecho (triangular)</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h4>Simetría del Arco</h4>
        
        <div className="simetria-container">
          <div className="relacion-group">
            <h5>Relación Antero-Posterior</h5>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="anteroposterior_derecho">Derecho (mm)</label>
                <input
                  type="number"
                  id="anteroposterior_derecho"
                  value={formData.simetria_arco.relacion_anteroposterior_derecho}
                  onChange={(e) => handleChange('simetria_arco', 'relacion_anteroposterior_derecho', e.target.value)}
                  placeholder="0"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="anteroposterior_izquierdo">Izquierdo (mm)</label>
                <input
                  type="number"
                  id="anteroposterior_izquierdo"
                  value={formData.simetria_arco.relacion_anteroposterior_izquierdo}
                  onChange={(e) => handleChange('simetria_arco', 'relacion_anteroposterior_izquierdo', e.target.value)}
                  placeholder="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div className="relacion-group">
            <h5>Relación Buco-Lingual</h5>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bucolingual_derecho">Derecho (mm)</label>
                <input
                  type="number"
                  id="bucolingual_derecho"
                  value={formData.simetria_arco.relacion_bucolingual_derecho}
                  onChange={(e) => handleChange('simetria_arco', 'relacion_bucolingual_derecho', e.target.value)}
                  placeholder="0"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bucolingual_izquierdo">Izquierdo (mm)</label>
                <input
                  type="number"
                  id="bucolingual_izquierdo"
                  value={formData.simetria_arco.relacion_bucolingual_izquierdo}
                  onChange={(e) => handleChange('simetria_arco', 'relacion_bucolingual_izquierdo', e.target.value)}
                  placeholder="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Maloclusiones - Clasificación de Angle</h4>
        
        <div className="angle-container">
          <div className="angle-side">
            <h5>Lado Derecho</h5>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="derecho_molar">Molar</label>
                <select
                  id="derecho_molar"
                  value={formData.clasificacion_angle.derecho_molar}
                  onChange={(e) => handleChange('clasificacion_angle', 'derecho_molar', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Clase I">Clase I</option>
                  <option value="Clase II Div 1">Clase II Div 1</option>
                  <option value="Clase II Div 2">Clase II Div 2</option>
                  <option value="Clase III">Clase III</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="derecho_canino">Canino</label>
                <select
                  id="derecho_canino"
                  value={formData.clasificacion_angle.derecho_canino}
                  onChange={(e) => handleChange('clasificacion_angle', 'derecho_canino', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Clase I">Clase I</option>
                  <option value="Clase II">Clase II</option>
                  <option value="Clase III">Clase III</option>
                </select>
              </div>
            </div>
          </div>

          <div className="angle-side">
            <h5>Lado Izquierdo</h5>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="izquierdo_molar">Molar</label>
                <select
                  id="izquierdo_molar"
                  value={formData.clasificacion_angle.izquierdo_molar}
                  onChange={(e) => handleChange('clasificacion_angle', 'izquierdo_molar', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Clase I">Clase I</option>
                  <option value="Clase II Div 1">Clase II Div 1</option>
                  <option value="Clase II Div 2">Clase II Div 2</option>
                  <option value="Clase III">Clase III</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="izquierdo_canino">Canino</label>
                <select
                  id="izquierdo_canino"
                  value={formData.clasificacion_angle.izquierdo_canino}
                  onChange={(e) => handleChange('clasificacion_angle', 'izquierdo_canino', e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="Clase I">Clase I</option>
                  <option value="Clase II">Clase II</option>
                  <option value="Clase III">Clase III</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Relación Dental</h4>
        
        <div className="relacion-dental-grid">
          <div className="relacion-item">
            <label htmlFor="sobremordida_vertical">Sobremordida Vertical (Over Bite) mm</label>
            <input
              type="number"
              id="sobremordida_vertical"
              value={formData.relacion_dental.sobremordida_vertical}
              onChange={(e) => handleChange('relacion_dental', 'sobremordida_vertical', e.target.value)}
              placeholder="2-4 mm normal"
              step="0.1"
            />
            <textarea
              value={formData.relacion_dental.descripcion_sobremordida_vertical}
              onChange={(e) => handleChange('relacion_dental', 'descripcion_sobremordida_vertical', e.target.value)}
              placeholder="Describir características..."
              rows="2"
            />
          </div>

          <div className="relacion-item">
            <label htmlFor="sobremordida_horizontal">Sobremordida Horizontal (Over Jet) mm</label>
            <input
              type="number"
              id="sobremordida_horizontal"
              value={formData.relacion_dental.sobremordida_horizontal}
              onChange={(e) => handleChange('relacion_dental', 'sobremordida_horizontal', e.target.value)}
              placeholder="2-3 mm normal"
              step="0.1"
            />
            <textarea
              value={formData.relacion_dental.descripcion_sobremordida_horizontal}
              onChange={(e) => handleChange('relacion_dental', 'descripcion_sobremordida_horizontal', e.target.value)}
              placeholder="Describir características..."
              rows="2"
            />
          </div>

          <div className="relacion-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="borde_a_borde"
                checked={formData.relacion_dental.borde_a_borde}
                onChange={(e) => handleChange('relacion_dental', 'borde_a_borde', e.target.checked)}
              />
              <label htmlFor="borde_a_borde">Borde a Borde</label>
            </div>
          </div>

          <div className="relacion-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="mordida_abierta"
                checked={formData.relacion_dental.mordida_abierta}
                onChange={(e) => handleChange('relacion_dental', 'mordida_abierta', e.target.checked)}
              />
              <label htmlFor="mordida_abierta">Mordida Abierta</label>
            </div>
            {formData.relacion_dental.mordida_abierta && (
              <textarea
                value={formData.relacion_dental.descripcion_mordida_abierta}
                onChange={(e) => handleChange('relacion_dental', 'descripcion_mordida_abierta', e.target.value)}
                placeholder="Localización y medidas..."
                rows="2"
              />
            )}
          </div>

          <div className="relacion-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="mordida_cruzada_anterior"
                checked={formData.relacion_dental.mordida_cruzada_anterior}
                onChange={(e) => handleChange('relacion_dental', 'mordida_cruzada_anterior', e.target.checked)}
              />
              <label htmlFor="mordida_cruzada_anterior">Mordida Cruzada Anterior</label>
            </div>
            {formData.relacion_dental.mordida_cruzada_anterior && (
              <textarea
                value={formData.relacion_dental.descripcion_mordida_cruzada_anterior}
                onChange={(e) => handleChange('relacion_dental', 'descripcion_mordida_cruzada_anterior', e.target.value)}
                placeholder="Dientes involucrados..."
                rows="2"
              />
            )}
          </div>

          <div className="relacion-item">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="mordida_cruzada_posterior"
                checked={formData.relacion_dental.mordida_cruzada_posterior}
                onChange={(e) => handleChange('relacion_dental', 'mordida_cruzada_posterior', e.target.checked)}
              />
              <label htmlFor="mordida_cruzada_posterior">Mordida Cruzada Posterior</label>
            </div>
            {formData.relacion_dental.mordida_cruzada_posterior && (
              <textarea
                value={formData.relacion_dental.descripcion_mordida_cruzada_posterior}
                onChange={(e) => handleChange('relacion_dental', 'descripcion_mordida_cruzada_posterior', e.target.value)}
                placeholder="Ubicación y tipo (vestibular/lingual)..."
                rows="2"
              />
            )}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Líneas Medias</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="linea_media_maxilar">Relación de la Línea Media Maxilar</label>
            <textarea
              id="linea_media_maxilar"
              value={formData.lineas_medias.relacion_linea_media_maxilar}
              onChange={(e) => handleChange('lineas_medias', 'relacion_linea_media_maxilar', e.target.value)}
              placeholder="Coincidente con línea media facial, desviada derecha/izquierda..."
              rows="2"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="linea_media_mandibular">Relación de la Línea Media Mandibular</label>
            <textarea
              id="linea_media_mandibular"
              value={formData.lineas_medias.relacion_linea_media_mandibular}
              onChange={(e) => handleChange('lineas_medias', 'relacion_linea_media_mandibular', e.target.value)}
              placeholder="Coincidente con maxilar, desviada derecha/izquierda..."
              rows="2"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Espaciamiento Dental</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="diastemas">Diastemas</label>
            <textarea
              id="diastemas"
              value={formData.espaciamiento.diastemas}
              onChange={(e) => handleChange('espaciamiento', 'diastemas', e.target.value)}
              placeholder="Localización y medidas de espacios entre dientes..."
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apiñamiento">Apiñamiento</label>
            <textarea
              id="apiñamiento"
              value={formData.espaciamiento.apiñamiento}
              onChange={(e) => handleChange('espaciamiento', 'apiñamiento', e.target.value)}
              placeholder="Severidad y localización del apiñamiento dental..."
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Facetas de Desgaste</h4>
        
        <div className="form-group">
          <label htmlFor="facetas_desgaste">Descripción de Facetas de Desgaste</label>
          <textarea
            id="facetas_desgaste"
            value={formData.desgastes.facetas_desgaste}
            onChange={(e) => handleChange('desgastes', 'facetas_desgaste', e.target.value)}
            placeholder="Localización, severidad y patrón de desgaste dental..."
            rows="4"
          />
        </div>
      </div>

      <div className="form-section">
        <h4>Alteraciones Dentales</h4>
        <p className="section-description">
          Forma, tamaño, número, estructura, color, posición, erupción
        </p>
        
        <div className="alteraciones-grid">
          <div className="form-group">
            <label htmlFor="forma_dental">Forma</label>
            <textarea
              id="forma_dental"
              value={formData.alteraciones_dentales.forma}
              onChange={(e) => handleChange('alteraciones_dentales', 'forma', e.target.value)}
              placeholder="Malformaciones, dientes cónicos, etc."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tamaño_dental">Tamaño</label>
            <textarea
              id="tamaño_dental"
              value={formData.alteraciones_dentales.tamaño}
              onChange={(e) => handleChange('alteraciones_dentales', 'tamaño', e.target.value)}
              placeholder="Microdoncia, macrodoncia..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numero_dental">Número</label>
            <textarea
              id="numero_dental"
              value={formData.alteraciones_dentales.numero}
              onChange={(e) => handleChange('alteraciones_dentales', 'numero', e.target.value)}
              placeholder="Agenesias, supernumerarios..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="estructura_dental">Estructura</label>
            <textarea
              id="estructura_dental"
              value={formData.alteraciones_dentales.estructura}
              onChange={(e) => handleChange('alteraciones_dentales', 'estructura', e.target.value)}
              placeholder="Amelogénesis imperfecta, fluorosis..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="color_dental">Color</label>
            <textarea
              id="color_dental"
              value={formData.alteraciones_dentales.color}
              onChange={(e) => handleChange('alteraciones_dentales', 'color', e.target.value)}
              placeholder="Tinciones, decoloraciones..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="posicion_dental">Posición</label>
            <textarea
              id="posicion_dental"
              value={formData.alteraciones_dentales.posicion}
              onChange={(e) => handleChange('alteraciones_dentales', 'posicion', e.target.value)}
              placeholder="Malposiciones, rotaciones, inclinaciones..."
              rows="2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="erupcion_dental">Erupción</label>
            <textarea
              id="erupcion_dental"
              value={formData.alteraciones_dentales.erupcion}
              onChange={(e) => handleChange('alteraciones_dentales', 'erupcion', e.target.value)}
              placeholder="Erupciones ectópicas, retrasadas, impactaciones..."
              rows="2"
            />
          </div>
        </div>
      </div>

      <div className="info-note">
        <p><strong>Importante:</strong> El análisis oclusal es fundamental para el diagnóstico ortodóncico y la planificación de tratamientos restaurativos. Registre todas las relaciones oclusales de manera precisa.</p>
      </div>
    </div>
  );
};

export default Oclusion;