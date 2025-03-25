
import axios from 'axios';

// Create an axios instance with default config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      return { 
        data: null, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },
  
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { data: response.data, error: null };
    } catch (error: any) {
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
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
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
