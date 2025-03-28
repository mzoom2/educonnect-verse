
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { useApi } from '@/hooks/useApi';
import { Course } from '@/components/dashboard/CourseCarousel';

// Service for course creation
export function useCreateCourse() {
  const { fetchData, isLoading, error } = useApi('/admin/courses', 'post', undefined, false);
  const { toast } = useAuth(); // Assuming useAuth provides a toast function
  
  const createCourse = async (courseData: any) => {
    try {
      console.log('Creating course with data:', courseData);
      const result = await fetchData(courseData);
      
      return result;
    } catch (error) {
      console.error('Error in useCreateCourse:', error);
      throw error;
    }
  };
  
  return { createCourse, isLoading, error };
}

// Hook to get all courses
export function useAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  return { courses, loading, error, refetchCourses: fetchCourses };
}

// Hook to get enrolled courses
export function useEnrolledCourses() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        setEnrolledCourses([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // For now, we'll simulate enrolled courses
        // In a real app, you would get this from the backend
        const enrolledIds = user.metadata?.enrolledCourses || [];
        
        if (enrolledIds.length > 0) {
          const response = await api.get('/courses'); // Get all courses
          const allCourses = response.data;
          
          // Filter to only enrolled courses
          const userCourses = allCourses.filter((course: Course) => 
            enrolledIds.includes(course.id)
          );
          
          setEnrolledCourses(userCourses);
        } else {
          setEnrolledCourses([]);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrolledCourses();
  }, [user]);
  
  return { enrolledCourses, loading };
}

// Hook to get teacher's created courses
export function useTeacherCourses() {
  const { user } = useAuth();
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTeacherCourses = async () => {
      if (!user || user.role !== 'teacher') {
        setTeacherCourses([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // For a real app, you would have an API endpoint for teacher courses
        // For now, we'll get all courses and filter by the current user as author
        const response = await api.get('/courses');
        const allCourses = response.data;
        
        // Filter courses created by this teacher
        // Assuming courses have an author field matching user's username or email
        const userCreatedCourses = allCourses.filter((course: Course) => 
          course.author === user.username || 
          course.author === user.email
        );
        
        setTeacherCourses(userCreatedCourses);
      } catch (error) {
        console.error('Error fetching teacher courses:', error);
        setTeacherCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherCourses();
  }, [user]);
  
  return { teacherCourses, loading };
}

// Hook for searching courses
export function useSearchCourses(query: string) {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const searchCourses = async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await api.get(`/courses/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching courses:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    searchCourses();
  }, [query]);
  
  return { searchResults, loading };
}

// Helper functions to get special course lists
// These would typically be API calls in a real app
// For now, we'll just filter from all courses

export function getRecentlyViewedCourses(courses: Course[]): Course[] {
  // Sort by view count
  return [...courses].sort((a, b) => 
    (b.viewCount || 0) - (a.viewCount || 0)
  ).slice(0, 5);
}

export function getPopularCourses(courses: Course[]): Course[] {
  // Sort by enrollment count
  return [...courses].sort((a, b) => 
    (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
  ).slice(0, 5);
}

export function getRecommendedCourses(courses: Course[]): Course[] {
  // Sort by rating
  return [...courses].sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  ).slice(0, 5);
}

export function getInDemandCourses(courses: Course[]): Course[] {
  // Sort by popularity score
  return [...courses].sort((a, b) => 
    (b.popularityScore || 0) - (a.popularityScore || 0)
  ).slice(0, 5);
}

export function getCategoryCourseCount(courses: Course[]) {
  const categories: Record<string, number> = {};
  
  courses.forEach(course => {
    if (course.category) {
      if (categories[course.category]) {
        categories[course.category]++;
      } else {
        categories[course.category] = 1;
      }
    }
  });
  
  // Convert to array for chart display
  return Object.keys(categories).map(name => ({
    name,
    count: categories[name]
  }));
}
