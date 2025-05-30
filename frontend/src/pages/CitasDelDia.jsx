import React, { useState, useEffect, useCallback } from 'react';

const CitasDelDia = ({ fecha, isOpen, onClose }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarCitasDelDia = useCallback(async () => {
    try {
      setLoading(true);
      const fechaFormateada = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      
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
      'Programada': 'badge-programada',
      'Confirmada': 'badge-confirmada',
      'En_Proceso': 'badge-en-proceso',
      'Completada': 'badge-completada',
      'Cancelada': 'badge-cancelada',
      'No_Asistio': 'badge-no-asistio'
    };
    return clases[estado] || 'badge-default';
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

  if (!isOpen) return null;

  return (
    <div className="citas-dia-overlay">
      <div className="citas-dia-sidebar">
        {/* Header */}
        <div className="citas-dia-header">
          <div className="fecha-info">
            <h3>Citas del Día</h3>
            <p className="fecha-seleccionada">
              {formatearFecha(fecha)}
            </p>
          </div>
          <button className="close-btn-citas" onClick={onClose}>×</button>
        </div>

        {/* Contenido */}
        <div className="citas-dia-content">
          {loading ? (
            <div className="citas-loading">
              <div className="loading-spinner-small"></div>
              <p>Cargando citas...</p>
            </div>
          ) : citas.length > 0 ? (
            <>
              <div className="citas-resumen">
                <div className="resumen-item">
                  <span className="resumen-numero">{citas.length}</span>
                  <span className="resumen-texto">
                    {citas.length === 1 ? 'Cita agendada' : 'Citas agendadas'}
                  </span>
                </div>
              </div>

              <div className="citas-lista">
                {citas
                  .sort((a, b) => a.hora_cita.localeCompare(b.hora_cita))
                  .map((cita) => (
                  <div key={cita.id} className="cita-card-dia">
                    <div className="cita-hora-tipo">
                      <div className="hora-grande">
                        {formatearHora(cita.hora_cita)}
                      </div>
                      <div className="tipo-icono">
                        {getTipoConsultaIcon(cita.tipo_cita)}
                      </div>
                    </div>
                    
                    <div className="cita-info-principal">
                      <h4 className="paciente-nombre">
                        {cita.paciente_nombre} {cita.paciente_apellido}
                      </h4>
                      <p className="tipo-consulta">
                        {cita.tipo_cita}
                      </p>
                      <p className="doctor-info">
                        Dr/Dra. {cita.doctor_nombre} {cita.doctor_apellido}
                      </p>
                    </div>
                    
                    <div className="cita-estado-container">
                      <span className={`estado-badge ${getEstadoBadgeClass(cita.estado)}`}>
                        {getEstadoTexto(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-citas-dia">
              <div className="no-citas-icon">📅</div>
              <h4>Sin citas agendadas</h4>
              <p>No hay citas programadas para este día</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="citas-dia-footer">
          <div className="horarios-info">
            <small>
              <strong>Horarios de atención:</strong> 11:00 AM - 8:00 PM
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitasDelDia;