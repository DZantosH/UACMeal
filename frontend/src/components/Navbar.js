import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          Odon-SISTEMA
        </Link>
      </div>
      
      <div className="navbar-user">
        <span>Bienvenida {user?.nombre}!</span>
        <span className="user-role">({user?.rol})</span>
        <button onClick={logout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;