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
      // Ensure we're explicitly sending the role update
      if (!applicationData.role) {
        applicationData.role = 'teacher';
      }
      
      const response = await api.post(`/auth/users/${userId}/apply-teacher`, applicationData);
      
      // Check if we got a valid response
      if (response.data) {
        console.log("Teacher application successful:", response.data);
      } else {
        console.error("No data in teacher application response");
      }
      
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
      console.log("API response - getAllCourses:", response.data);
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching all courses:", error);
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
      console.log("API call - creating course:", courseData);
      const response = await api.post('/courses', courseData);
      console.log("API response - createCourse success:", response.data);
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("Error creating course:", error);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      
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
  
  // Teacher-specific functions
  getTeacherCourses: async () => {
    try {
      console.log("API call - fetching teacher courses");
      const response = await api.get('/teacher/courses');
      console.log("API response - getTeacherCourses:", response.data);
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error("Error fetching teacher courses:", error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Failed to fetch teacher courses' 
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
