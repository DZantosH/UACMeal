const getEnvironmentConfig = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  return {
    API_BASE_URL: process.env.REACT_APP_API_URL || (isLocalhost ? 'http://localhost:5000/api' : '/api'),
    ENVIRONMENT: isLocalhost ? 'development' : 'production',
    APP_URL: `${protocol}//${hostname}${port ? ':' + port : ''}`,
  };
};

export const CONFIG = getEnvironmentConfig();

export const {
  API_BASE_URL,
  ENVIRONMENT,
  APP_URL
} = CONFIG;

export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

if (ENVIRONMENT === 'development') {
  console.log('🔧 Auto-detected config:', CONFIG);
}
