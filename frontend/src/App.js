import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PanelPrincipal from './pages/PanelPrincipal';
import Pacientes from './pages/Pacientes';
import Citas from './pages/Citas';
import HistorialClinico from './historial/HistorialClinico';
import HistorialPacienteIndividual from './pages/HistorialPacienteIndividual';
import './App.css';

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

const AppContent = () => {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login />} 
        />
        
        <Route 
  path="/" 
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  <Route index element={<PanelPrincipal />} />
  <Route path="panel" element={<PanelPrincipal />} />
  <Route path="pacientes" element={<Pacientes />} />
  
  {/* 📋 RUTA: Lista general de historiales */}
  <Route path="historial-clinico" element={<HistorialClinico />} />
  
  {/* 📋 RUTA: Historial individual de paciente */}
  <Route path="pacientes/:pacienteId/historial" element={<HistorialPacienteIndividual />} />
  
  <Route path="citas" element={<Citas />} />
</Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;