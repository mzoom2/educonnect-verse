import { courseService } from './api';
import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';

// Interface for Course Quiz Question
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
  reward: number;
}

// Interface for Course Practical Task
export interface PracticalTask {
  description: string;
  expectedOutcome: string;
  reward: number;
}

// Interface for Course Lesson
export interface CourseLesson {
  title: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  externalLinks?: string[];
  quiz?: QuizQuestion[];
  practicalTask?: PracticalTask;
}

// Interface for Course Creation
export interface CourseCreationData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  imageUrl?: string;
  prerequisites?: string;
  estimatedHours: number;
  price: number;
  duration: number;
  lessons: CourseLesson[];
  isDraft: boolean;
}

// Create a new course
export const createCourse = async (courseData: CourseCreationData) => {
  try {
    console.log("Creating course with data:", courseData);
    const response = await courseService.createCourse(courseData);
    
    if (!response.data) {
      console.error("Failed to create course. API response:", response);
      throw new Error(response.error || "Failed to create course. No response data received.");
    }
    
    return response;
  } catch (error: any) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Save course as draft
export const saveCourseAsDraft = async (courseData: CourseCreationData) => {
  try {
    courseData.isDraft = true;
    console.log("Saving course draft with data:", courseData);
    const response = await courseService.createCourse(courseData);
    
    if (!response.data) {
      console.error("Failed to save course draft. API response:", response);
      throw new Error(response.error || "Failed to save course draft. No response data received.");
    }
    
    return response;
  } catch (error: any) {
    console.error('Error saving course draft:', error);
    throw error;
  }
};

// Upload course media (video, PDF, image)
export const uploadCourseMedia = async (file: File, type: 'video' | 'pdf' | 'image') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`File upload failed:`, errorData);
      throw new Error(errorData.message || 'File upload failed');
    }

    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
};

// Add custom hook for actual API fetching
export const useCoursesFromAPI = () => {
  const { data, isLoading, error, refetch } = useApi<any[]>('/courses', 'get');
  const { toast } = useToast();
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading courses",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  return { 
    courses: data || [], 
    loading: isLoading,
    error,
    refetchCourses: refetch
  };
};

