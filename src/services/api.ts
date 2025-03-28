
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

// Auth service for authentication-related operations
export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        return { data: response.data, error: null };
      }
      return { data: null, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { data: null, error: error.response.data.message || 'Authentication failed' };
      }
      return { data: null, error: 'Authentication failed' };
    }
  },
  
  // Register user
  register: async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { data: null, error: error.response.data.message || 'Registration failed' };
      }
      return { data: null, error: 'Registration failed' };
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
  },
  
  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { data: null, error: error.response.data.message || 'Failed to get user data' };
      }
      return { data: null, error: 'Failed to get user data' };
    }
  },
  
  // Verify token validity
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return { valid: true, data: response.data };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, data: null };
    }
  },
  
  // Update user metadata
  updateUserMetadata: async (userId: number, metadata: any) => {
    try {
      const response = await api.patch(`/users/${userId}/metadata`, { metadata });
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Update user metadata error:', error);
      if (axios.isAxiosError(error) && error.response) {
        return { data: null, error: error.response.data.message || 'Failed to update user metadata' };
      }
      return { data: null, error: 'Failed to update user metadata' };
    }
  }
};

export default api;
