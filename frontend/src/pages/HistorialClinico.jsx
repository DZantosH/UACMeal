import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HistorialClinico.css';

// Importar todos los componentes de las secciones
import FichaIdentificacion from './secciones/FichaIdentificacion';
import MotivoConsulta from './secciones/MotivoConsulta';
import AntecedentesHeredoFamiliares from './secciones/AntecedentesHeredoFamiliares';
import AntecedentesPersonalesNoPatologicos from './secciones/AntecedentesPersonalesNoPatologicos';
import AntecedentesPersonalesPatologicos from './secciones/AntecedentesPersonalesPatologicos';
import ExamenExtrabucal from './secciones/ExamenExtrabucal';
import ExamenIntrabucal from './secciones/ExamenIntrabucal';
import Oclusion from './secciones/Oclusion';
import AuxiliaresDiagnostico from './secciones/AuxiliaresDiagnostico';
import DiagnosticoPronostico from './secciones/DiagnosticoPronostico';
import PlanTratamiento from './secciones/PlanTratamiento';

const HistorialClinico = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  
  const [historialData, setHistorialData] = useState({
    paciente_id: pacienteId,
    fecha_elaboracion: new Date().toISOString().split('T')[0],
    ficha_identificacion: {},
    motivo_consulta: '',
    antecedentes_heredo_familiares: [],
    antecedentes_personales_no_patologicos: {},
    antecedentes_personales_patologicos: {},
    examen_extrabucal: {},
    examen_intrabucal: {},
    oclusion: {},
    auxiliares_diagnostico: {},
    diagnostico_pronostico: {},
    plan_tratamiento: {}
  });

  const [seccionActual, setSeccionActual] = useState(0);
  const [pacienteInfo, setPacienteInfo] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [historialId, setHistorialId] = useState(null);

  const secciones = [
    { id: 'ficha', titulo: 'Ficha de Identificación', componente: FichaIdentificacion },
    { id: 'motivo', titulo: 'Motivo de la Consulta', componente: MotivoConsulta },
    { id: 'heredo', titulo: 'Antecedentes Heredo-Familiares', componente: AntecedentesHeredoFamiliares },
    { id: 'no-patologicos', titulo: 'Antecedentes Personales No Patológicos', componente: AntecedentesPersonalesNoPatologicos },
    { id: 'patologicos', titulo: 'Antecedentes Personales Patológicos', componente: AntecedentesPersonalesPatologicos },
    { id: 'extrabucal', titulo: 'Examen Extrabucal', componente: ExamenExtrabucal },
    { id: 'intrabucal', titulo: 'Examen Intrabucal', componente: ExamenIntrabucal },
    { id: 'oclusion', titulo: 'Oclusión', componente: Oclusion },
    { id: 'auxiliares', titulo: 'Auxiliares de Diagnóstico', componente: AuxiliaresDiagnostico },
    { id: 'diagnostico', titulo: 'Diagnóstico y Pronóstico', componente: DiagnosticoPronostico },
    { id: 'plan', titulo: 'Plan de Tratamiento', componente: PlanTratamiento }
  ];

  useEffect(() => {
    cargarPacienteInfo();
    cargarHistorialExistente();
  }, [pacienteId]);

  const cargarPacienteInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pacientes/${pacienteId}`);
      if (response.ok) {
        const data = await response.json();
        setPacienteInfo(data);
        
        // Pre-llenar datos de identificación
        setHistorialData(prev => ({
          ...prev,
          ficha_identificacion: {
            nombre: data.nombre || '',
            apellido_paterno: data.apellido_paterno || '',
            apellido_materno: data.apellido_materno || '',
            sexo: data.sexo || '',
            fecha_nacimiento: data.fecha_nacimiento || '',
            lugar_nacimiento: data.lugar_nacimiento || '',
            lugar_procedencia: data.lugar_procedencia || '',
            grupo_etnico: data.grupo_etnico || '',
            religion: data.religion || '',
            rfc: data.rfc || '',
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            celular: data.celular || '',
            correo_electronico: data.correo_electronico || '',
            derecho_habiente: data.derecho_habiente || false,
            institucion: data.institucion || '',
            numero_filiacion: data.numero_filiacion || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error al cargar información del paciente:', error);
    }
  };

  const cargarHistorialExistente = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/historial-clinico/paciente/${pacienteId}`);
      if (response.ok) {
        const data = await response.json();
        setHistorialData(data);
        setHistorialId(data.id);
      }
    } catch (error) {
      console.error('Error al cargar historial existente:', error);
    }
  };

  const guardarSeccion = async (seccionId, datos) => {
    setHistorialData(prev => ({
      ...prev,
      [seccionId]: datos
    }));
    
    // Auto-guardar cada sección
    await guardarHistorial({
      ...historialData,
      [seccionId]: datos
    });
  };

  const guardarHistorial = async (datosCompletos = historialData) => {
    try {
      setGuardando(true);
      const url = historialId 
        ? `http://localhost:5000/api/historial-clinico/${historialId}`
        : 'http://localhost:5000/api/historial-clinico';
      
      const method = historialId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosCompletos)
      });

      if (response.ok) {
        const data = await response.json();
        if (!historialId) {
          setHistorialId(data.id);
        }
        console.log('Historial guardado exitosamente');
      }
    } catch (error) {
      console.error('Error al guardar historial:', error);
    } finally {
      setGuardando(false);
    }
  };

  const generarPDF = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/historial-clinico/${historialId}/pdf`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_clinico_${pacienteInfo?.nombre}_${pacienteInfo?.apellido_paterno}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  const siguienteSeccion = () => {
    if (seccionActual < secciones.length - 1) {
      setSeccionActual(seccionActual + 1);
    }
  };

  const seccionAnterior = () => {
    if (seccionActual > 0) {
      setSeccionActual(seccionActual - 1);
    }
  };

  const irASeccion = (indice) => {
    setSeccionActual(indice);
  };

  const SeccionActualComponent = secciones[seccionActual].componente;

  return (
    <div className="historial-clinico-container">
      {/* Header con información del paciente */}
      <div className="historial-header">
        <div className="paciente-info">
          <h1>Historial Clínico</h1>
          {pacienteInfo && (
            <div className="paciente-datos">
              <h2>{pacienteInfo.nombre} {pacienteInfo.apellido_paterno} {pacienteInfo.apellido_materno}</h2>
              <p>RFC: {pacienteInfo.rfc}</p>
              <p>Fecha de elaboración: {historialData.fecha_elaboracion}</p>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => guardarHistorial()}
            disabled={guardando}
            className="btn-guardar"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          
          {historialId && (
            <button 
              onClick={generarPDF}
              className="btn-pdf"
            >
              📄 Generar PDF
            </button>
          )}
          
          <button 
            onClick={() => navigate('/pacientes')}
            className="btn-volver"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* Navegación por secciones */}
      <div className="secciones-nav">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((seccionActual + 1) / secciones.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="secciones-list">
          {secciones.map((seccion, index) => (
            <button
              key={seccion.id}
              onClick={() => irASeccion(index)}
              className={`seccion-btn ${index === seccionActual ? 'active' : ''} ${index < seccionActual ? 'completed' : ''}`}
            >
              <span className="seccion-numero">{index + 1}</span>
              <span className="seccion-titulo">{seccion.titulo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de la sección actual */}
      <div className="seccion-content">
        <div className="seccion-header">
          <h3>{secciones[seccionActual].titulo}</h3>
          <span className="seccion-counter">
            {seccionActual + 1} de {secciones.length}
          </span>
        </div>

        <div className="seccion-form">
          <SeccionActualComponent
            data={historialData[secciones[seccionActual].id.replace('-', '_')] || {}}
            onUpdate={(datos) => guardarSeccion(secciones[seccionActual].id.replace('-', '_'), datos)}
            pacienteInfo={pacienteInfo}
          />
        </div>
      </div>

      {/* Navegación inferior */}
      <div className="navegacion-footer">
        <button 
          onClick={seccionAnterior}
          disabled={seccionActual === 0}
          className="btn-nav btn-anterior"
        >
          ← Anterior
        </button>
        
        <div className="seccion-info">
          Sección {seccionActual + 1} de {secciones.length}
        </div>
        
        <button 
          onClick={siguienteSeccion}
          disabled={seccionActual === secciones.length - 1}
          className="btn-nav btn-siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default HistorialClinico;