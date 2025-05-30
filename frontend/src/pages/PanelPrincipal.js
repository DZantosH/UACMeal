// PanelPrincipal.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import AgendarCitasSidebar from './AgendarCitasSidebar';
import CalendarioDinamico from './CalendarioDinamico';

const PanelPrincipal = () => {
  const { user } = useAuth();
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
  // Generar calendario del mes actual - YA NO SE NECESITA
  // Se reemplaza por el componente CalendarioDinamico

  const handleAgendarCita = () => {
    setShowAgendarCitas(true);
  };

  const handleCerrarSidebar = () => {
    setShowAgendarCitas(false);
  };

  const handleCitaAgendada = () => {
    // Recargar las citas después de agendar una nueva
    cargarCitasHoy();
    console.log('Cita agendada exitosamente');
  };

  return (
    <div className="panel-principal">
      <div className="panel-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido {user?.nombre} - {user?.rol}</p>
      </div>
      
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
      
      <div className="panel-section">
        {/* Usar el nuevo componente CalendarioDinamico */}
        <CalendarioDinamico />
        
        <div className="panel-actions">
          <div className="action-icons">
            <Link to="/pacientes" className="action-icon">
              <span>👤</span>
              <span>Registrar Paciente</span>
            </Link>
            <Link to="/historial" className="action-icon">
              <span>📋</span>
              <span>Historial Clínico</span>
            </Link>
            {/* Botón Agendar Cita siempre visible */}
            <button onClick={handleAgendarCita} className="action-icon action-button">
              <span>📅</span>
              <span>Agendar Cita</span>
            </button>
            <Link to="/pacientes" className="action-icon">
              <span>👥</span>
              <span>Pacientes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Botón flotante fijo para agendar cita */}
      <button 
        onClick={handleAgendarCita} 
        className="btn-agendar-fijo"
        title="Agendar Nueva Cita"
      >
        📅
      </button>

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