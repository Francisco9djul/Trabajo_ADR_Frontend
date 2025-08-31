import axios from 'axios';

// Obtener token desde localStorage o donde lo guardes tras login
const getToken = () => localStorage.getItem('accessToken');

// Crear instancia
const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Cambia por tu URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a cada request
api.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
