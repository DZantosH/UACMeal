import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AgendarCitasSidebar from './AgendarCitasSidebar';
import CalendarioDinamico from './CalendarioDinamico';
import { buildApiUrl } from '../config/config.js';

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
      const response = await fetch(buildApiUrl('/citas/hoy'));
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
    <>
      {/* ✅ BARRA DE NAVEGACIÓN HORIZONTAL SUPERIOR */}
      <div className="top-navigation-bar">
        <div className="nav-actions">
          <Link to="/pacientes" className="nav-action-btn">
            <span>👤</span>
            <span>Pacientes</span>
          </Link>
          
          <Link to="/historial-clinico" className="nav-action-btn">
            <span>📋</span>
            <span>Historial Clínico</span>
          </Link>
          
          <button onClick={handleAgendarCita} className="nav-action-btn nav-action-button">
            <span>📅</span>
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* ✅ PANEL PRINCIPAL SIN BOTONES */}
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
        
        {/* Sección del Calendario */}
        <div className="panel-section">
          <CalendarioDinamico />
        </div>

        {/* Sidebar para agendar citas */}
        <AgendarCitasSidebar 
          isOpen={showAgendarCitas}
          onClose={handleCerrarSidebar}
          onAgendarCita={handleCitaAgendada}
        />
      </div>
    </>
  );
};

export default PanelPrincipal;