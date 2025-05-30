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
      <div className="login-header-bar">
        <span>Login</span>
      </div>
      
      <div className="login-main">
        <div className="login-side-panel left-panel"></div>
        
        <div className="login-center-panel">
          <div className="login-content">
            <h1 className="login-title">Odon-SISTEMA</h1>
            
            <div className="login-form-container">
              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ID del usuario"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="field-label">Contraseña</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Contraseñas"
                      required
                    />
                  </div>
                  <small className="forgot-password">Olvido su contraseña</small>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
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
        
        <div className="login-side-panel right-panel"></div>
      </div>
      
      <div className="login-footer">
        <div className="footer-content">
          <span className="footer-logo">🦷</span>
        </div>
      </div>
    </div>
  );
};

export default Login;