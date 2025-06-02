// Detectar automáticamente el entorno basado en la URL
const getEnvironmentConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // Detección automática del entorno
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isProduction = hostname === 'odon-sys.forgestudio.com.mx';
  
  if (isLocalhost) {
    return {
      API_BASE_URL: 'http://localhost:5000/api',
      ENVIRONMENT: 'development',
      APP_URL: `${protocol}//${hostname}${port ? ':' + port : ''}`,
    };
  } else if (isProduction) {
    return {
      API_BASE_URL: '/api', // Rutas relativas en producción
      ENVIRONMENT: 'production',
      APP_URL: 'https://odon-sys.forgestudio.com.mx',
    };
  } else {
    // Fallback para otros dominios o IPs
    return {
      API_BASE_URL: '/api',
      ENVIRONMENT: 'production',
      APP_URL: `${protocol}//${hostname}`,
    };
  }
};

// Exportar configuración automática
export const CONFIG = getEnvironmentConfig();

// Variables específicas para fácil acceso
export const {
  API_BASE_URL,
  ENVIRONMENT,
  APP_URL
} = CONFIG;

// Helper para construir URLs de API
export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Log para debug (solo en desarrollo)
if (ENVIRONMENT === 'development') {
  console.log('🔧 Auto-detected config:', CONFIG);
}