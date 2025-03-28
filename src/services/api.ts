
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

// Auth service implementation
export const authService = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Login user
  login: async (email: string, password: string) => {
    try {
      // In a real implementation, this would call your backend API
      // For now, simulate a successful login with a mock token
      console.log('Login attempt with:', { email });
      
      // Mock successful response
      const mockResponse = {
        token: 'mock_token_' + Date.now(),
        user: {
          id: 1,
          email,
          username: email.split('@')[0],
          role: 'student'
        }
      };
      
      // Store token in localStorage
      localStorage.setItem('token', mockResponse.token);
      
      return { data: mockResponse, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: 'Authentication failed' };
    }
  },
  
  // Register new user
  register: async (email: string, password: string, username: string) => {
    try {
      // In a real implementation, this would call your backend API
      console.log('Register attempt with:', { email, username });
      
      // Mock successful response
      const mockResponse = {
        user: {
          id: 1,
          email,
          username,
          role: 'student',
          created_at: new Date().toISOString()
        }
      };
      
      return { data: mockResponse, error: null };
    } catch (error) {
      console.error('Registration error:', error);
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
      // In a real implementation, this would call your backend API
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { data: null, error: 'Not authenticated' };
      }
      
      // Mock user data
      const mockUserData = {
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'username',
          role: 'student',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          metadata: {
            balance: 5000
          }
        }
      };
      
      return { data: mockUserData, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { data: null, error: 'Failed to fetch user data' };
    }
  },
  
  // Verify token validity
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { valid: false, data: null };
      }
      
      // Mock user data
      const mockUserData = {
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'username',
          role: 'student',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      };
      
      return { valid: true, data: mockUserData };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, data: null };
    }
  },
  
  // Update user metadata
  updateUserMetadata: async (userId: number, data: any) => {
    try {
      console.log('Updating metadata for user', userId, 'with data:', data);
      
      // In a real implementation, this would call your backend API
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Update user metadata error:', error);
      return { data: null, error: 'Failed to update user metadata' };
    }
  }
};

export default api;
