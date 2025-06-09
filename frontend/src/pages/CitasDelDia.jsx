import React, { useState, useEffect, useCallback } from 'react';
import { buildApiUrl } from '../config/config.js';
import { useAuth } from '../services/AuthContext'; // ← AGREGAR ESTO

const CitasDelDia = ({ fecha, isOpen, onClose }) => {
  const { user } = useAuth(); // ← USAR EL CONTEXTO DE AUTH
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);

  // ← FUNCIÓN PARA OBTENER HEADERS CON AUTENTICACIÓN
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const cargarCitasDelDia = useCallback(async () => {
    try {
      setLoading(true);
      const fechaFormateada = fecha.toISOString().split('T')[0];
      
      console.log('🔍 Cargando citas del día:', fechaFormateada);
      
      const response = await fetch(buildApiUrl(`/citas/dia/${fechaFormateada}`), {
        headers: getAuthHeaders() // ← AGREGAR HEADERS DE AUTH
      });
      
      console.log('📡 Response citas del día:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Citas del día cargadas:', data);
        setCitas(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Error al cargar citas del día:', response.status);
        setCitas([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar citas del día:', error);
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

  // Función para cambiar el estado de una cita
  const cambiarEstadoCita = async (citaId, nuevoEstado) => {
    try {
      console.log('🔄 Cambiando estado de cita:', citaId, 'a', nuevoEstado);
      
      const response = await fetch(buildApiUrl(`/citas/${citaId}/estado`), {
        method: 'PUT',
        headers: getAuthHeaders(), // ← AGREGAR HEADERS DE AUTH
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (response.ok) {
        console.log('✅ Estado de cita actualizado');
        // Recargar las citas del día
        cargarCitasDelDia();
      } else {
        console.error('❌ Error al actualizar estado de cita:', response.status);
        alert('Error al actualizar el estado de la cita');
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      alert('Error de conexión al actualizar el estado');
    }
  };

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
          {/* Debug info para desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              background: '#f0f0f0',
              padding: '8px',
              margin: '8px 0',
              borderRadius: '4px',
              fontSize: '11px',
              border: '1px solid #ddd'
            }}>
              <strong>🔧 Debug:</strong> Usuario: {user?.nombre || 'No logueado'} | 
              Token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'} | 
              Citas: {citas.length}
            </div>
          )}

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
                      {/* Mostrar precio si existe */}
                      {cita.precio && (
                        <p className="modal-precio-info">
                          💰 ${parseFloat(cita.precio).toLocaleString('es-MX')}
                        </p>
                      )}
                    </div>
                    
                    <div className="modal-estado-container">
                      {/* Selector para cambiar estado */}
                      <select
                        value={cita.estado}
                        onChange={(e) => cambiarEstadoCita(cita.id, e.target.value)}
                        className="modal-estado-select"
                        style={{
                          fontSize: '12px',
                          padding: '4px 8px',
                          marginBottom: '8px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          width: '100%'
                        }}
                      >
                        <option value="Programada">Programada</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="En_Proceso">En Proceso</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
                        <option value="No_Asistio">No Asistió</option>
                      </select>
                      
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
          <div className="modal-footer-actions">
            <button 
              className="modal-btn-actualizar" 
              onClick={cargarCitasDelDia}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                marginRight: '8px',
                cursor: 'pointer'
              }}
            >
              🔄 Actualizar
            </button>
            <button className="modal-btn-agendar" onClick={onClose}>
              Nueva Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitasDelDia;