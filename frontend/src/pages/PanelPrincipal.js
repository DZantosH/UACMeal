import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgendarCitasSidebar from './AgendarCitasSidebar';
import CalendarioDinamico from './CalendarioDinamico';

const PanelPrincipal = () => {
  const [showAgendarCitas, setShowAgendarCitas] = useState(false);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(true);

  useEffect(() => {
    cargarCitasHoy();
  }, []);

  const cargarCitasHoy = async () => {
    try {
      setLoadingCitas(true);
      const response = await fetch('http://localhost:5000/api/citas/hoy');
      if (response.ok) {
        const data = await response.json();
        setCitasHoy(data);
      } else {
        console.error('Error al cargar citas:', response.status);
        setCitasHoy([]);
      }
    } catch (error) {
      console.error('Error al cargar citas de hoy:', error);
      setCitasHoy([]);
    } finally {
      setLoadingCitas(false);
    }
  };

  const handleAgendarCita = () => {
    setShowAgendarCitas(true);
  };

  const handleCerrarSidebar = () => {
    setShowAgendarCitas(false);
  };

  const handleCitaAgendada = () => {
    cargarCitasHoy();
    console.log('Cita agendada exitosamente');
  };

  return (
    <div className="panel-principal">
      {/* Sección de Citas de Hoy */}
      <div className="panel-section">
        <div className="citas-header">
          <h3>Citas de Hoy</h3>
        </div>
        <div className="citas-hoy">
          <div className="citas-list">
            {loadingCitas ? (
              <div className="loading-citas">
                <p>Cargando citas...</p>
              </div>
            ) : citasHoy.length > 0 ? (
              citasHoy.map((cita) => (
                <div key={cita.id} className="cita-item cita-header">
                  <span className="cita-hora">
                    {cita.hora_cita ? cita.hora_cita.slice(0, 5) : 'N/A'}
                  </span>
                  <span className="cita-paciente">
                    {cita.paciente_nombre} {cita.paciente_apellido}
                  </span>
                  <span className="cita-tipo">
                    {cita.estado} ({cita.tipo_cita})
                  </span>
                </div>
              ))
            ) : (
              <div className="no-citas-hoy">
                <p>No hay citas agendadas para hoy</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sección del Calendario y Acciones */}
      <div className="panel-section">
        <CalendarioDinamico />
        
        <div className="panel-actions">
          <div className="action-icons">
            <Link to="/pacientes" className="action-icon">
              <span>👤</span>
              <span>Pacientes</span>
            </Link>
            
            {/* ✅ CORREGIDO: Link directo a historial-clinico */}
            <Link to="/historial-clinico" className="action-icon">
              <span>📋</span>
              <span>Historial Clínico</span>
            </Link>
            
            <button onClick={handleAgendarCita} className="action-icon action-button">
              <span>📅</span>
              <span>Agendar Cita</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar para agendar citas */}
      <AgendarCitasSidebar 
        isOpen={showAgendarCitas}
        onClose={handleCerrarSidebar}
        onAgendarCita={handleCitaAgendada}
      />
    </div>
  );
};

export default PanelPrincipal;