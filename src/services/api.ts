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
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`, config.data);
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
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error('API Response error:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Response error status:', error.response.status);
      console.error('Response error data:', error.response.data);
    } else if (error.request) {
      console.error('Request error (no response received):', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    // Handle token expiration or invalid token
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error - clearing stored data');
      // Clear stored authentication data
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

// Function to check if the backend is available
export const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    // Try the health-check endpoint first
    try {
      await api.get('/health-check', { timeout: 3000 });
      console.log('Backend is online (health-check endpoint)');
      return true;
    } catch (healthCheckError) {
      console.log('Health-check endpoint not available, trying an alternative endpoint');
      
      // If health-check fails, try a known endpoint as fallback
      // This helps if the backend doesn't have a health-check endpoint
      try {
        await api.get('/courses', { 
          params: { limit: 1 }, // Request minimal data
          timeout: 3000 
        });
        console.log('Backend is online (courses endpoint)');
        return true;
      } catch (fallbackError) {
        // If both checks fail, the server is likely offline
        console.error('Backend appears to be offline');
        return false;
      }
    }
  } catch (error) {
    console.error('Error checking backend availability:', error);
    return false;
  }
};

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
      
      // Store ONLY the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
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
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/current-user');
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch user data' 
      };
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
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
      // If verification fails, clear stored token
      localStorage.removeItem('token');
      return { valid: false };
    }
  },
  
  // Update user metadata method
  updateUserMetadata: async (userId: number, data: any) => {
    try {
      console.log("API call - update metadata:", userId, data);
      const response = await api.put(`/auth/users/${userId}/metadata`, data);
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Error updating user metadata:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to update user data' 
      };
    }
  },
  
  // Add a method specifically for teacher applications
  applyAsTeacher: async (userId: number, applicationData: any) => {
    try {
      console.log("API call - teacher application:", userId, applicationData);
      const response = await api.post(`/auth/users/${userId}/apply-teacher`, applicationData);
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Error submitting teacher application:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to submit teacher application' 
      };
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
  
  // Course creation and management
  createCourse: async (courseData: any) => {
    try {
      const response = await api.post('/courses', courseData);
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
      const response = await api.put(`/courses/${id}`, courseData);
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
      const response = await api.delete(`/courses/${id}`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to delete course' 
      };
    }
  },

  // Enrollment functions
  enrollInCourse: async (courseId: string) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to enroll in course' 
      };
    }
  },
  
  getEnrolledCourses: async () => {
    try {
      const response = await api.get('/user/enrolled-courses');
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch enrolled courses' 
      };
    }
  },
  
  getTeacherCourses: async () => {
    try {
      console.log('Fetching teacher courses from API...');
      
      // Add connection test before actual request
      try {
        // Ping the API with a simple request to check if it's reachable
        await api.get('/health-check', { timeout: 3000 });
      } catch (pingError: any) {
        if (pingError.code === 'ECONNABORTED' || !pingError.response) {
          console.error('API server appears to be unreachable:', pingError);
          return { 
            data: null, 
            error: 'Unable to connect to the server. Please check your internet connection or try again later.' 
          };
        }
      }
      
      // Proceed with actual request if ping succeeded
      const response = await api.get('/teacher/courses');
      console.log('Teacher courses fetched successfully:', response.data);
      return { data: response.data, error: null };
    } catch (error: any) {
      // Enhanced error logging
      console.error('Failed to fetch teacher courses:', error);
      
      // Check if the error is due to a network issue
      if (error.code === 'ECONNABORTED' || !error.response) {
        return { 
          data: null, 
          error: 'Unable to connect to the server. Please check your internet connection or try again later.' 
        };
      }
      
      // Check if it's a server error
      if (error.response?.status >= 500) {
        return { 
          data: null, 
          error: 'Server error. Our team has been notified and is working on it.' 
        };
      }
      
      // Check if it's a 404 - Resource not found
      if (error.response?.status === 404) {
        return { 
          data: null, 
          error: 'Teacher courses endpoint not found. The backend might not have implemented this feature yet.' 
        };
      }
      
      // Check if it's a 401/403 - Authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { 
          data: null, 
          error: 'You do not have permission to access teacher courses. Please verify your account status.' 
        };
      }
      
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch teacher courses. Backend server might be down or misconfigured.' 
      };
    }
  },
  
  getCourseAnalytics: async (courseId: string) => {
    try {
      const response = await api.get(`/teacher/courses/${courseId}/analytics`);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch course analytics' 
      };
    }
  }
};

// Add a dedicated admin service for admin-specific API calls
export const adminService = {
  getDashboardData: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Failed to fetch admin dashboard data:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch admin dashboard data' 
      };
    }
  },
  
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error('Failed to fetch users data:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch users data' 
      };
    }
  }
};

export default api;
