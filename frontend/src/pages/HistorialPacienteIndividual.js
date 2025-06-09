import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const HistorialPacienteIndividual = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  
  // ✅ TODOS LOS HOOKS PRIMERO - SIN EXCEPCIONES
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActiva, setVistaActiva] = useState('resumen');

  // 🧪 DEBUG: Verificar que el ID se recibe correctamente
  console.log('🆔 pacienteId recibido desde useParams:', pacienteId);
  console.log('🆔 Tipo de pacienteId:', typeof pacienteId);
  console.log('🆔 URL actual:', window.location.pathname);
  
  // ⚠️ Validación del ID
  const idInvalido = !pacienteId || pacienteId === 'undefined';

  // ✅ useEffect con función interna para evitar dependencias
  useEffect(() => {
    const cargarDatos = async () => {
      if (!pacienteId || pacienteId === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔑 Verificando token...');
        const token = localStorage.getItem('token');
        console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');
        
        if (!token) {
          throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
        }
        
        const url = `/api/pacientes/${pacienteId}/historial`;
        console.log('🌐 URL de la petición:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Respuesta del servidor:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Error del servidor:', errorData);
          
          if (response.status === 401) {
            localStorage.removeItem('token');
            throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
          }
          
          throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Datos recibidos:', data);
        
        setPaciente(data.paciente);
        setHistorial(data.historial || []);
        
        if (data.historial && data.historial.length > 0) {
          setHistorialSeleccionado(data.historial[0]);
          console.log('📋 Historial seleccionado automáticamente:', data.historial[0].id);
        }
        
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [pacienteId]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseJSONSafely = (jsonString) => {
    if (!jsonString) return {};
    try {
      return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return {};
    }
  };

  const renderMotivoConsulta = () => {
    if (!historialSeleccionado) return null;
    
    const motivo = parseJSONSafely(historialSeleccionado.motivo_consulta);
    
    return (
      <div className="seccion-historial">
        <h3>🗣️ Motivo de Consulta</h3>
        <div className="contenido-seccion">
          {historialSeleccionado.motivo_consulta_texto && (
            <div className="campo">
              <strong>Descripción:</strong>
              <p>{historialSeleccionado.motivo_consulta_texto}</p>
            </div>
          )}
          
          {motivo.motivo_principal && (
            <div className="grid-campos">
              <div className="campo">
                <strong>Motivo principal:</strong>
                <span>{motivo.motivo_principal}</span>
              </div>
              
              {motivo.duracion && (
                <div className="campo">
                  <strong>Duración:</strong>
                  <span>{motivo.duracion}</span>
                </div>
              )}
              
              {motivo.intensidad && (
                <div className="campo">
                  <strong>Intensidad:</strong>
                  <span>{motivo.intensidad}</span>
                </div>
              )}
              
              {motivo.tipo_dolor && (
                <div className="campo">
                  <strong>Tipo de dolor:</strong>
                  <span>{motivo.tipo_dolor}</span>
                </div>
              )}
              
              {motivo.factores_agravantes && (
                <div className="campo">
                  <strong>Factores agravantes:</strong>
                  <span>{motivo.factores_agravantes}</span>
                </div>
              )}
              
              {motivo.factores_atenuantes && (
                <div className="campo">
                  <strong>Factores atenuantes:</strong>
                  <span>{motivo.factores_atenuantes}</span>
                </div>
              )}
              
              {motivo.urgencia && (
                <div className="campo">
                  <strong>Nivel de urgencia:</strong>
                  <span className={`urgencia urgencia-${motivo.urgencia.toLowerCase()}`}>
                    {motivo.urgencia}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAntecedentesHeredoFamiliares = () => {
    if (!historialSeleccionado) return null;
    
    const antecedentes = parseJSONSafely(historialSeleccionado.antecedentes_heredo_familiares);
    
    if (Object.keys(antecedentes).length === 0) return null;
    
    return (
      <div className="seccion-historial">
        <h3>👨‍👩‍👧‍👦 Antecedentes Heredo-Familiares</h3>
        <div className="contenido-seccion">
          <div className="grid-campos">
            {antecedentes.diabetes && (
              <div className="campo">
                <strong>Diabetes:</strong>
                <span>{antecedentes.diabetes}</span>
              </div>
            )}
            
            {antecedentes.hipertension && (
              <div className="campo">
                <strong>Hipertensión:</strong>
                <span>{antecedentes.hipertension}</span>
              </div>
            )}
            
            {antecedentes.cardiopatias && (
              <div className="campo">
                <strong>Cardiopatías:</strong>
                <span>{antecedentes.cardiopatias}</span>
              </div>
            )}
            
            {antecedentes.cancer && (
              <div className="campo">
                <strong>Cáncer:</strong>
                <span>{antecedentes.cancer}</span>
              </div>
            )}
            
            {antecedentes.alergias && (
              <div className="campo">
                <strong>Alergias familiares:</strong>
                <span>{antecedentes.alergias}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAntecedentesPersonalesNoPatologicos = () => {
    if (!historialSeleccionado) return null;
    
    const antecedentes = parseJSONSafely(historialSeleccionado.antecedentes_personales_no_patologicos);
    
    if (Object.keys(antecedentes).length === 0) return null;
    
    return (
      <div className="seccion-historial">
        <h3>🚭 Antecedentes Personales No Patológicos</h3>
        <div className="contenido-seccion">
          <div className="grid-campos">
            {antecedentes.tabaquismo && (
              <div className="campo">
                <strong>Tabaquismo:</strong>
                <span>{antecedentes.tabaquismo}</span>
              </div>
            )}
            
            {antecedentes.alcoholismo && (
              <div className="campo">
                <strong>Alcoholismo:</strong>
                <span>{antecedentes.alcoholismo}</span>
              </div>
            )}
            
            {antecedentes.drogas && (
              <div className="campo">
                <strong>Drogas:</strong>
                <span>{antecedentes.drogas}</span>
              </div>
            )}
            
            {antecedentes.ejercicio && (
              <div className="campo">
                <strong>Ejercicio:</strong>
                <span>{antecedentes.ejercicio}</span>
              </div>
            )}
            
            {antecedentes.alimentacion && (
              <div className="campo">
                <strong>Alimentación:</strong>
                <span>{antecedentes.alimentacion}</span>
              </div>
            )}
            
            {antecedentes.sueno && (
              <div className="campo">
                <strong>Sueño:</strong>
                <span>{antecedentes.sueno}</span>
              </div>
            )}
            
            {antecedentes.higiene_dental && (
              <div className="campo">
                <strong>Higiene dental:</strong>
                <span>{antecedentes.higiene_dental}</span>
              </div>
            )}
            
            {antecedentes.uso_hilo && (
              <div className="campo">
                <strong>Uso de hilo dental:</strong>
                <span>{antecedentes.uso_hilo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAntecedentesPersonalesPatologicos = () => {
    if (!historialSeleccionado) return null;
    
    const antecedentes = parseJSONSafely(historialSeleccionado.antecedentes_personales_patologicos);
    
    if (Object.keys(antecedentes).length === 0) return null;
    
    return (
      <div className="seccion-historial">
        <h3>🏥 Antecedentes Personales Patológicos</h3>
        <div className="contenido-seccion">
          <div className="grid-campos">
            {antecedentes.padecimientos_previos && (
              <div className="campo">
                <strong>Padecimientos previos:</strong>
                <span>{antecedentes.padecimientos_previos}</span>
              </div>
            )}
            
            {antecedentes.cirugias && (
              <div className="campo">
                <strong>Cirugías:</strong>
                <span>{antecedentes.cirugias}</span>
              </div>
            )}
            
            {antecedentes.alergias && (
              <div className="campo">
                <strong>Alergias:</strong>
                <span>{antecedentes.alergias}</span>
              </div>
            )}
            
            {antecedentes.medicamentos_actuales && (
              <div className="campo">
                <strong>Medicamentos actuales:</strong>
                <span>{antecedentes.medicamentos_actuales}</span>
              </div>
            )}
          </div>
          
          {antecedentes.signos_vitales && (
            <div className="subseccion">
              <h4>📊 Signos Vitales</h4>
              <div className="grid-campos">
                {Object.entries(antecedentes.signos_vitales).map(([key, value]) => (
                  <div key={key} className="campo">
                    <strong>{key.replace(/_/g, ' ')}:</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {antecedentes.somatometria && (
            <div className="subseccion">
              <h4>📏 Somatometría</h4>
              <div className="grid-campos">
                {Object.entries(antecedentes.somatometria).map(([key, value]) => (
                  <div key={key} className="campo">
                    <strong>{key.replace(/_/g, ' ')}:</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExamenExtrabucal = () => {
    if (!historialSeleccionado) return null;
    
    const examen = parseJSONSafely(historialSeleccionado.examen_extrabucal);
    
    if (Object.keys(examen).length === 0) return null;
    
    return (
      <div className="seccion-historial">
        <h3>👤 Examen Extrabucal</h3>
        <div className="contenido-seccion">
          <div className="grid-campos">
            {Object.entries(examen).map(([key, value]) => (
              <div key={key} className="campo">
                <strong>{key.replace(/_/g, ' ')}:</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderExamenIntrabucal = () => {
    if (!historialSeleccionado) return null;
    
    const examen = parseJSONSafely(historialSeleccionado.examen_intrabucal);
    
    if (Object.keys(examen).length === 0) return null;
    
    return (
      <div className="seccion-historial">
        <h3>🦷 Examen Intrabucal</h3>
        <div className="contenido-seccion">
          <div className="grid-campos">
            {Object.entries(examen).map(([key, value]) => (
              <div key={key} className="campo">
                <strong>{key.replace(/_/g, ' ')}:</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAuxiliaresDiagnostico = () => {
    if (!historialSeleccionado) return null;
    
    const auxiliares = parseJSONSafely(historialSeleccionado.auxiliares_diagnostico);
    
    if (Object.keys(auxiliares).length === 0) return null;
    
    return (
      <div className="seccion-historial">
        <h3>🔬 Auxiliares de Diagnóstico</h3>
        <div className="contenido-seccion">
          <div className="grid-campos">
            {Object.entries(auxiliares).map(([key, value]) => (
              <div key={key} className="campo">
                <strong>{key.replace(/_/g, ' ')}:</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDiagnosticoTratamiento = () => {
    if (!historialSeleccionado) return null;
    
    return (
      <div className="seccion-historial">
        <h3>🩺 Diagnóstico y Tratamiento</h3>
        <div className="contenido-seccion">
          {historialSeleccionado.diagnostico && (
            <div className="campo">
              <strong>Diagnóstico:</strong>
              <p>{historialSeleccionado.diagnostico}</p>
            </div>
          )}
          
          {historialSeleccionado.tratamiento && (
            <div className="campo">
              <strong>Tratamiento:</strong>
              <p>{historialSeleccionado.tratamiento}</p>
            </div>
          )}
          
          {historialSeleccionado.medicamentos && (
            <div className="campo">
              <strong>Medicamentos:</strong>
              <p>{historialSeleccionado.medicamentos}</p>
            </div>
          )}
          
          {historialSeleccionado.plan_tratamiento && (
            <div className="campo">
              <strong>Plan de tratamiento:</strong>
              <p>{historialSeleccionado.plan_tratamiento}</p>
            </div>
          )}
          
          {historialSeleccionado.observaciones && (
            <div className="campo">
              <strong>Observaciones:</strong>
              <p>{historialSeleccionado.observaciones}</p>
            </div>
          )}
          
          {historialSeleccionado.evolucion && (
            <div className="campo">
              <strong>Evolución:</strong>
              <p>{historialSeleccionado.evolucion}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContenidoVista = () => {
    if (!historialSeleccionado) {
      return (
        <div className="sin-historial">
          <p>No hay registros de historial clínico disponibles para este paciente.</p>
        </div>
      );
    }

    switch (vistaActiva) {
      case 'resumen':
        return (
          <div className="vista-resumen">
            {renderMotivoConsulta()}
            {renderDiagnosticoTratamiento()}
          </div>
        );
      
      case 'antecedentes':
        return (
          <div className="vista-antecedentes">
            {renderAntecedentesHeredoFamiliares()}
            {renderAntecedentesPersonalesNoPatologicos()}
            {renderAntecedentesPersonalesPatologicos()}
          </div>
        );
      
      case 'examenes':
        return (
          <div className="vista-examenes">
            {renderExamenExtrabucal()}
            {renderExamenIntrabucal()}
            {renderAuxiliaresDiagnostico()}
          </div>
        );
      
      case 'completo':
        return (
          <div className="vista-completa">
            {renderMotivoConsulta()}
            {renderAntecedentesHeredoFamiliares()}
            {renderAntecedentesPersonalesNoPatologicos()}
            {renderAntecedentesPersonalesPatologicos()}
            {renderExamenExtrabucal()}
            {renderExamenIntrabucal()}
            {renderAuxiliaresDiagnostico()}
            {renderDiagnosticoTratamiento()}
          </div>
        );
      
      default:
        return <div>Vista no encontrada</div>;
    }
  };

  // ⚠️ Validación del ID después de todos los hooks
  if (idInvalido) {
    return (
      <div className="historial-container">
        <div className="error">
          <h2>❌ Error</h2>
          <p>ID de paciente inválido: {pacienteId}</p>
          <p>URL actual: {window.location.pathname}</p>
          <button onClick={() => navigate('/pacientes')} className="btn-regresar">
            Regresar a Pacientes
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="historial-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando historial del paciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-container">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/pacientes')} className="btn-regresar">
            Regresar a Pacientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-container">
      {/* Header del paciente */}
      <div className="header-paciente">
        <button onClick={() => navigate('/pacientes')} className="btn-regresar">
          ← Regresar
        </button>
        
        {paciente && (
          <div className="info-paciente">
            <h1>
              {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
            </h1>
            <div className="datos-basicos">
              <span>📧 {paciente.correo_electronico || 'No especificado'}</span>
              <span>📞 {paciente.telefono || 'No especificado'}</span>
              <span>👤 {paciente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
              <span>🎂 {formatearFecha(paciente.fecha_nacimiento)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="historial-layout">
        {/* Sidebar con lista de historiales */}
        <div className="sidebar-historial">
          <h3>📋 Historiales Clínicos ({historial.length})</h3>
          
          {historial.length === 0 ? (
            <div className="sin-registros">
              <p>No hay registros disponibles</p>
            </div>
          ) : (
            <div className="lista-historiales">
              {historial.map((registro) => (
                <div
                  key={registro.id}
                  className={`item-historial ${historialSeleccionado?.id === registro.id ? 'activo' : ''}`}
                  onClick={() => setHistorialSeleccionado(registro)}
                >
                  <div className="fecha-historial">
                    {formatearFecha(registro.fecha_consulta)}
                  </div>
                  <div className="doctor-historial">
                    Dr. {registro.doctor_nombre}
                  </div>
                  <div className="tipo-cita">
                    {registro.tipo_cita || 'Consulta'}
                  </div>
                  <div className="estado-historial">
                    <span className={`estado ${registro.estado}`}>
                      {registro.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="contenido-historial">
          {historialSeleccionado && (
            <div className="header-historial-seleccionado">
              <h2>
                Historial del {formatearFecha(historialSeleccionado.fecha_consulta)}
              </h2>
              <div className="info-consulta">
                <span>👨‍⚕️ Dr. {historialSeleccionado.doctor_nombre}</span>
                <span>📅 {historialSeleccionado.tipo_cita}</span>
                <span className={`estado ${historialSeleccionado.estado}`}>
                  {historialSeleccionado.estado}
                </span>
              </div>
            </div>
          )}

          {/* Navegación de vistas */}
          <div className="nav-vistas">
            <button
              className={vistaActiva === 'resumen' ? 'activo' : ''}
              onClick={() => setVistaActiva('resumen')}
            >
              📄 Resumen
            </button>
            <button
              className={vistaActiva === 'antecedentes' ? 'activo' : ''}
              onClick={() => setVistaActiva('antecedentes')}
            >
              👨‍👩‍👧‍👦 Antecedentes
            </button>
            <button
              className={vistaActiva === 'examenes' ? 'activo' : ''}
              onClick={() => setVistaActiva('examenes')}
            >
              🔍 Exámenes
            </button>
            <button
              className={vistaActiva === 'completo' ? 'activo' : ''}
              onClick={() => setVistaActiva('completo')}
            >
              📋 Vista Completa
            </button>
          </div>

          {/* Contenido de la vista seleccionada */}
          <div className="contenido-vista">
            {renderContenidoVista()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialPacienteIndividual;