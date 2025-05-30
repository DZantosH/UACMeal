import React, { useState, useEffect, useCallback } from 'react';
import CitasDelDia from './CitasDelDia';

const CalendarioDinamico = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [citasPorDia, setCitasPorDia] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCitasDelDia, setShowCitasDelDia] = useState(false);

  const monthNames = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  const cargarCitasDelMes = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // +1 porque getMonth() devuelve 0-11
      
      const response = await fetch(`http://localhost:5000/api/citas/mes/${year}/${month}`);
      if (response.ok) {
        const data = await response.json();
        
        // Convertir array de citas en objeto con conteo por día
        const conteosPorDia = {};
        data.forEach(cita => {
          const fecha = cita.fecha_cita;
          const dia = new Date(fecha + 'T00:00:00').getDate();
          conteosPorDia[dia] = (conteosPorDia[dia] || 0) + 1;
        });
        
        setCitasPorDia(conteosPorDia);
      } else {
        setCitasPorDia({});
      }
    } catch (error) {
      console.error('Error al cargar citas del mes:', error);
      setCitasPorDia({});
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    cargarCitasDelMes();
  }, [cargarCitasDelMes]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendar = [];
    
    // Agregar encabezados de días
    dayNames.forEach(day => {
      calendar.push(
        <div key={day} className="calendar-day calendar-header">
          {day}
        </div>
      );
    });
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push(<div key={`empty-${i}`} className="calendar-day calendar-empty"></div>);
    }
    
    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentDay(year, month, day);
      const cantidadCitas = citasPorDia[day] || 0;
      const estadoColor = getEstadoColor(cantidadCitas);
      
      calendar.push(
        <div 
          key={day} 
          className={`calendar-day calendar-clickable ${isToday ? 'today' : ''} ${estadoColor}`}
          onClick={() => handleDayClick(year, month, day)}
        >
          <span className="day-number">{day}</span>
          {cantidadCitas > 0 && (
            <span className="citas-count">{cantidadCitas}</span>
          )}
        </div>
      );
    }
    
    return calendar;
  };

  const isCurrentDay = (year, month, day) => {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  };

  const getEstadoColor = (cantidadCitas) => {
    if (cantidadCitas >= 7) return 'estado-completo'; // Rojo - Lleno
    if (cantidadCitas >= 5) return 'estado-ocupado'; // Naranja - Ocupado
    if (cantidadCitas >= 3) return 'estado-medio'; // Amarillo - Medio
    if (cantidadCitas >= 1) return 'estado-libre'; // Verde - Casi libre
    return 'estado-vacio'; // Sin color - Vacío
  };

  const handleDayClick = (year, month, day) => {
    const fechaSeleccionada = new Date(year, month, day);
    setSelectedDate(fechaSeleccionada);
    setShowCitasDelDia(true);
  };

  const navegarMes = (direccion) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direccion);
    setCurrentDate(newDate);
  };

  const navegarAnio = (direccion) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentDate.getFullYear() + direccion);
    setCurrentDate(newDate);
  };

  const irAHoy = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      {/* CALENDARIO - Todo el contenido del calendario */}
      <div className="calendario-container">
        {/* Controles de navegación */}
        <div className="calendario-header">
          <div className="nav-controls">
            <button onClick={() => navegarAnio(-1)} className="nav-btn nav-year">
              ←← {currentDate.getFullYear() - 1}
            </button>
            <button onClick={() => navegarMes(-1)} className="nav-btn">
              ← {monthNames[currentDate.getMonth() - 1] || monthNames[11]}
            </button>
          </div>
          
          <div className="current-month-year">
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={irAHoy} className="btn-today">
              Ir a Hoy
            </button>
          </div>
          
          <div className="nav-controls">
            <button onClick={() => navegarMes(1)} className="nav-btn">
              {monthNames[currentDate.getMonth() + 1] || monthNames[0]} →
            </button>
            <button onClick={() => navegarAnio(1)} className="nav-btn nav-year">
              {currentDate.getFullYear() + 1} →→
            </button>
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="calendario-leyenda">
          <div className="leyenda-item">
            <div className="color-muestra estado-vacio"></div>
            <span>Sin citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra estado-libre"></div>
            <span>1-2 citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra estado-medio"></div>
            <span>3-4 citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra estado-ocupado"></div>
            <span>5-6 citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra estado-completo"></div>
            <span>7+ citas (Lleno)</span>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="calendar-grid-dynamic">
          {loading ? (
            <div className="calendar-loading">
              <p>Cargando calendario...</p>
            </div>
          ) : (
            generateCalendar()
          )}
        </div>
      </div>

      {/* SIDEBAR - CitasDelDia FUERA del calendario */}
      {showCitasDelDia && (
        <CitasDelDia 
          fecha={selectedDate}
          isOpen={showCitasDelDia}
          onClose={() => setShowCitasDelDia(false)}
        />
      )}
    </>
  );
};

export default CalendarioDinamico;