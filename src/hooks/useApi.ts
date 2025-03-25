
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';

type ApiRequestState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

type ApiMethod = 'get' | 'post' | 'put' | 'delete';

// Generic hook for API calls
export function useApi<T>(url: string, method: ApiMethod = 'get', body?: unknown, immediate = true, showErrorToast = true) {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });
  const { toast } = useToast();

  const fetchData = useCallback(async (newBody?: unknown) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const requestBody = newBody || body;
      let response;
      
      console.log(`Making ${method.toUpperCase()} request to ${url}`);
      
      switch (method) {
        case 'get':
          response = await api.get<T>(url);
          break;
        case 'post':
          response = await api.post<T>(url, requestBody);
          break;
        case 'put':
          response = await api.put<T>(url, requestBody);
          break;
        case 'delete':
          response = await api.delete<T>(url);
          break;
        default:
          throw new Error(`Unsupported API method: ${method}`);
      }
      
      console.log(`Response received from ${url}:`, response.data);
      
      setState({
        data: response.data,
        isLoading: false,
        error: null,
      });
      
      return { data: response.data, error: null };
    } catch (error: any) {
      console.error(`Error during ${method.toUpperCase()} request to ${url}:`, error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'An error occurred';
      
      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
      });
      
      if (showErrorToast) {
        toast({
          title: "API Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return { data: null, error: errorMessage };
    }
  }, [url, method, body, toast, showErrorToast]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { ...state, refetch: fetchData };
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
