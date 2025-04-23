import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Registro() {
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [matricula, setMatricula] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const navigate = useNavigate();

  const verificarExistencia = async () => {
    try {
      const res = await axios.post('http://localhost:4000/auth/verificar', {
        correo,
        matricula
      });
      return res.data.existe;
    } catch (error) {
      console.error('Error al verificar existencia:', error);
      return false;
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    const yaExiste = await verificarExistencia();

    if (yaExiste) {
      setMensaje('El correo o matrícula ya están registrados.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/auth/registro', {
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        matricula,
        correo,
        contrasena
      });

      setMensaje(res?.data?.message || 'Usuario registrado correctamente');

      // Redireccionar al login después de 1.5 segundos
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error en registro:', error);
      setMensaje('Error al registrar. Intenta nuevamente.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleRegistro}>
        <input
          type="text"
          placeholder="Nombre(s)"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          required
        /><br /><br />

        <input
          type="text"
          placeholder="Apellido Paterno"
          value={apellidoPaterno}
          onChange={(e) => setApellidoPaterno(e.target.value)}
          required
        /><br /><br />

        <input
          type="text"
          placeholder="Apellido Materno"
          value={apellidoMaterno}
          onChange={(e) => setApellidoMaterno(e.target.value)}
          required
        /><br /><br />

        <input
          type="text"
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
        /><br /><br />

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Registrar</button>
      </form>

      {mensaje && <p style={{ marginTop: '1rem', color: mensaje.includes('correctamente') ? 'green' : 'red' }}>{mensaje}</p>}
    </div>
  );
}

export default Registro;
