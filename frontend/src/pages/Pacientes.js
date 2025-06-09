import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/config.js';
import { useAuth } from '../services/AuthContext';
import ModalEditarPacienteTemporal from '../components/ModalEditarPacienteTemporal';

const Pacientes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el modal de editar paciente temporal
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // Función para obtener headers con autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Función para calcular edad desde fecha de nacimiento
  const calcularEdad = useCallback((fechaNacimiento) => {
    if (!fechaNacimiento || fechaNacimiento === '1900-01-01') return 'N/A';
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad > 0 ? edad : 'N/A';
  }, []);

  // 🆕 FUNCIÓN MEJORADA PARA CARGAR PACIENTES
  const cargarPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Iniciando carga de pacientes...');
      console.log('👤 Usuario:', user?.nombre || 'No logueado');
      console.log('🏥 Rol:', user?.rol || 'Sin rol');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Token presente:', !!token);
      
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const apiUrl = buildApiUrl('/pacientes');
      console.log('📡 URL de la API:', apiUrl);
      
      const headers = getAuthHeaders();
      console.log('📋 Headers:', headers);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response text:', errorText);
        
        let errorMessage = 'Error al cargar pacientes';
        
        if (response.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          // Opcional: redirigir al login
          // window.location.href = '/login';
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para ver la lista de pacientes.';
        } else if (response.status === 404) {
          errorMessage = 'Endpoint de pacientes no encontrado.';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor.';
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Datos recibidos:', data);
      console.log('✅ Número de pacientes:', Array.isArray(data) ? data.length : 'No es array');
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos incorrecto: se esperaba un array');
      }
      
      // 🔄 PROCESAR DATOS
      const pacientesProcesados = data.map((paciente, index) => {
        console.log(`📝 Procesando paciente ${index + 1}:`, paciente);
        
        // Determinar nombre completo con estado - Adaptado a tu BD
        let nombreCompleto = '';
        if (paciente.nombre_completo_con_estado) {
          nombreCompleto = paciente.nombre_completo_con_estado;
        } else {
          const nombre = paciente.nombre || '';
          const apellidoP = paciente.apellido_paterno || '';
          const apellidoM = paciente.apellido_materno || '';
          nombreCompleto = `${nombre} ${apellidoP} ${apellidoM}`.trim();
          
          if (paciente.estado === 'Temporal') {
            nombreCompleto += ' (Temporal)';
          }
        }
        
        const pacienteProcesado = {
          ...paciente,
          edad: calcularEdad(paciente.fecha_nacimiento),
          es_temporal: paciente.estado === 'Temporal',
          nombre_completo: nombreCompleto,
          ultima_cita: paciente.ultima_cita || null
        };
        
        console.log(`✅ Paciente procesado ${index + 1}:`, pacienteProcesado);
        return pacienteProcesado;
      });
      
      console.log('✅ Todos los pacientes procesados:', pacientesProcesados);
      
      setPacientes(pacientesProcesados);
      setPacientesFiltrados(pacientesProcesados);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error stack:', error.stack);
      setError(error.message || 'Error desconocido al cargar pacientes');
    } finally {
      setLoading(false);
    }
  }, [calcularEdad, user]);

  // Funciones para el modal de editar paciente temporal
  const handleEditarPaciente = (paciente) => {
    console.log('🔄 Editando paciente temporal:', paciente);
    setPacienteSeleccionado(paciente);
    setModalEditarOpen(true);
  };

  const handlePacienteActualizado = (resultado) => {
    console.log('✅ Paciente actualizado:', resultado);
    
    if (resultado.accion === 'convertido') {
      cargarPacientes();
      alert(`Paciente convertido exitosamente a permanente con ID: ${resultado.pacienteId}`);
    } else if (resultado.accion === 'actualizado') {
      cargarPacientes();
    }
    
    setModalEditarOpen(false);
    setPacienteSeleccionado(null);
  };

  // Función para filtrar y ordenar pacientes
  const filtrarYOrdenarPacientes = useCallback(() => {
    let resultado = [...pacientes];

    // Aplicar filtro de búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      resultado = resultado.filter(paciente => {
        const nombreCompleto = paciente.nombre_completo ? 
          paciente.nombre_completo.toLowerCase() :
          `${paciente.nombre || ''} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`.toLowerCase();
        
        return (
          nombreCompleto.includes(terminoBusqueda) ||
          (paciente.telefono && paciente.telefono.includes(terminoBusqueda)) ||
          (paciente.rfc && paciente.rfc.toLowerCase().includes(terminoBusqueda)) ||
          (paciente.correo_electronico && paciente.correo_electronico.toLowerCase().includes(terminoBusqueda))
        );
      });
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      switch (ordenPor) {
        case 'nombre':
          const nombreA = a.nombre_completo || `${a.nombre || ''} ${a.apellido_paterno || ''}`;
          const nombreB = b.nombre_completo || `${b.nombre || ''} ${b.apellido_paterno || ''}`;
          return nombreA.localeCompare(nombreB);
        case 'edad':
          const edadA = typeof a.edad === 'number' ? a.edad : 0;
          const edadB = typeof b.edad === 'number' ? b.edad : 0;
          return edadA - edadB;
        case 'ultimaCita':
          const fechaA = a.ultima_cita ? new Date(a.ultima_cita) : new Date(0);
          const fechaB = b.ultima_cita ? new Date(b.ultima_cita) : new Date(0);
          return fechaB - fechaA;
        default:
          return 0;
      }
    });

    // Ordenar para que los temporales aparezcan primero
    resultado.sort((a, b) => {
      if (a.es_temporal && !b.es_temporal) return -1;
      if (!a.es_temporal && b.es_temporal) return 1;
      return 0;
    });

    setPacientesFiltrados(resultado);
  }, [busqueda, pacientes, ordenPor]);

  // useEffect para cargar datos iniciales
  useEffect(() => {
    console.log('🚀 Componente montado, cargando pacientes...');
    cargarPacientes();
  }, [cargarPacientes]);

  // useEffect para filtrado y ordenamiento
  useEffect(() => {
    filtrarYOrdenarPacientes();
  }, [filtrarYOrdenarPacientes]);

  const handleBusquedaChange = useCallback((e) => {
    setBusqueda(e.target.value);
  }, []);

  const handleOrdenChange = useCallback((e) => {
    setOrdenPor(e.target.value);
  }, []);

  const verHistorialClinico = useCallback((pacienteId) => {
    console.log('🔍 === INICIO DEBUG NAVEGACIÓN ===');
    console.log('📋 ID del paciente:', pacienteId);
    console.log('📍 URL actual:', window.location.pathname);
    console.log('🧭 Navigate function:', navigate);
    
    const targetUrl = `/pacientes/${pacienteId}/historial`;
    console.log('🎯 URL objetivo:', targetUrl);
    
    // 🔥 FORZAR NAVEGACIÓN DIRECTA PARA EVITAR INTERFERENCIAS
    console.log('🚀 FORZANDO NAVEGACIÓN DIRECTA...');
    
    try {
      // Método 1: Navegación directa del navegador
      window.location.href = targetUrl;
      console.log('✅ Navegación forzada con window.location');
      
    } catch (error) {
      console.error('❌ Error en navegación forzada:', error);
      
      // Método 2: Backup con navigate
      try {
        navigate(targetUrl);
        console.log('✅ Backup con navigate ejecutado');
      } catch (error2) {
        console.error('❌ Error también con navigate:', error2);
      }
    }
    
    console.log('🔍 === FIN DEBUG NAVEGACIÓN ===');
  }, [navigate]);

  const verRadiografias = useCallback((pacienteId) => {
    alert(`Función de radiografías para paciente ${pacienteId} - En desarrollo`);
  }, []);

  // Función para formatear fecha - comentada por ahora
  // const formatearFecha = (fecha) => {
  //   if (!fecha) return 'Sin citas';
  //   const date = new Date(fecha);
  //   return date.toLocaleDateString('es-ES', {
  //     day: 'numeric',
  //     month: 'short',
  //     year: 'numeric'
  //   });
  // };

  if (loading) {
    return (
      <div className="pacientes-container-moderno">
        <div className="loading-moderno">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pacientes-container-moderno">
        <div className="error-moderno">
          <h3>❌ Error al cargar pacientes</h3>
          <p>{error}</p>
          <button onClick={cargarPacientes} className="btn-retry-moderno">
            🔄 Reintentar
          </button>
          
          {/* Debug info adicional */}
          <details style={{ marginTop: '20px', fontSize: '12px' }}>
            <summary>Información de depuración</summary>
            <div style={{ marginTop: '10px', textAlign: 'left', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              <p><strong>Usuario:</strong> {user?.nombre || 'No logueado'}</p>
              <p><strong>Rol:</strong> {user?.rol || 'Sin rol'}</p>
              <p><strong>Token presente:</strong> {localStorage.getItem('token') ? 'Sí' : 'No'}</p>
              <p><strong>URL de la API:</strong> {buildApiUrl('/pacientes')}</p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="pacientes-container-moderno" style={{ 
      height: 'calc(100vh - 60px)', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Debug info para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          background: '#f0f0f0',
          padding: '12px',
          margin: '12px 0',
          borderRadius: '6px',
          fontSize: '12px',
          border: '1px solid #ddd',
          fontFamily: 'monospace'
        }}>
          <strong>🔧 Debug Pacientes:</strong><br/>
          Usuario: {user?.nombre || 'No logueado'}<br/>
          Rol: {user?.rol || 'Sin rol'}<br/>
          Token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}<br/>
          Total pacientes: {pacientes.length}<br/>
          Pacientes filtrados: {pacientesFiltrados.length}<br/>
          Temporales: {pacientes.filter(p => p.es_temporal).length}<br/>
          Activos: {pacientes.filter(p => !p.es_temporal).length}<br/>
          Término búsqueda: "{busqueda}"<br/>
          Orden: {ordenPor}<br/>
          API URL: {buildApiUrl('/pacientes')}
        </div>
      )}

      {/* Header */}
      <div className="pacientes-header-moderno" style={{ flexShrink: 0 }}>
        <h1>Pacientes</h1>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="controles-pacientes" style={{ flexShrink: 0 }}>
        {/* Campo de búsqueda */}
        <div className="busqueda-container-moderno">
          <div className="busqueda-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar paciente por nombre, teléfono o email..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="busqueda-input-moderno"
          />
        </div>

        {/* Selector de ordenamiento */}
        <div className="orden-container">
          <select
            value={ordenPor}
            onChange={handleOrdenChange}
            className="orden-select"
          >
            <option value="nombre">Ordenar por nombre</option>
            <option value="edad">Ordenar por edad</option>
            <option value="ultimaCita">Ordenar por última cita</option>
          </select>
        </div>
      </div>

      {/* Tabla de pacientes con scroll FORZADO */}
      <div style={{ 
        flex: '1',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: 'white'
      }}>
        {/* Header de la tabla FIJO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 0.8fr 1.2fr 1.5fr 200px',
          gap: '16px',
          padding: '16px 24px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          fontSize: '0.875rem',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          flexShrink: 0
        }}>
          <div>Nombre</div>
          <div>Edad</div>
          <div>Teléfono</div>
          <div>Email</div>
          <div style={{ textAlign: 'center' }}>Acciones</div>
        </div>

        {/* ÁREA DE SCROLL FORZADA */}
        <div style={{
          flex: '1',
          overflowY: 'scroll',
          overflowX: 'hidden',
          maxHeight: 'calc(100vh - 250px)',
          minHeight: '500px'
        }}>
          {/* Filas de pacientes */}
          {pacientesFiltrados.length > 0 ? (
            pacientesFiltrados.map((paciente, index) => (
              <div
                key={`paciente-${paciente.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 0.8fr 1.2fr 1.5fr 200px',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: index < pacientesFiltrados.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#111827' }}>
                  {paciente.nombre_completo || `${paciente.nombre || 'N/A'} ${paciente.apellido_paterno || ''} ${paciente.apellido_materno || ''}`}
                  {paciente.es_temporal && (
                    <span style={{ 
                      color: '#f59e0b', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      marginLeft: '8px',
                      background: '#fef3c7',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      TEMPORAL
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: '1rem', color: '#6b7280' }}>
                  {paciente.edad === 'N/A' ? 'N/A' : `${paciente.edad} años`}
                </div>
                
                <div style={{ fontSize: '1rem', color: '#6b7280' }}>
                  {paciente.telefono || 'N/A'}
                </div>
                
                <div style={{ fontSize: '0.875rem', color: '#6b7280', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {paciente.correo_electronico || 'N/A'}
                </div>
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  {/* Botones para todos los pacientes */}
                  <button
                    onClick={(e) => {
                      console.log('🖱️ Click en botón historial');
                      console.log('📋 Paciente ID:', paciente.id);
                      console.log('🎯 Event:', e);
                      e.preventDefault();
                      e.stopPropagation();
                      verHistorialClinico(paciente.id);
                    }}
                    style={{
                      color: '#3b82f6',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    title="Ver Historial Clínico"
                  >
                    📋 Historial
                  </button>
                  
                  <button
                    onClick={() => verRadiografias(paciente.id)}
                    style={{
                      color: '#059669',
                      background: 'none',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#ecfdf5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    title="Ver Radiografías"
                  >
                    📸 Radiografías
                  </button>
                  
                  {/* 🆕 BOTÓN SOLO PARA PACIENTES TEMPORALES */}
                  {paciente.es_temporal && (
                    <button
                      onClick={() => handleEditarPaciente(paciente)}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease'
                      }}
                      title="Convertir a paciente activo"
                    >
                      🔄 Convertir
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '60px 24px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '1rem'
            }}>
              {busqueda 
                ? `No se encontraron pacientes que coincidan con "${busqueda}"`
                : 'No hay pacientes registrados'
              }
            </div>
          )}
        </div>
      </div>

      {/* Footer con estadísticas */}
      {pacientes.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '16px 24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '0.875rem',
          color: '#6b7280',
          flexShrink: 0
        }}>
          Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
          {busqueda && ` (filtrado por: "${busqueda}")`}
          <br />
          <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
            {pacientes.filter(p => !p.es_temporal).length} activos, {' '}
            {pacientes.filter(p => p.es_temporal).length} temporales
            {pacientes.filter(p => p.es_temporal).length > 0 && (
              <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                {' '}(expiran en 24h)
              </span>
            )}
          </small>
        </div>
      )}

      {/* Modal para convertir paciente temporal */}
      <ModalEditarPacienteTemporal
        isOpen={modalEditarOpen}
        onClose={() => setModalEditarOpen(false)}
        paciente={pacienteSeleccionado}
        onPacienteActualizado={handlePacienteActualizado}
      />
    </div>
  );
};

export default Pacientes;