// Add custom hooks for courses
export const useAllCourses = () => {
  const { courses: apiCourses, loading: apiLoading, error, refetchCourses } = useCoursesFromAPI();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiLoading) {
      setLoading(true);
      return;
    }
    
    if (apiCourses && apiCourses.length > 0) {
      // Use API data if available
      setCourses(apiCourses);
      setLoading(false);
      return;
    }
    
    // Fallback to mock data if API returns empty or fails
    setLoading(true);
    setTimeout(() => {
      // This is mock data until we have a real API
      const mockCourses = [
        {
          id: '1',
          title: 'Introduction to JavaScript',
          description: 'Learn the basics of JavaScript programming',
          category: 'Programming',
          difficulty: 'Beginner',
          author: 'John Doe',
          image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          rating: 4.7,
          duration: '4 weeks',
          price: '₦5,000',
          enrollmentCount: 328,
          viewCount: 1450,
          popularityScore: 87,
          createdAt: '2023-05-15',
        },
        {
          id: '2',
          title: 'Web Development Masterclass',
          description: 'Complete guide to modern web development',
          category: 'Web Development',
          difficulty: 'Intermediate',
          author: 'Sarah Johnson',
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
          rating: 4.9,
          duration: '8 weeks',
          price: '₦12,000',
          enrollmentCount: 215,
          viewCount: 980,
          popularityScore: 92,
          createdAt: '2023-06-10',
        },
        {
          id: '3',
          title: 'Data Science Fundamentals',
          description: 'Introduction to data science concepts and tools',
          category: 'Data Science',
          difficulty: 'Intermediate',
          author: 'Michael Brown',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          rating: 4.6,
          duration: '6 weeks',
          price: '₦8,500',
          enrollmentCount: 189,
          viewCount: 760,
          popularityScore: 78,
          createdAt: '2023-05-20',
        },
        {
          id: '4',
          title: 'Mobile App Development with React Native',
          description: 'Build cross-platform mobile applications',
          category: 'Mobile Development',
          difficulty: 'Advanced',
          author: 'Emily Chen',
          image: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          rating: 4.8,
          duration: '10 weeks',
          price: '₦15,000',
          enrollmentCount: 142,
          viewCount: 620,
          popularityScore: 85,
          createdAt: '2023-07-05',
        },
        {
          id: '5',
          title: 'Business Finance for Beginners',
          description: 'Learn essential financial concepts for business',
          category: 'Business',
          difficulty: 'Beginner',
          author: 'Robert Wilson',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
          rating: 4.5,
          duration: '3 weeks',
          price: '₦6,000',
          enrollmentCount: 274,
          viewCount: 1120,
          popularityScore: 76,
          createdAt: '2023-04-18',
        },
        {
          id: '6',
          title: 'UI/UX Design Principles',
          description: 'Master the art of user interface design',
          category: 'Design',
          difficulty: 'Intermediate',
          author: 'Jennifer Lee',
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
          rating: 4.7,
          duration: '5 weeks',
          price: '₦7,500',
          enrollmentCount: 198,
          viewCount: 840,
          popularityScore: 82,
          createdAt: '2023-06-28',
        },
        {
          id: '7',
          title: 'Digital Marketing Essentials',
          description: 'Comprehensive guide to modern marketing strategies',
          category: 'Marketing',
          difficulty: 'Beginner',
          author: 'David Clark',
          image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80',
          rating: 4.6,
          duration: '4 weeks',
          price: '₦6,500',
          enrollmentCount: 231,
          viewCount: 920,
          popularityScore: 79,
          createdAt: '2023-05-30',
        },
        {
          id: '8',
          title: 'Machine Learning Foundations',
          description: 'Introduction to machine learning concepts and algorithms',
          category: 'Data Science',
          difficulty: 'Advanced',
          author: 'Alex Rogers',
          image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          rating: 4.9,
          duration: '12 weeks',
          price: '₦20,000',
          enrollmentCount: 127,
          viewCount: 580,
          popularityScore: 90,
          createdAt: '2023-07-15',
        }
      ];
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, [apiCourses, apiLoading]);

  return { courses, loading, refetchCourses };
};

export const useSearchCourses = (searchTerm: string) => {
  const { courses } = useAllCourses();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    // Simple search implementation for now
    // In a real app, this would make an API call
    const results = courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Simulate API delay
    setTimeout(() => {
      setSearchResults(results);
      setLoading(false);
    }, 500);
  }, [searchTerm, courses]);

  return { searchResults, loading };
};

// Get dummy data for testing - this will be replaced by actual API calls in production
export const getRecentlyViewedCourses = (allCourses: any[]) => {
  // In a real implementation, this would get the user's recently viewed courses from the API
  return allCourses.slice(0, 4);
};

export const getPopularCourses = (allCourses: any[]) => {
  // In a real implementation, this would get the most popular courses from the API
  return [...allCourses].sort((a, b) => b.enrollmentCount - a.enrollmentCount).slice(0, 4);
};

export const getRecommendedCourses = (allCourses: any[]) => {
  // In a real implementation, this would get recommended courses based on user's interests
  return allCourses.slice(0, 4);
};

export const getInDemandCourses = (allCourses: any[]) => {
  // In a real implementation, this would get courses teaching in-demand skills
  return [...allCourses].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 4);
};

export const getCategoryCourseCount = (allCourses: any[]) => {
  // Group courses by category and count them
  const categories = allCourses.reduce((acc: Record<string, number>, course) => {
    const category = course.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Convert to array of objects
  return Object.entries(categories).map(([name, count]) => ({
    name,
    count
  }));
};

// Add functions to specifically fetch user-related courses
export const useEnrolledCourses = () => {
  const { data, isLoading, error, refetch } = useApi<any[]>('/user/enrolled-courses', 'get');
  
  return { 
    enrolledCourses: data || [], 
    loading: isLoading,
    error,
    refetchEnrolledCourses: refetch
  };
};

export const useTeacherCourses = () => {
  const { data, isLoading, error, refetch } = useApi<any[]>('/teacher/courses', 'get');
  
  return { 
    teacherCourses: data || [], 
    loading: isLoading,
    error,
    refetchTeacherCourses: refetch
  };
};
