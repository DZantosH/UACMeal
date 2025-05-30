import React, { useState, useEffect, useCallback } from 'react';

const CitasDelDia = ({ fecha, isOpen, onClose }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarCitasDelDia = useCallback(async () => {
    try {
      setLoading(true);
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      const response = await fetch(`http://localhost:5000/api/citas/dia/${fechaFormateada}`);
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      } else {
        setCitas([]);
      }
    } catch (error) {
      console.error('Error al cargar citas del día:', error);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    if (isOpen && fecha) {
      cargarCitasDelDia();
    }
  }, [isOpen, fecha, cargarCitasDelDia]);

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHora = (hora) => {
    return hora ? hora.slice(0, 5) : 'N/A';
  };

  const getEstadoBadgeClass = (estado) => {
    const clases = {
      'Programada': 'modal-badge-programada',
      'Confirmada': 'modal-badge-confirmada',
      'En_Proceso': 'modal-badge-en-proceso',
      'Completada': 'modal-badge-completada',
      'Cancelada': 'modal-badge-cancelada',
      'No_Asistio': 'modal-badge-no-asistio'
    };
    return clases[estado] || 'modal-badge-programada';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'Programada': 'Programada',
      'Confirmada': 'Confirmada',
      'En_Proceso': 'En Proceso',
      'Completada': 'Completada',
      'Cancelada': 'Cancelada',
      'No_Asistio': 'No Asistió'
    };
    return textos[estado] || estado;
  };

  const getTipoConsultaIcon = (tipo) => {
    const iconos = {
      'Consulta': '🦷',
      'Extraccion': '🔧',
      'Limpieza': '✨',
      'Control': '📋',
      'Urgencia': '🚨'
    };
    return iconos[tipo] || '📋';
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-citas-overlay')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-citas-overlay" onClick={handleOverlayClick}>
      <div className="modal-citas-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-citas-header">
          <div className="modal-fecha-info">
            <h3>📅 Citas del Día</h3>
            <p className="modal-fecha-seleccionada">
              {formatearFecha(fecha)}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-citas-content">
          {loading ? (
            <div className="modal-citas-loading">
              <div className="loading-spinner-small"></div>
              <p>Cargando citas...</p>
            </div>
          ) : citas.length > 0 ? (
            <>
              <div className="modal-citas-resumen">
                <span className="modal-resumen-numero">{citas.length}</span>
                <span className="modal-resumen-texto">
                  {citas.length === 1 ? 'Cita Agendada' : 'Citas Agendadas'}
                </span>
              </div>

              <div className="modal-citas-lista">
                {citas
                  .sort((a, b) => a.hora_cita.localeCompare(b.hora_cita))
                  .map((cita) => (
                  <div key={cita.id} className="modal-cita-card">
                    <div className="modal-cita-hora-tipo">
                      <div className="modal-hora-grande">
                        {formatearHora(cita.hora_cita)}
                      </div>
                      <div className="modal-tipo-icono">
                        {getTipoConsultaIcon(cita.tipo_cita)}
                      </div>
                    </div>
                    
                    <div className="modal-cita-info">
                      <h4 className="modal-paciente-nombre">
                        {cita.paciente_nombre} {cita.paciente_apellido}
                      </h4>
                      <p className="modal-tipo-consulta">
                        {cita.tipo_cita}
                      </p>
                      <p className="modal-doctor-info">
                        Dr/Dra. {cita.doctor_nombre} {cita.doctor_apellido}
                      </p>
                    </div>
                    
                    <div className="modal-estado-container">
                      <span className={`modal-estado-badge ${getEstadoBadgeClass(cita.estado)}`}>
                        {getEstadoTexto(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="modal-no-citas">
              <div className="modal-no-citas-icon">📅</div>
              <h4>Sin citas agendadas</h4>
              <p>No hay citas programadas para este día</p>
            </div>
          )}
        </div>

        <div className="modal-citas-footer">
          <div className="modal-horarios-info">
            <small>
              <strong>Horarios:</strong> 11:00 AM - 8:00 PM
            </small>
          </div>
          <button className="modal-btn-agendar" onClick={onClose}>
            Nueva Cita
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitasDelDia;