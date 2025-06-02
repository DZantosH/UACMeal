import React from 'react';

const FichaIdentificacion = ({ datos, errores, onChange }) => {
  return (
    <div className="form-section">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            className="form-input"
            value={datos.nombre || ''}
            onChange={(e) => onChange('nombre', e.target.value)}
            placeholder="Nombre del paciente"
          />
          {errores.nombre && <span className="error-text">{errores.nombre}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="apellidoPaterno">Apellido Paterno:</label>
          <input
            type="text"
            id="apellidoPaterno"
            name="apellidoPaterno"
            className="form-input"
            value={datos.apellidoPaterno || ''}
            onChange={(e) => onChange('apellidoPaterno', e.target.value)}
            placeholder="Apellido Paterno"
          />
          {errores.apellidoPaterno && <span className="error-text">{errores.apellidoPaterno}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="apellidoMaterno">Apellido Materno:</label>
          <input
            type="text"
            id="apellidoMaterno"
            name="apellidoMaterno"
            className="form-input"
            value={datos.apellidoMaterno || ''}
            onChange={(e) => onChange('apellidoMaterno', e.target.value)}
            placeholder="Apellido Materno"
          />
          {errores.apellidoMaterno && <span className="error-text">{errores.apellidoMaterno}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sexo">Sexo:</label>
          <select
            id="sexo"
            name="sexo"
            className="form-select"
            value={datos.sexo || ''}
            onChange={(e) => onChange('sexo', e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
          {errores.sexo && <span className="error-text">{errores.sexo}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            className="form-input"
            value={datos.fechaNacimiento || ''}
            onChange={(e) => onChange('fechaNacimiento', e.target.value)}
          />
          {errores.fechaNacimiento && <span className="error-text">{errores.fechaNacimiento}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="rfc">RFC:</label>
          <input
            type="text"
            id="rfc"
            name="rfc"
            className="form-input"
            value={datos.rfc || ''}
            onChange={(e) => onChange('rfc', e.target.value)}
            placeholder="RFC del paciente"
          />
          {errores.rfc && <span className="error-text">{errores.rfc}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            className="form-input"
            value={datos.telefono || ''}
            onChange={(e) => onChange('telefono', e.target.value)}
            placeholder="Teléfono de contacto"
          />
          {errores.telefono && <span className="error-text">{errores.telefono}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={datos.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="ejemplo@correo.com"
          />
          {errores.email && <span className="error-text">{errores.email}</span>}
        </div>
      </div>
    </div>
  );
};

export default FichaIdentificacion;
