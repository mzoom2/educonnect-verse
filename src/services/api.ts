
import axios from 'axios';

// Create a base API instance with common configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Default to /api if VITE_API_URL is not set
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error.response || error);
    
    // Handle 401 Unauthorized (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Optional: Redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
