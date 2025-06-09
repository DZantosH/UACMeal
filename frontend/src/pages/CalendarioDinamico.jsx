import React, { useState, useEffect, useCallback } from 'react';
import CitasDelDia from './CitasDelDia';
import { buildApiUrl } from '../config/config.js';
import { useAuth } from '../services/AuthContext';

const CalendarioDinamico = () => {
  const { user } = useAuth();
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const cargarCitasDelMes = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      console.log('🗓️ Cargando citas del mes:', `${year}/${month}`);
      
      const response = await fetch(buildApiUrl(`/citas/mes/${year}/${month}`), {
        headers: getAuthHeaders()
      });
      
      console.log('📡 Response citas del mes:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ RAW DATA del backend:', data);
        
        // Convertir array de citas en objeto con conteo por día
        const conteosPorDia = {};
        
        data.forEach((cita, index) => {
          console.log(`📅 Procesando cita ${index + 1}:`, cita);
          
          const fechaCita = cita.fecha_cita;
          console.log('📅 Fecha original:', fechaCita, 'Tipo:', typeof fechaCita);
          
          // ✅ MÚLTIPLES FORMAS DE PARSEAR LA FECHA
          let dia = null;
          
          try {
            // Método 1: Si la fecha viene como YYYY-MM-DD
            if (typeof fechaCita === 'string' && fechaCita.includes('-')) {
              const partes = fechaCita.split('-');
              const añoCita = parseInt(partes[0]);
              const mesCita = parseInt(partes[1]);
              const diaCita = parseInt(partes[2]);
              
              console.log('📅 Partes de fecha:', { año: añoCita, mes: mesCita, día: diaCita });
              
              // Verificar que estamos en el mes correcto
              if (añoCita === year && mesCita === month) {
                dia = diaCita;
              }
            }
            // Método 2: Si la fecha viene como Date object
            else if (fechaCita instanceof Date) {
              const fechaObj = new Date(fechaCita);
              if (fechaObj.getFullYear() === year && (fechaObj.getMonth() + 1) === month) {
                dia = fechaObj.getDate();
              }
            }
            // Método 3: Crear Date object y extraer día
            else {
              const fechaObj = new Date(fechaCita);
              console.log('📅 Fecha parseada:', fechaObj);
              
              if (!isNaN(fechaObj.getTime()) && 
                  fechaObj.getFullYear() === year && 
                  (fechaObj.getMonth() + 1) === month) {
                dia = fechaObj.getDate();
              }
            }
            
            console.log('📅 Día extraído:', dia);
            
            if (dia && !isNaN(dia) && dia >= 1 && dia <= 31) {
              conteosPorDia[dia] = (conteosPorDia[dia] || 0) + 1;
              console.log(`✅ Conteo actualizado para día ${dia}: ${conteosPorDia[dia]}`);
            } else {
              console.error('❌ Día inválido:', dia, 'para fecha:', fechaCita);
            }
            
          } catch (error) {
            console.error('❌ Error parseando fecha:', fechaCita, error);
          }
        });
        
        console.log('📊 CONTEOS FINALES por día:', conteosPorDia);
        setCitasPorDia(conteosPorDia);
      } else {
        console.error('❌ Error al cargar citas del mes:', response.status);
        setCitasPorDia({});
      }
    } catch (error) {
      console.error('❌ Error al cargar citas del mes:', error);
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
      
      // 🔍 DEBUG PARA CADA DÍA
      if (cantidadCitas > 0) {
        console.log(`🎯 RENDERIZANDO DÍA ${day}: ${cantidadCitas} citas → Color: ${estadoColor}`);
      }
      
      // ✅ CONSTRUIR CLASES CSS
      let clases = ['calendar-day', 'calendar-clickable'];
      
      if (isToday) {
        clases.push('today');
      }
      
      if (estadoColor && estadoColor !== 'estado-vacio') {
        clases.push(estadoColor);
      }
      
      const clasesFinales = clases.join(' ');
      
      calendar.push(
        <div 
          key={day} 
          className={clasesFinales}
          onClick={() => handleDayClick(year, month, day)}
          style={{
            // 🎨 ESTILOS INLINE FORZADOS
            ...(cantidadCitas >= 7 && {
              background: 'linear-gradient(135deg, #fecaca, #fca5a5) !important',
              borderLeft: '4px solid #dc2626 !important',
              color: '#991b1b'
            }),
            ...(cantidadCitas >= 5 && cantidadCitas < 7 && {
              background: 'linear-gradient(135deg, #fed7aa, #fdba74) !important',
              borderLeft: '4px solid #f97316 !important',
              color: '#9a3412'
            }),
            ...(cantidadCitas >= 3 && cantidadCitas < 5 && {
              background: 'linear-gradient(135deg, #fef3c7, #fed7aa) !important',
              borderLeft: '4px solid #f59e0b !important',
              color: '#92400e'
            }),
            ...(cantidadCitas >= 1 && cantidadCitas < 3 && {
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0) !important',
              borderLeft: '4px solid #10b981 !important',
              color: '#065f46'
            })
          }}
        >
          <span className="day-number" style={{
            fontWeight: cantidadCitas > 0 ? '700' : '600',
            color: 'inherit'
          }}>
            {day}
          </span>
          {cantidadCitas > 0 && (
            <span className="citas-count" style={{
              background: cantidadCitas >= 7 ? '#dc2626' :
                         cantidadCitas >= 5 ? '#f97316' :
                         cantidadCitas >= 3 ? '#f59e0b' : '#10b981',
              color: cantidadCitas >= 3 && cantidadCitas < 5 ? '#000' : '#fff',
              borderRadius: '12px',
              padding: '2px 6px',
              fontSize: '0.65rem',
              fontWeight: '700',
              minWidth: '18px',
              textAlign: 'center',
              display: 'inline-block',
              marginTop: '2px'
            }}>
              {cantidadCitas}
            </span>
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
    if (cantidadCitas >= 7) return 'estado-completo'; // Rojo - Lleno (7+ citas)
    if (cantidadCitas >= 5) return 'estado-ocupado'; // Naranja - Ocupado (5-6 citas)
    if (cantidadCitas >= 3) return 'estado-medio'; // Amarillo - Medio (3-4 citas)
    if (cantidadCitas >= 1) return 'estado-libre'; // Verde - Libre (1-2 citas)
    return 'estado-vacio'; // Sin color - Vacío (0 citas)
  };

  const handleDayClick = (year, month, day) => {
    const fechaSeleccionada = new Date(year, month, day);
    console.log('📅 Día seleccionado:', fechaSeleccionada);
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
      <div className="calendario-container">
        {/* Debug info SÚPER DETALLADO */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            background: '#f0f0f0',
            padding: '12px',
            margin: '8px 0',
            borderRadius: '6px',
            fontSize: '11px',
            border: '1px solid #ddd',
            fontFamily: 'monospace'
          }}>
            <strong>🔧 Debug Calendario:</strong><br/>
            Usuario: {user?.nombre || 'No logueado'}<br/>
            Token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}<br/>
            Mes actual: {currentDate.getMonth() + 1}/{currentDate.getFullYear()}<br/>
            <strong>📊 Citas por día:</strong> {JSON.stringify(citasPorDia)}<br/>
            <strong>🎨 Días con colores:</strong> {Object.keys(citasPorDia).filter(dia => !isNaN(dia) && citasPorDia[dia] > 0).length}<br/>
            <strong>📈 Total citas del mes:</strong> {Object.values(citasPorDia).reduce((sum, count) => sum + count, 0)}
          </div>
        )}

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
            <div className="color-muestra" style={{background: '#f9fafb', border: '1px solid #e5e7eb', width: '12px', height: '12px', borderRadius: '4px'}}></div>
            <span>Sin citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra" style={{background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', border: '1px solid #10b981', width: '12px', height: '12px', borderRadius: '4px'}}></div>
            <span>1-2 citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra" style={{background: 'linear-gradient(135deg, #fef3c7, #fed7aa)', border: '1px solid #f59e0b', width: '12px', height: '12px', borderRadius: '4px'}}></div>
            <span>3-4 citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra" style={{background: 'linear-gradient(135deg, #fed7aa, #fdba74)', border: '1px solid #f97316', width: '12px', height: '12px', borderRadius: '4px'}}></div>
            <span>5-6 citas</span>
          </div>
          <div className="leyenda-item">
            <div className="color-muestra" style={{background: 'linear-gradient(135deg, #fecaca, #fca5a5)', border: '1px solid #dc2626', width: '12px', height: '12px', borderRadius: '4px'}}></div>
            <span>7+ citas (Lleno)</span>
          </div>
        </div>

        {/* Grid del calendario */}
        <div className="calendar-grid-dynamic">
          {loading ? (
            <div className="calendar-loading" style={{
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid #f3f4f6',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '12px'
              }}></div>
              Cargando calendario...
            </div>
          ) : (
            generateCalendar()
          )}
        </div>
      </div>

      {/* MODAL */}
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