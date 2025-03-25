
import axios from 'axios';

// Create an axios instance with default config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response error:', error);
    
    // Handle token expiration or invalid token
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error - clearing stored data');
      // Clear stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  register: async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username });
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Make sure user data is properly structured before storing
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          console.error('No user data in login response');
          return { 
            data: null, 
            error: 'Invalid user data in response' 
          };
        }
      } else {
        console.error('No token in login response');
        return { 
          data: null, 
          error: 'No authentication token received' 
        };
      }
      
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      // If there's an error parsing the user data, clear it
      localStorage.removeItem('user');
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  isAdmin: () => {
    try {
      const user = authService.getCurrentUser();
      return user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  // Add a method to verify token validity with the backend
  verifyToken: async () => {
    try {
      if (!localStorage.getItem('token')) {
        return { valid: false };
      }
      
      const response = await api.get('/auth/verify-token');
      return { valid: true, data: response.data };
    } catch (error) {
      console.error('Token verification error:', error);
      // If verification fails, clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { valid: false };
    }
  }
};

// Course service functions
export const courseService = {
  getAllCourses: async () => {
    try {
      const response = await api.get('/courses');
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch courses' 
      };
    }
  },
  
  getCourseById: async (id: string) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch course' 
      };
    }
  },
  
  getCoursesByCategory: async (category: string) => {
    try {
      const response = await api.get(`/courses/category/${category}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch courses by category' 
      };
    }
  },
  
  searchCourses: async (query: string) => {
    try {
      const response = await api.get(`/courses/search?q=${query}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to search courses' 
      };
    }
  },
  
  // Admin functions
  createCourse: async (courseData: any) => {
    try {
      const response = await api.post('/admin/courses', courseData);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to create course' 
      };
    }
  },
  
  updateCourse: async (id: string, courseData: any) => {
    try {
      const response = await api.put(`/admin/courses/${id}`, courseData);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to update course' 
      };
    }
  },
  
  deleteCourse: async (id: string) => {
    try {
      const response = await api.delete(`/admin/courses/${id}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to delete course' 
      };
    }
  }
};

export default api;
