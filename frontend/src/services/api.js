import axios from 'axios';

// Configuración base de Axios
const api = axios.create({
  baseURL: '/api', // Usamos proxy del package.json
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de API organizados por módulo

// Servicios de Autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Servicios de Usuarios
export const usuariosAPI = {
  getAll: () => api.get('/usuarios'),
  getDoctores: () => api.get('/usuarios/doctores'),
  create: (userData) => api.post('/usuarios', userData),
  update: (id, userData) => api.put(`/usuarios/${id}`, userData),
  resetPassword: (id, newPassword) => api.put(`/usuarios/${id}/reset-password`, { newPassword }),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// Servicios de Pacientes
export const pacientesAPI = {
  getAll: () => api.get('/pacientes'),
  getById: (id) => api.get(`/pacientes/${id}`),
  search: (query) => api.get(`/pacientes/buscar?q=${encodeURIComponent(query)}`),
  create: (pacienteData) => api.post('/pacientes', pacienteData),
  update: (id, pacienteData) => api.put(`/pacientes/${id}`, pacienteData),
  delete: (id) => api.delete(`/pacientes/${id}`),
};

// Servicios de Citas
export const citasAPI = {
  getToday: () => api.get('/citas/hoy'),
  getByDate: (fecha) => api.get(`/citas/fecha/${fecha}`),
  getAvailableHours: (doctorId, fecha) => api.get(`/citas/disponibles/${doctorId}/${fecha}`),
  create: (citaData) => api.post('/citas', citaData),
  updateStatus: (id, estado, observaciones) => api.put(`/citas/${id}/estado`, { estado, observaciones }),
  delete: (id) => api.delete(`/citas/${id}`),
};

// Servicios de Historial Clínico
export const historialAPI = {
  getByPaciente: (pacienteId) => api.get(`/historial/paciente/${pacienteId}`),
  getById: (id) => api.get(`/historial/${id}`),
  search: (termino) => api.get(`/historial/buscar/${encodeURIComponent(termino)}`),
  create: (historialData) => api.post('/historial', historialData),
  update: (id, historialData) => api.put(`/historial/${id}`, historialData),
  delete: (id) => api.delete(`/historial/${id}`),
};

// Utilidades para manejo de errores
export const handleAPIError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    return {
      message: error.response.data.error || 'Error del servidor',
      status: error.response.status,
    };
  } else if (error.request) {
    // Error de red
    return {
      message: 'Error de conexión. Verifica tu conexión a internet.',
      status: 0,
    };
  } else {
    // Error de configuración
    return {
      message: 'Error inesperado. Intenta nuevamente.',
      status: -1,
    };
  }
};

export default api;