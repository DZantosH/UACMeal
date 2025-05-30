import React, { useState, useEffect } from 'react';

const FichaIdentificacion = ({ data, onUpdate, pacienteInfo }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    sexo: '',
    fecha_nacimiento: '',
    lugar_nacimiento: '',
    lugar_procedencia: '',
    grupo_etnico: '',
    religion: '',
    rfc: '',
    direccion: '',
    telefono: '',
    celular: '',
    correo_electronico: '',
    derecho_habiente: false,
    institucion: '',
    numero_filiacion: ''
  });

  useEffect(() => {
    // Pre-llenar con datos del paciente o datos guardados
    const datosIniciales = { ...formData, ...pacienteInfo, ...data };
    setFormData(datosIniciales);
  }, [data, pacienteInfo]);

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

  const formatearFechaNacimiento = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="ficha-identificacion">
      <div className="form-section">
        <h4>Datos Personales</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del paciente"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apellido_paterno">Apellido Paterno</label>
            <input
              type="text"
              id="apellido_paterno"
              name="apellido_paterno"
              value={formData.apellido_paterno}
              onChange={handleChange}
              placeholder="Apellido paterno"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="apellido_materno">Apellido Materno</label>
            <input
              type="text"
              id="apellido_materno"
              name="apellido_materno"
              value={formData.apellido_materno}
              onChange={handleChange}
              placeholder="Apellido materno"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sexo">Sexo</label>
            <select
              id="sexo"
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formatearFechaNacimiento(formData.fecha_nacimiento)}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="rfc">RFC (sin homoclave)</label>
            <input
              type="text"
              id="rfc"
              name="rfc"
              value={formData.rfc}
              onChange={handleChange}
              placeholder="RFC del paciente"
              maxLength="10"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Lugar de Origen y Procedencia</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="lugar_nacimiento">Lugar de Nacimiento</label>
            <input
              type="text"
              id="lugar_nacimiento"
              name="lugar_nacimiento"
              value={formData.lugar_nacimiento}
              onChange={handleChange}
              placeholder="Ciudad, Estado, País"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lugar_procedencia">Lugar de Procedencia</label>
            <input
              type="text"
              id="lugar_procedencia"
              name="lugar_procedencia"
              value={formData.lugar_procedencia}
              onChange={handleChange}
              placeholder="Ciudad, Estado actual"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="grupo_etnico">Grupo Étnico</label>
            <input
              type="text"
              id="grupo_etnico"
              name="grupo_etnico"
              value={formData.grupo_etnico}
              onChange={handleChange}
              placeholder="Grupo étnico"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="religion">Religión</label>
            <input
              type="text"
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleChange}
              placeholder="Religión que profesa"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Datos de Contacto</h4>
        
        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <textarea
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Dirección completa"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Teléfono fijo"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="celular">Celular</label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="Número celular"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="correo_electronico">Correo Electrónico</label>
            <input
              type="email"
              id="correo_electronico"
              name="correo_electronico"
              value={formData.correo_electronico}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Información de Seguridad Social</h4>
        
        <div className="form-row">
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="derecho_habiente"
                name="derecho_habiente"
                checked={formData.derecho_habiente}
                onChange={handleChange}
              />
              <label htmlFor="derecho_habiente">¿Es derecho-habiente a alguna institución?</label>
            </div>
          </div>
        </div>

        {formData.derecho_habiente && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="institucion">Institución</label>
              <select
                id="institucion"
                name="institucion"
                value={formData.institucion}
                onChange={handleChange}
              >
                <option value="">Seleccionar institución</option>
                <option value="IMSS">IMSS</option>
                <option value="ISSSTE">ISSSTE</option>
                <option value="PEMEX">PEMEX</option>
                <option value="SEDENA">SEDENA</option>
                <option value="SEMAR">SEMAR</option>
                <option value="SEGURO_POPULAR">Seguro Popular</option>
                <option value="ISSEMYM">ISSEMYM</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="numero_filiacion">Número de Filiación</label>
              <input
                type="text"
                id="numero_filiacion"
                name="numero_filiacion"
                value={formData.numero_filiacion}
                onChange={handleChange}
                placeholder="Número de afiliación"
              />
            </div>
          </div>
        )}
      </div>

      <div className="info-note">
        <p><strong>Nota:</strong> Toda la información proporcionada es confidencial y será utilizada únicamente para fines médicos y administrativos del tratamiento dental.</p>
      </div>
    </div>
  );
};

export default FichaIdentificacion;