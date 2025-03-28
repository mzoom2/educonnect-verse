
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

// Auth service for user management
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    // Additional cleanup if needed
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  updateUser: async (userId: string, userData: any) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },
  
  // Add the missing methods required by the TypeScript errors
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },
  
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return { valid: true, data: response.data };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, data: null };
    }
  },
  
  updateUserMetadata: async (userId: number, data: any) => {
    try {
      const response = await api.put(`/users/${userId}/metadata`, data);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Update user metadata error:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

export default api;
