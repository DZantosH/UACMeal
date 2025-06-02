// AgendarCitasSidebar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { buildApiUrl } from '../config/config.js';

const AgendarCitasSidebar = ({ isOpen, onClose, onAgendarCita }) => {
  const [formData, setFormData] = useState({
    paciente_id: '',
    pacienteNombre: '',
    tipo_consulta: '',
    fecha_consulta: '',
    horario_consulta: '',
    doctor_id: '',
    observaciones: ''
  });

  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [filteredPacientes, setFilteredPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPacientesList, setShowPacientesList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Tipos de consulta predefinidos
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

  const horariosDisponibles = [
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30',
  '17:00', '17:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00'
];


  const cargarPacientes = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await fetch(buildApiUrl('/pacientes'));
      if (response.ok) {
        const data = await response.json();
        setPacientes(Array.isArray(data) ? data : []);
      } else {
        console.error('Error al cargar pacientes:', response.status);
        setPacientes([]);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setPacientes([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  const cargarDoctores = useCallback(async () => {
    try {
      setLoadingData(true);
      const response = await fetch(buildApiUrl('/usuarios/doctores'));
      if (response.ok) {
        const data = await response.json();
        setDoctores(Array.isArray(data) ? data : []);
      } else {
        console.error('Error al cargar doctores:', response.status);
        setDoctores([]);
      }
    } catch (error) {
      console.error('Error al cargar doctores:', error);
      setDoctores([]);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      cargarPacientes();
      cargarDoctores();
      resetForm();
    }
  }, [isOpen, cargarPacientes, cargarDoctores]);

  useEffect(() => {
    if (searchTerm.length > 0 && Array.isArray(pacientes)) {
      const filtered = pacientes.filter(paciente =>
        paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paciente.rfc && paciente.rfc.includes(searchTerm))
      );
      setFilteredPacientes(filtered);
      setShowPacientesList(true);
    } else {
      setFilteredPacientes([]);
      setShowPacientesList(false);
    }
  }, [searchTerm, pacientes]);

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      pacienteNombre: '',
      tipo_consulta: '',
      fecha_consulta: '',
      horario_consulta: '',
      doctor_id: '',
      observaciones: ''
    });
    setSearchTerm('');
    setShowPacientesList(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFormData(prev => ({
      ...prev,
      paciente_id: '',
      pacienteNombre: ''
    }));
  };

  const seleccionarPaciente = (paciente) => {
    setFormData(prev => ({
      ...prev,
      paciente_id: paciente.id,
      pacienteNombre: `${paciente.nombre} ${paciente.apellido}`
    }));
    setSearchTerm(`${paciente.nombre} ${paciente.apellido}`);
    setShowPacientesList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que se haya escrito un nombre (ya sea seleccionado o escrito manualmente)
    if (!searchTerm.trim()) {
      alert('Por favor escriba el nombre del paciente');
      return;
    }

    // Validar campos obligatorios de la cita
    if (!formData.tipo_consulta || !formData.fecha_consulta || 
        !formData.horario_consulta || !formData.doctor_id) {
      alert('Por favor complete todos los campos obligatorios de la cita');
      return;
    }

    setLoading(true);
    
    try {
      // Si no hay paciente seleccionado, usar el nombre escrito
      const nombrePaciente = formData.pacienteNombre || searchTerm.trim();
      
      const citaData = {
        paciente_id: formData.paciente_id || null, // null si no está registrado
        nombre_paciente: nombrePaciente, // Enviar el nombre escrito
        tipo_consulta: formData.tipo_consulta,
        fecha_consulta: formData.fecha_consulta,
        horario_consulta: formData.horario_consulta,
        doctor_id: formData.doctor_id,
        observaciones: formData.observaciones
      };

      const response = await fetch(buildApiUrl('/citas'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(citaData)
      });

      if (response.ok) {
        alert('Cita agendada exitosamente');
        onAgendarCita();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error al agendar cita:', error);
      alert('Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar-overlay">
      <div className="sidebar-container">
        <div className="sidebar-header">
          <h2>Agendar Nueva Cita</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="cita-form">
          {/* Buscar Paciente SOLAMENTE */}
          <div className="form-group">
            <label htmlFor="buscarPaciente">Buscar Paciente *</label>
            <div className="search-container">
              <input
                type="text"
                id="buscarPaciente"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar paciente por nombre, apellido o RFC..."
                className="form-control"
                autoComplete="off"
              />
              {showPacientesList && (
                <div className="pacientes-dropdown">
                  {Array.isArray(filteredPacientes) && filteredPacientes.length > 0 ? (
                    filteredPacientes.map(paciente => (
                      <div
                        key={paciente.id}
                        className="paciente-item"
                        onClick={() => seleccionarPaciente(paciente)}
                      >
                        <div className="paciente-nombre">
                          {paciente.nombre} {paciente.apellido}
                        </div>
                        <div className="paciente-cedula">
                          RFC: {paciente.rfc || 'N/A'} | Tel: {paciente.telefono || 'N/A'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      No se encontraron pacientes con ese criterio
                    </div>
                  )}
                </div>
              )}
            </div>
            {searchTerm && (
              <div className="paciente-escrito">
                📝 Paciente: <strong>{searchTerm}</strong>
                {formData.pacienteNombre && (
                  <span className="paciente-registrado"> (Registrado)</span>
                )}
              </div>
            )}
          </div>

          {/* Tipo de Consulta */}
          <div className="form-group">
            <label htmlFor="tipoConsulta">Tipo de Consulta *</label>
            <select
              id="tipoConsulta"
              name="tipo_consulta"
              value={formData.tipo_consulta}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Seleccione tipo de consulta</option>
              {tiposConsulta.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Fecha de la Consulta */}
          <div className="form-group">
            <label htmlFor="fechaConsulta">Fecha de la Consulta *</label>
            <input
              type="date"
              id="fechaConsulta"
              name="fecha_consulta"
              value={formData.fecha_consulta}
              onChange={handleInputChange}
              min={getTodayDate()}
              className="form-control"
              required
            />
          </div>

          {/* Horario de la Consulta */}
          <div className="form-group">
            <label htmlFor="horarioConsulta">Horario de la Consulta *</label>
            <select
              id="horarioConsulta"
              name="horario_consulta"
              value={formData.horario_consulta}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Seleccione horario</option>
              {horariosDisponibles.map(horario => (
                <option key={horario} value={horario}>{horario}</option>
              ))}
            </select>
          </div>

          {/* Doctor/Doctora */}
          <div className="form-group">
            <label htmlFor="doctorId">Dr/Dra que lo va a atender *</label>
            <select
              id="doctorId"
              name="doctor_id"
              value={formData.doctor_id}
              onChange={handleInputChange}
              className="form-control"
              required
              disabled={loadingData}
            >
              <option value="">
                {loadingData ? 'Cargando doctores...' : 'Seleccione doctor/a'}
              </option>
              {Array.isArray(doctores) && doctores.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                Dr(a). {doctor.nombre} {doctor.apellido_paterno} {doctor.apellido_materno || ''}
              </option>
            ))}
            </select>
            {!Array.isArray(doctores) && !loadingData && (
              <small style={{color: 'red'}}>Error al cargar doctores</small>
            )}
          </div>

          {/* Observaciones */}
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
              placeholder="Observaciones adicionales para la cita..."
            ></textarea>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !searchTerm.trim()}
            >
              {loading ? 'Agendando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgendarCitasSidebar;