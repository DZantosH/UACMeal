import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Login from './pages/Login';
import PanelPrincipal from './pages/PanelPrincipal';
import Pacientes from './pages/Pacientes';
import HistorialClinico from './pages/HistorialClinico';
import Citas from './pages/Citas';
import Navbar from './components/Navbar';
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

// Componente principal de la aplicación
const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <div className="App">
      {user && <Navbar />}
      <div className={user ? "main-content" : "login-content"}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PanelPrincipal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pacientes" 
            element={
              <ProtectedRoute>
                <Pacientes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/historial/:pacienteId?" 
            element={
              <ProtectedRoute>
                <HistorialClinico />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citas" 
            element={
              <ProtectedRoute>
                <Citas />
              </ProtectedRoute>
            } 
          />
          {/* Ruta por defecto - redirigir a login si no está autenticado */}
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;