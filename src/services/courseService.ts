
import { courseService } from './api';

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
    const response = await courseService.createCourse(courseData);
    return response;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Save course as draft
export const saveCourseAsDraft = async (courseData: CourseCreationData) => {
  try {
    courseData.isDraft = true;
    const response = await courseService.createCourse(courseData);
    return response;
  } catch (error) {
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

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const data = await response.json();
    return data.fileUrl;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
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
