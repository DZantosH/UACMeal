import React, { useState, useEffect } from 'react';

const AgendarCitasSidebar = ({ isOpen, onClose, onCitaCreated }) => {
  const [formData, setFormData] = useState({
    paciente_id: '',
    nombre_paciente: '',
    telefono_temporal: '',
    tipo_consulta: '',
    fecha_consulta: '',
    horario_consulta: '',
    doctor_id: '',
    observaciones: '',
    precio: ''
  });

  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [usarPacienteTemporal, setUsarPacienteTemporal] = useState(false);

  // Tipos de consulta disponibles
  const tiposConsulta = [
    'Consulta General',
    'Limpieza Dental',
    'Extracción',
    'Endodoncia',
    'Ortodoncia',
    'Implante',
    'Cirugía Oral',
    'Revisión'
  ];

  // Horarios disponibles (11:00 - 20:00)
  const horariosDisponibles = [];
  for (let hour = 11; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      horariosDisponibles.push(timeString);
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarPacientes();
      cargarDoctores();
      // Limpiar formulario al abrir
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      nombre_paciente: '',
      telefono_temporal: '',
      tipo_consulta: '',
      fecha_consulta: '',
      horario_consulta: '',
      doctor_id: '',
      observaciones: '',
      precio: ''
    });
    setUsarPacienteTemporal(false);
    setError('');
    setSuccess('');
  };

  const cargarPacientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pacientes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPacientes(data);
      } else {
        console.error('Error al cargar pacientes');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const cargarDoctores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/usuarios/doctores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctores(data);
      } else {
        console.error('Error al cargar doctores');
      }
    } catch (error) {
      console.error('Error al cargar doctores:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handlePacienteChange = (e) => {
    const pacienteId = e.target.value;
    setFormData(prev => ({
      ...prev,
      paciente_id: pacienteId
    }));

    // Si selecciona un paciente existente, limpiar datos temporales
    if (pacienteId) {
      const pacienteSeleccionado = pacientes.find(p => p.id == pacienteId);
      if (pacienteSeleccionado) {
        setFormData(prev => ({
          ...prev,
          nombre_paciente: `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido_paterno} ${pacienteSeleccionado.apellido_materno || ''}`.trim(),
          telefono_temporal: ''
        }));
        setUsarPacienteTemporal(false);
      }
    }
  };

  const togglePacienteTemporal = () => {
    setUsarPacienteTemporal(!usarPacienteTemporal);
    if (!usarPacienteTemporal) {
      // Si va a usar paciente temporal, limpiar selección de paciente existente
      setFormData(prev => ({
        ...prev,
        paciente_id: '',
        nombre_paciente: '',
        telefono_temporal: ''
      }));
    } else {
      // Si vuelve a paciente existente, limpiar datos temporales
      setFormData(prev => ({
        ...prev,
        nombre_paciente: '',
        telefono_temporal: ''
      }));
    }
  };

  const validarFormulario = () => {
    // Validar que tenga paciente (existente o temporal)
    if (usarPacienteTemporal) {
      if (!formData.nombre_paciente.trim()) {
        setError('El nombre del paciente temporal es requerido');
        return false;
      }
    } else {
      if (!formData.paciente_id) {
        setError('Debe seleccionar un paciente existente');
        return false;
      }
    }

    // Validar campos requeridos
    if (!formData.tipo_consulta) {
      setError('El tipo de consulta es requerido');
      return false;
    }
    if (!formData.fecha_consulta) {
      setError('La fecha de consulta es requerida');
      return false;
    }
    if (!formData.horario_consulta) {
      setError('El horario de consulta es requerido');
      return false;
    }
    if (!formData.doctor_id) {
      setError('Debe seleccionar un doctor');
      return false;
    }

    // Validar fecha no sea anterior a hoy
    const hoy = new Date().toISOString().split('T')[0];
    if (formData.fecha_consulta < hoy) {
      setError('La fecha de la cita no puede ser anterior a hoy');
      return false;
    }

    // Validar horario esté en rango
    const hora = formData.horario_consulta;
    if (hora < '11:00' || hora > '20:00') {
      setError('El horario debe ser entre 11:00 y 20:00');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Preparar datos para enviar
      const dataToSend = {
        ...formData,
        // Si es paciente temporal, limpiar paciente_id
        paciente_id: usarPacienteTemporal ? '' : formData.paciente_id,
        // Asegurar que tenga nombre del paciente
        nombre_paciente: usarPacienteTemporal ? formData.nombre_paciente : formData.nombre_paciente
      };

      console.log('Enviando datos:', dataToSend);

      const response = await fetch('/api/citas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Cita agendada exitosamente para ${result.paciente}${result.pacienteTemporal ? ' (Paciente Temporal)' : ''}`);
        
        // Llamar callback para actualizar lista de citas
        if (onCitaCreated) {
          onCitaCreated(result);
        }

        // Limpiar formulario después de un delay
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);

      } else {
        setError(result.message || 'Error al agendar la cita');
      }

    } catch (error) {
      console.error('Error al agendar cita:', error);
      setError('Error de conexión al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="agendar-citas-sidebar-overlay"
      onClick={(e) => {
        // Cerrar si hace click en el overlay (fondo negro)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="agendar-citas-sidebar-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="agendar-citas-header">
          <h2 className="agendar-citas-title">
            📅 Agendar Nueva Cita
          </h2>
          <button
            onClick={onClose}
            className="agendar-citas-close-btn"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="agendar-citas-content">
          {/* Mensajes de estado */}
          {error && (
            <div className="agendar-citas-error">
              <span className="mr-2 mt-0.5">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="agendar-citas-success">
              <span className="mr-2 mt-0.5">✅</span>
              <span className="flex-1">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="agendar-citas-form">
            {/* Selección de tipo de paciente */}
            <div className="form-group">
              <label className="agendar-checkbox-label">
                <input
                  type="checkbox"
                  checked={usarPacienteTemporal}
                  onChange={togglePacienteTemporal}
                  className="form-control"
                />
                <span className="text-sm font-medium">
                  ⏱️ Crear paciente temporal (24h)
                </span>
              </label>
            </div>

            {/* Selección/Creación de Paciente */}
            {!usarPacienteTemporal ? (
              <div className="form-group">
                <label className="field-label">
                  👤 Seleccionar Paciente *
                </label>
                <select
                  name="paciente_id"
                  value={formData.paciente_id}
                  onChange={handlePacienteChange}
                  className="form-control"
                  required
                >
                  <option value="">Seleccionar paciente...</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno || ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="agendar-temporal-section">
                <div className="form-group">
                  <label className="field-label">
                    👤 Nombre Completo del Paciente *
                  </label>
                  <input
                    type="text"
                    name="nombre_paciente"
                    value={formData.nombre_paciente}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Ej: Juan Pérez García"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">
                    📞 Teléfono (Opcional)
                  </label>
                  <input
                    type="tel"
                    name="telefono_temporal"
                    value={formData.telefono_temporal}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Ej: 5551234567"
                  />
                </div>
                <p className="agendar-warning">
                  ⚠️ Este paciente será temporal y se eliminará automáticamente en 24 horas.
                </p>
              </div>
            )}

            {/* Tipo de Consulta */}
            <div className="form-group">
              <label className="field-label">
                📋 Tipo de Consulta *
              </label>
              <select
                name="tipo_consulta"
                value={formData.tipo_consulta}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar tipo...</option>
                {tiposConsulta.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="form-group">
              <label className="field-label">
                📅 Fecha de la Cita *
              </label>
              <input
                type="date"
                name="fecha_consulta"
                value={formData.fecha_consulta}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="form-control"
                required
              />
            </div>

            {/* Horario */}
            <div className="form-group">
              <label className="field-label">
                🕐 Horario *
              </label>
              <select
                name="horario_consulta"
                value={formData.horario_consulta}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar horario...</option>
                {horariosDisponibles.map(hora => (
                  <option key={hora} value={hora}>{hora}</option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div className="form-group">
              <label className="field-label">
                👨‍⚕️ Doctor *
              </label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleInputChange}
                className="form-control"
                required
              >
                <option value="">Seleccionar doctor...</option>
                {doctores.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.nombre} {doctor.apellido_paterno}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div className="form-group">
              <label className="field-label">
                💰 Precio (Opcional)
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
              />
            </div>

            {/* Observaciones */}
            <div className="form-group">
              <label className="field-label">
                📝 Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                rows="3"
                className="form-control"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Botones */}
            <div className="agendar-citas-buttons">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel-agendar"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit-agendar"
                disabled={loading}
              >
                {loading ? 'Agendando...' : 'Agendar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgendarCitasSidebar;