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

export interface PracticalTask {
  id?: string;
  title?: string;
  description: string;
  expectedOutcome: string;
  reward: number;
  requirements?: string[];
  points?: number;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  reward: number;
  points?: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  content: string;
  order: number;
  quiz?: QuizQuestion[];
  practicalTask?: PracticalTask;
  videoUrl?: string;
}

export interface CourseCreationData {
  title: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  image: string;
  lessons: CourseLesson[];
  difficulty?: string;
  prerequisites?: string;
  estimatedHours?: number;
  imageUrl?: string;
  isDraft?: boolean;
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
    console.log('Uploading course resource:', { file, courseId, type });
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
    
    console.log('Upload response:', response.data);
    
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

// Function to create a new course
export async function createCourse(courseData: CourseCreationData): Promise<Course> {
  try {
    console.log('Creating course with data:', JSON.stringify(courseData, null, 2));
    
    // Log the structure of lessons to check if they're properly formatted
    if (courseData.lessons) {
      console.log('Number of lessons:', courseData.lessons.length);
      console.log('First lesson sample:', JSON.stringify(courseData.lessons[0], null, 2));
    }
    
    const response = await api.post<Course>('/courses', courseData);
    console.log('Course creation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating course:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Server responded with:', error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up the request:', error.message);
    }
    
    throw error;
  }
}

// Function to save course as draft
export async function saveCourseAsDraft(courseData: Partial<CourseCreationData>): Promise<Course> {
  try {
    console.log('Saving course draft with data:', JSON.stringify(courseData, null, 2));
    const response = await api.post<Course>('/courses/draft', courseData);
    console.log('Course draft save response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error saving course as draft:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
}

// Function to upload course media (image, video, etc.)
export async function uploadCourseMedia(file: File, courseId?: string): Promise<string> {
  try {
    console.log('Uploading course media:', { file, courseId });
    const formData = new FormData();
    formData.append('file', file);
    
    if (courseId) {
      formData.append('course_id', courseId);
    }
    
    formData.append('folder', 'course-media');
    
    console.log('Form data prepared for upload');
    
    const response = await api.post<{ fileUrl: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Media upload response:', response.data);
    
    return response.data.fileUrl;
  } catch (error: any) {
    console.error('Error uploading course media:', error);
    console.error('Error response:', error.response?.data);
    // If the upload fails but we have the file locally, we can create a temporary URL
    if (file && window.URL) {
      console.log('Creating temporary local URL for debugging');
      return URL.createObjectURL(file);
    }
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

// Functions for Dashboard page
export function getRecentlyViewedCourses(courses: Course[]): Course[] {
  // In a real app, this would filter based on user's view history
  // For now, we'll just return the most recent courses (based on createdAt)
  return [...courses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
}

export function getPopularCourses(courses: Course[]): Course[] {
  // Return courses sorted by popularity (enrollmentCount or viewCount)
  return [...courses]
    .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
    .slice(0, 6);
}

export function getRecommendedCourses(courses: Course[]): Course[] {
  // In a real app, this would use user's preferences and history
  // For now, just return courses with highest ratings
  return [...courses]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);
}

export function getInDemandCourses(courses: Course[]): Course[] {
  // Return courses based on a calculated popularity score
  return [...courses]
    .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
    .slice(0, 6);
}

export function getCategoryCourseCount(courses: Course[]): {name: string, count: number}[] {
  const categories: Record<string, number> = {};
  
  courses.forEach(course => {
    if (course.category) {
      categories[course.category] = (categories[course.category] || 0) + 1;
    }
  });
  
  return Object.entries(categories).map(([name, count]) => ({ name, count }));
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

// React hook for searching courses
export function useSearchCourses(query: string) {
  const [searchResults, setSearchResults] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await searchCourses(query);
        setSearchResults(results);
      } catch (err) {
        console.error(`Error searching courses with query ${query}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast({
          title: "Search failed",
          description: "There was an error searching for courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query, toast]);

  return { searchResults, loading, error };
}
