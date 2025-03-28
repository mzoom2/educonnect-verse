
import { useCallback, useState, useEffect } from 'react';
import api from './api';
import { useToast } from '@/hooks/use-toast';

export interface CourseResource {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  uploadedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  author: string;
  image: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
  createdAt: string;
  viewCount?: number;
  enrollmentCount?: number;
  popularityScore?: number;
  resources?: CourseResource[];
}

// Function to fetch all courses from API
export async function fetchCourses(): Promise<Course[]> {
  try {
    const response = await api.get<Course[]>('/courses');
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

// Function to fetch course by ID
export async function fetchCourseById(id: string): Promise<Course> {
  try {
    const response = await api.get<Course>(`/courses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
}

// Function to search courses
export async function searchCourses(query: string): Promise<Course[]> {
  try {
    const response = await api.get<Course[]>(`/courses/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching courses with query ${query}:`, error);
    throw error;
  }
}

// Function to get courses by category
export async function fetchCoursesByCategory(category: string): Promise<Course[]> {
  try {
    const response = await api.get<Course[]>(`/courses/category/${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching courses in category ${category}:`, error);
    throw error;
  }
}

// Function to upload a course resource
export async function uploadCourseResource(
  file: File, 
  courseId: string, 
  type: string = 'document'
): Promise<CourseResource> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', courseId);
    formData.append('type', type);
    formData.append('folder', 'course-resources');
    
    const response = await api.post<{
      message: string;
      fileUrl: string;
      originalName: string;
      type: string;
    }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Create a resource structure matching CourseResource interface
    return {
      id: Date.now().toString(), // Temporary ID until server responds with real one
      name: response.data.originalName,
      type: response.data.type,
      url: response.data.fileUrl,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error uploading course resource:', error);
    throw error;
  }
}

// Function to fetch all course resources
export async function fetchCourseResources(courseId: string): Promise<CourseResource[]> {
  try {
    const response = await api.get<CourseResource[]>(`/courses/${courseId}/resources`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resources for course ${courseId}:`, error);
    throw error;
  }
}

// React hook for fetching all courses
export function useAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses();
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Failed to load courses",
          description: "There was an error loading the courses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error refetching courses:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast({
        title: "Failed to refresh courses",
        description: "There was an error refreshing the courses. Please try again later.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { courses, loading, error, refetch };
}

// React hook for fetching a specific course
export function useCourse(id: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCourseById(id);
        setCourse(data);
        setError(null);
      } catch (err) {
        console.error(`Error fetching course ${id}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Failed to load course",
          description: "There was an error loading the course details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, toast]);

  return { course, loading, error };
}
