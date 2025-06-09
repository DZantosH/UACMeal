import React, { useState } from 'react';
import { useAuth } from '../services/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Intentando login con:', formData.email);

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
      console.error('Error de login:', result.error);
    } else {
      console.log('Login exitoso');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Panel lateral izquierdo - celeste */}
      <div className="login-side-panel"></div>
      
      {/* Panel central - morado */}
      <div className="login-center-panel">
        <div className="login-content">
          <h1 className="login-title">Odon-SISTEMA</h1>
          
          <div className="login-form-container">
            <form onSubmit={handleSubmit}>
              {/* Campo Usuario */}
              <div className="form-field">
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="brandonrbarrera@gmail.com"
                    required
                  />
                </div>
              </div>
              
              {/* Campo Contraseña */}
              <div className="form-field">
                <label className="field-label">Contraseña</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <small className="forgot-password">Olvidó su contraseña</small>
              </div>
              
              {/* Mensaje de error */}
              {error && <div className="error-message">{error}</div>}
              
              {/* Botón submit */}
              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Panel lateral derecho - celeste */}
      <div className="login-right-panel"></div>
    </div>
  );
};

export default Login;