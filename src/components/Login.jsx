import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [matricula, setMatricula] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:4000/auth/login', {
        matricula,
        contrasena
      });

      // Guarda el token y usuario en localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));

      // Redirige a la vista Inicio
      navigate('/inicio');
    } catch (error) {
      console.error('Error en login:', error);
      setMensaje('Matrícula o contraseña incorrecta');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Matrícula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          required
        /><br /><br />

        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        /><br /><br />

        <button type="submit">Ingresar</button>
      </form>

      {mensaje && <p style={{ marginTop: '1rem', color: 'red' }}>{mensaje}</p>}
    </div>
  );
}

export default Login;
