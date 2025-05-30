import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PanelPrincipal from './pages/PanelPrincipal';
import Pacientes from './pages/Pacientes';
import HistorialClinico from './pages/HistorialClinico';
import Citas from './pages/Citas';
import './App.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Componente principal de la app
const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        
        {/* Rutas protegidas con layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Rutas anidadas que se renderizan en <Outlet /> */}
          <Route index element={<PanelPrincipal />} />
          <Route path="panel" element={<PanelPrincipal />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="historial" element={<HistorialClinico />} />
          <Route path="citas" element={<Citas />} />
        </Route>
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

// App principal con provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;