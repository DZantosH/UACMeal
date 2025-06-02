import React, { useState, useEffect, useCallback } from 'react';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Función estable para cargar pacientes
  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/pacientes');
      if (response.ok) {
        const data = await response.json();
        setPacientes(data);
        setPacientesFiltrados(data);
      } else {
        throw new Error('Error al cargar pacientes');
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      setError('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Función estable para filtrar pacientes
  const filtrarPacientes = useCallback(() => {
    if (!busqueda.trim()) {
      setPacientesFiltrados(pacientes);
      return;
    }

    const terminoBusqueda = busqueda.toLowerCase().trim();
    const pacientesFiltradosResult = pacientes.filter(paciente => {
      return (
        paciente.nombre?.toLowerCase().includes(terminoBusqueda) ||
        paciente.apellido_paterno?.toLowerCase().includes(terminoBusqueda) ||
        paciente.apellido_materno?.toLowerCase().includes(terminoBusqueda) ||
        paciente.rfc?.toLowerCase().includes(terminoBusqueda)
      );
    });
    
    setPacientesFiltrados(pacientesFiltradosResult);
  }, [busqueda, pacientes]);

  // ✅ useEffect para cargar datos iniciales
  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  // ✅ useEffect para filtrado con dependencias correctas
  useEffect(() => {
    filtrarPacientes();
  }, [filtrarPacientes]);

  const handleBusquedaChange = useCallback((e) => {
    setBusqueda(e.target.value);
  }, []);

  const verHistorialClinico = useCallback((pacienteId) => {
    // Abrir el PDF del historial clínico
    const url = `http://localhost:5000/api/pacientes/${pacienteId}/historial-clinico`;
    window.open(url, '_blank');
  }, []);

  const verRadiografias = useCallback((pacienteId) => {
    // Abrir el PDF de radiografías
    const url = `http://localhost:5000/api/pacientes/${pacienteId}/radiografias`;
    window.open(url, '_blank');
  }, []);

  if (loading) {
    return (
      <div className="pacientes-container">
        <div className="loading">
          <p>Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pacientes-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={cargarPacientes} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pacientes-container">
      <div className="pacientes-header">
        <h1>Gestión de Pacientes</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre, apellidos o RFC..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="pacientes-stats">
        <p>
          Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
          {busqueda && ` (filtrado por: "${busqueda}")`}
        </p>
      </div>

      <div className="table-container">
        <table className="pacientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido Paterno</th>
              <th>Apellido Materno</th>
              <th>RFC (sin homoclave)</th>
              <th>Historial Clínico</th>
              <th>Radiografías</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.nombre || 'N/A'}</td>
                  <td>{paciente.apellido_paterno || 'N/A'}</td>
                  <td>{paciente.apellido_materno || 'N/A'}</td>
                  <td>{paciente.rfc || 'N/A'}</td>
                  <td>
                    <button
                      onClick={() => verHistorialClinico(paciente.id)}
                      className="btn-pdf historial"
                      title="Ver Historial Clínico PDF"
                    >
                      📋 Ver PDF
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => verRadiografias(paciente.id)}
                      className="btn-pdf radiografias"
                      title="Ver Radiografías PDF"
                    >
                      🩻 Ver PDF
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  {busqueda 
                    ? `No se encontraron pacientes que coincidan con "${busqueda}"`
                    : 'No hay pacientes registrados'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pacientes;