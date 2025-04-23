import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Inicio() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const datos = localStorage.getItem('usuario');
    if (datos) {
      setUsuario(JSON.parse(datos));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (!usuario) return <p>Cargando datos...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Bienvenido, {usuario.nombres} {usuario.apellido_paterno}</h2>
      <p><strong>Matrícula:</strong> {usuario.matricula}</p>
      <p><strong>Saldo actual:</strong> ${usuario.saldo}</p>
      <br />
      <button onClick={cerrarSesion}>Cerrar sesión</button>
    </div>
  );
}

export default Inicio;
