
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { courseService, authService } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

type ApiRequestState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

// Check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    // For Supabase, we can check if we can connect by making a simple query
    const { error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    console.log('Backend health check result:', error ? 'Error connecting' : 'Connected successfully');
    return !error;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Generic hook for API calls
export function useApi<T>(url: string, method: 'get' | 'post' | 'put' | 'delete' = 'get', body?: unknown, immediate = true, showErrorToast = true) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = useCallback(async (newBody?: unknown) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // First check if backend is available
      const isBackendHealthy = await checkBackendHealth();
      if (!isBackendHealthy) {
        throw new Error('Backend server is not available. Please check your connection to Supabase.');
      }
      
      const requestBody = newBody || body;
      
      console.log(`Making ${method.toUpperCase()} request to ${url}`, requestBody);
      
      // Parse URL to determine what service method to call
      const urlParts = url.split('/');
      let response: { data: any; error: string | null } | undefined;
      
      // Handle auth endpoints
      if (urlParts[1] === 'auth') {
        if (url === '/auth/current-user') {
          response = await authService.getCurrentUser();
        } else if (url === '/auth/verify-token') {
          response = await authService.verifyToken();
        } else if (url.includes('/auth/users') && url.includes('metadata') && method === 'put') {
          const userId = urlParts[3];
          response = await authService.updateUserMetadata(userId, requestBody);
        } else if (url.includes('/auth/users') && url.includes('apply-teacher') && method === 'post') {
          const userId = urlParts[3];
          response = await authService.applyAsTeacher(userId, requestBody);
        }
      }
      // Handle courses endpoints
      else if (urlParts[1] === 'courses') {
        if (method === 'get') {
          if (urlParts.length === 2) {
            console.log('Fetching all courses from Supabase...');
            response = await courseService.getAllCourses();
            console.log('Received response from getAllCourses:', response);
          } else if (urlParts[2] === 'search') {
            const query = new URLSearchParams(url.split('?')[1]).get('q') || '';
            response = await courseService.searchCourses(query);
          } else if (urlParts[2] === 'category') {
            response = await courseService.getCoursesByCategory(urlParts[3]);
          } else {
            response = await courseService.getCourseById(urlParts[2]);
          }
        }
      }
      // Handle admin endpoints
      else if (urlParts[1] === 'admin') {
        if (urlParts[2] === 'courses') {
          if (method === 'post') {
            response = await courseService.createCourse(requestBody);
          } else if (method === 'put' && urlParts.length > 3) {
            response = await courseService.updateCourse(urlParts[3], requestBody);
          } else if (method === 'delete' && urlParts.length > 3) {
            response = await courseService.deleteCourse(urlParts[3]);
          }
        }
      }
      // Handle teacher endpoints
      else if (urlParts[1] === 'teacher' && urlParts[2] === 'courses') {
        if (method === 'get') {
          response = await courseService.getTeacherCourses();
        }
      }
      
      // If response is undefined, throw error
      if (!response) {
        throw new Error(`Endpoint not implemented: ${url}`);
      }
      
      console.log(`Response received from ${url}:`, response);
      
      // Check for error in response
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Handle empty data for courses
      if (url === '/courses' && (!response.data || response.data.length === 0)) {
        console.log('No courses found, returning empty array instead of null');
        setState({
          data: ([] as unknown) as T,
          isLoading: false,
          error: null,
        });
        return { data: ([] as unknown) as T, error: null };
      }
      
      setState({
        data: response.data as T,
        isLoading: false,
        error: null,
      });
      
      return { data: response.data as T, error: null };
    } catch (error: any) {
      console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error);
      
      const errorMessage = error.message || 'An error occurred';
      
      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
      });
      
      // Handle authentication errors
      if (errorMessage.includes('not authenticated') || errorMessage.includes('JWT expired')) {
        // Redirect to login page if unauthorized
        navigate('/login');
      }
      
      if (showErrorToast) {
        toast({
          title: "API Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return { data: null, error: errorMessage };
    }
  }, [url, method, body, toast, showErrorToast, navigate]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { ...state, fetchData, refetch: fetchData };
}

// Specialized hooks for common operations
export function useGetCourses(immediate = true) {
  return useApi('/courses', 'get', undefined, immediate);
}

export function useSearchCourses(query: string) {
  return useApi(`/courses/search?q=${encodeURIComponent(query)}`, 'get', undefined, !!query);
}

export function useCoursesByCategory(category: string, immediate = true) {
  return useApi(`/courses/category/${category}`, 'get', undefined, immediate);
}

export function useCourseDetails(id: string, immediate = true) {
  return useApi(`/courses/${id}`, 'get', undefined, immediate);
}

// Admin specific hooks
export function useAdminDashboard(immediate = true) {
  return useApi('/admin/dashboard', 'get', undefined, immediate);
}

export function useAdminUsers(immediate = true) {
  return useApi('/admin/users', 'get', undefined, immediate);
}

export function useCreateCourse() {
  return useApi('/admin/courses', 'post', undefined, false);
}

export function useUpdateCourse(id: string) {
  return useApi(`/admin/courses/${id}`, 'put', undefined, false);
}

export function useDeleteCourse(id: string) {
  return useApi(`/admin/courses/${id}`, 'delete', undefined, false);
}
