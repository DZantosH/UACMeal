import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './HistorialClinico.css';

// Importaciones de secciones externas
import FichaIdentificacion from './secciones/FichaIdentificación';
import MotivoConsulta from './secciones/MotivoConsulta';
import AntecedentesHeredoFamiliares from './secciones/AntecedentesHeredoFamiliares';
import AntecedentesPersonalesNoPatologicos from './secciones/AntecedentesPersonalesNoPatologicos';
import AntecedentesPersonalesPatologicos from './secciones/AntecedentesPersonalesPatologicos';
import ExamenBucal from './secciones/ExamenBucal';
import ExamenIntrabucal from './secciones/ExamenIntrabucal';
import Oclusion from './secciones/Oclusion';
import AuxiliaresDiagnostico from './secciones/AuxiliaresDiagnostico';
import DiagnosticoPronostico from './secciones/DiagnosticoPronostico';
import PlanTratamiento from './secciones/PlanTratamiento';

const HistorialClinico = () => {
  const { pacienteId } = useParams();
  const [seccionActiva, setSeccionActiva] = useState(1);
  const [datosFormulario, setDatosFormulario] = useState({});
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const carruselRef = useRef(null);

  useEffect(() => {
    const carrusel = carruselRef.current;
    if (!carrusel) return;

    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      carrusel.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    };

    carrusel.addEventListener('wheel', onWheel, { passive: false });
    return () => carrusel.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const response = await fetch(`/api/historial/${pacienteId}`);
        if (!response.ok) return;

        const historial = await response.json();
        setDatosFormulario(historial.datos || {});
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    };

    if (pacienteId) {
      cargarHistorial();
    }
  }, [pacienteId]);

  const secciones = [
    { id: 1, titulo: 'Ficha Identificación', completada: false },
    { id: 2, titulo: 'Motivo Consulta', completada: false },
    { id: 3, titulo: 'Ant. Heredo-Familiares', completada: false },
    { id: 4, titulo: 'Ant. Pers. No Patológicos', completada: false },
    { id: 5, titulo: 'Ant. Pers. Patológicos', completada: false },
    { id: 6, titulo: 'Examen Extrabucal', completada: false },
    { id: 7, titulo: 'Examen Intrabucal', completada: false },
    { id: 8, titulo: 'Oclusión', completada: false },
    { id: 9, titulo: 'Aux. Diagnóstico', completada: false },
    { id: 10, titulo: 'Diagnóstico', completada: false },
    { id: 11, titulo: 'Plan Tratamiento', completada: false }
  ];

  const avanceProgreso = (seccionActiva / secciones.length) * 100;

  const handleInputChange = (campo, valor) => {
    setDatosFormulario(prev => ({ ...prev, [campo]: valor }));
    setErrores(prev => ({ ...prev, [campo]: '' }));
  };

  const validarSeccion = () => {
    const nuevosErrores = {};
    if (seccionActiva === 1) {
      const camposObligatorios = {
        nombre: 'Nombre',
        apellidoPaterno: 'Apellido Paterno',
        apellidoMaterno: 'Apellido Materno',
        sexo: 'Sexo',
        fechaNacimiento: 'Fecha de Nacimiento',
        rfc: 'RFC',
        telefono: 'Teléfono',
        email: 'Correo Electrónico'
      };

      for (let campo in camposObligatorios) {
        if (!datosFormulario[campo] || datosFormulario[campo].trim() === '') {
          nuevosErrores[campo] = `Este campo es obligatorio`;
        }
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarSeccion = async () => {
    setGuardando(true);
    try {
      const response = await fetch(`/api/historial/${pacienteId}/seccion/${seccionActiva}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ datos: datosFormulario })
      });

      if (!response.ok) throw new Error('Error al guardar sección');
      console.log('Guardado exitoso');
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setGuardando(false);
    }
  };

  const siguienteSeccion = () => {
    if (!validarSeccion()) return;
    if (seccionActiva < secciones.length) {
      guardarSeccion();
      setSeccionActiva(seccionActiva + 1);
    }
  };

  const anteriorSeccion = () => {
    if (seccionActiva > 1) {
      setSeccionActiva(seccionActiva - 1);
    }
  };

  const renderSeccionActual = () => {
    const seccionProps = { datos: datosFormulario, errores, onChange: handleInputChange };

    switch (seccionActiva) {
      case 1: return <FichaIdentificacion {...seccionProps} />;
      case 2: return <MotivoConsulta {...seccionProps} />;
      case 3: return <AntecedentesHeredoFamiliares {...seccionProps} />;
      case 4: return <AntecedentesPersonalesNoPatologicos {...seccionProps} />;
      case 5: return <AntecedentesPersonalesPatologicos {...seccionProps} />;
      case 6: return <ExamenBucal {...seccionProps} />;
      case 7: return <ExamenIntrabucal {...seccionProps} />;
      case 8: return <Oclusion {...seccionProps} />;
      case 9: return <AuxiliaresDiagnostico {...seccionProps} />;
      case 10: return <DiagnosticoPronostico {...seccionProps} />;
      case 11: return <PlanTratamiento {...seccionProps} />;
      default: return <FichaIdentificacion {...seccionProps} />;
    }
  };

  return (
    <div className="historial-clinico-container">
      <div className="secciones-nav">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${avanceProgreso}%` }}></div>
        </div>
        <div className="secciones-carrusel" ref={carruselRef}>
          {secciones.map((seccion) => (
            <div
              key={seccion.id}
              className={`seccion-card ${
                seccion.id === seccionActiva ? 'active' : ''
              } ${seccion.completada ? 'completed' : ''}`}
              onClick={() => setSeccionActiva(seccion.id)}
            >
              <div className="seccion-numero">{seccion.id}</div>
              <div className="seccion-titulo">{seccion.titulo}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="seccion-content">
        <div className={`seccion-form ${seccionActiva === 1 ? 'sin-scroll' : ''}`}>
          {renderSeccionActual()}
        </div>
      </div>

      <div className="navegacion-footer">
        <div className="paciente-info-footer">
          <h2>Historial Clínico</h2>
          <div className="paciente-datos-footer">
            <p><strong>Fecha:</strong> 2025-05-31</p>
          </div>
        </div>

        <div className="navegacion-botones">
          {guardando && (
            <div className="guardado-temporal guardando">
              <div className="icono">•</div>
              Guardando
            </div>
          )}
          <button className="btn btn-volver" onClick={anteriorSeccion} disabled={seccionActiva === 1}>← Anterior</button>
          <button className="btn btn-siguiente" onClick={siguienteSeccion} disabled={guardando || seccionActiva === secciones.length}>
            {guardando ? 'Guardando...' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialClinico;
