
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

// Authentication service
export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
  
  // Login function
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      return { error: null, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { error: errorMessage, data: null };
    }
  },
  
  // Register function
  register: async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username });
      return { error: null, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { error: errorMessage, data: null };
    }
  },
  
  // Logout function
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return { error: null, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get user data';
      return { error: errorMessage, data: null };
    }
  },
  
  // Verify auth token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return { valid: true, data: response.data };
    } catch (error) {
      return { valid: false, data: null };
    }
  },
  
  // Update user metadata
  updateUserMetadata: async (userId: number, metadata: any) => {
    try {
      const response = await api.put(`/users/${userId}/metadata`, { metadata });
      return { error: null, data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user metadata';
      return { error: errorMessage, data: null };
    }
  }
};

export default api;
