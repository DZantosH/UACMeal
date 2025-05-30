import React from 'react';
import { useAuth } from '../services/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const currentTitle = usePageTitle();
  
  return (
    <div className="navbar">
      <div className="navbar-brand">
        🦷 Odon-SISTEMA - {currentTitle}
      </div>
      <div className="navbar-user">
        <span>Bienvenido {user?.nombre} ({user?.rol})</span>
        <button className="logout-btn" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Navbar;