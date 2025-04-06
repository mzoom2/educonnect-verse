
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseResource } from '@/services/courseService';

// User types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at?: string;
  last_login?: string | null;
  metadata?: {
    balance?: number;
    teacherApplication?: {
      qualification: string;
      experience: string;
      specialization: string;
      status: string;
      submittedAt: string;
    };
  };
}

// Authentication Functions
export const authService = {
  // Register a new user
  register: async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Sign in with email and password
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Handle email not confirmed error specifically
        if (error.message.includes('Email not confirmed')) {
          console.log('Email not confirmed. Please check your email for verification link.');
        }
        throw error;
      }
      
      // Update last login if signed in successfully
      if (data.user) {
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Sign out
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { error: error.message };
    }
  },
  
  // Get the current user
  getCurrentUser: async () => {
    try {
      // Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      // If no session, return early
      if (!sessionData.session) {
        return { data: null, error: null };
      }
      
      // Get user data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "row not found"
        throw profileError;
      }
      
      // Combine auth user and profile data
      const userData = {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email || '',
        username: profileData?.username || sessionData.session.user.user_metadata?.username || '',
        role: profileData?.role || 'user',
        created_at: sessionData.session.user.created_at,
        last_login: profileData?.last_login,
        metadata: profileData?.metadata
      };
      
      return { data: { user: userData }, error: null };
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },
  
  // Verify token validity
  verifyToken: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        return { valid: false };
      }
      
      // Get user profile data to include in response
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      
      const userData = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        username: profileData?.username || data.session.user.user_metadata?.username || '',
        role: profileData?.role || 'user',
        created_at: data.session.user.created_at,
        last_login: profileData?.last_login,
        metadata: profileData?.metadata
      };
      
      return { valid: true, data: { user: userData } };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  },
  
  // Update user metadata
  updateUserMetadata: async (userId: string, data: any) => {
    try {
      // Get existing metadata
      const { data: existingData, error: fetchError } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Merge existing metadata with new metadata
      const mergedMetadata = {
        ...(existingData?.metadata || {}),
        ...data.metadata
      };
      
      // Update profile with new metadata
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({ metadata: mergedMetadata })
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      return { data: updatedData, error: null };
    } catch (error: any) {
      console.error('Error updating user metadata:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Apply as a teacher
  applyAsTeacher: async (userId: string, applicationData: any) => {
    try {
      // Get existing metadata
      const { data: existingData, error: fetchError } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', userId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Prepare teacher application data with timestamp
      const teacherApplication = {
        ...applicationData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      // Merge with existing metadata
      const mergedMetadata = {
        ...(existingData?.metadata as Record<string, any> || {}),
        teacherApplication
      };
      
      // Update profile with application data and role
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          metadata: mergedMetadata,
          role: 'teacher' // Automatically approve teacher applications
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      return { data: updatedData, error: null };
    } catch (error: any) {
      console.error('Error submitting teacher application:', error);
      return { data: null, error: error.message };
    }
  }
};

// Course service functions
export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching all courses:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Get course by ID
  getCourseById: async (id: string) => {
    try {
      // First increment view count
      await supabase.rpc('increment_view_count', { course_id: id });
      
      // Get course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (courseError) throw courseError;
      
      // Get resources for this course
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('course_resources')
        .select('*')
        .eq('course_id', id);
        
      if (resourcesError) throw resourcesError;
      
      // Combine course with resources
      const courseWithResources = {
        ...courseData,
        resources: resourcesData || []
      };
      
      return { data: courseWithResources, error: null };
    } catch (error: any) {
      console.error(`Error fetching course ${id}:`, error);
      return { data: null, error: error.message };
    }
  },
  
  // Search courses
  searchCourses: async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,author.ilike.%${query}%`);
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error searching courses with query ${query}:`, error);
      return { data: null, error: error.message };
    }
  },
  
  // Get courses by category
  getCoursesByCategory: async (category: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('category', category);
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error fetching courses by category ${category}:`, error);
      return { data: null, error: error.message };
    }
  },
  
  // Create a new course
  createCourse: async (courseData: any) => {
    try {
      // Add a course to the database
      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating course:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Update course
  updateCourse: async (id: string, courseData: any) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Error updating course ${id}:`, error);
      return { data: null, error: error.message };
    }
  },
  
  // Delete course
  deleteCourse: async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      return { data: { success: true }, error: null };
    } catch (error: any) {
      console.error(`Error deleting course ${id}:`, error);
      return { data: null, error: error.message };
    }
  },
  
  // Get teacher's courses
  getTeacherCourses: async () => {
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        return { data: null, error: 'Not authenticated' };
      }
      
      // Get user profile to get username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', sessionData.session.user.id)
        .single();
      
      if (!profileData || !profileData.username) {
        return { data: [], error: null }; // No courses if no username
      }
      
      // Get courses where user is author
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('author', profileData.username);
        
      if (error) throw error;
      
      // Format data for teacher dashboard
      const formattedCourses = data ? data.map(course => ({
        id: course.id,
        title: course.title,
        enrollmentCount: course.enrollment_count || 0,
        price: course.price || 'Free',
        createdAt: course.created_at,
        lastUpdated: course.created_at, // Use created_at since we don't have updated_at
        category: course.category || 'Uncategorized',
        status: 'published', // Default status since we don't have draft functionality yet
        averageRating: course.rating || 0
      })) : [];
      
      return { data: formattedCourses, error: null };
    } catch (error: any) {
      console.error('Error fetching teacher courses:', error);
      return { data: null, error: error.message };
    }
  },
  
  // Upload function (placeholder - will need to be implemented with Supabase Storage)
  uploadCourseMedia: async (file: File, courseTitle?: string, courseId?: string): Promise<string> => {
    try {
      // Generate a unique file path
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = courseId 
        ? `course-media/${courseId}/${fileName}` 
        : `course-media/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('course-content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-content')
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading course media:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

// Function to create a storage bucket if it doesn't exist
export const createStorageBucket = async () => {
  try {
    // Check if bucket already exists first to avoid errors
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'course-content');
    
    if (!bucketExists) {
      console.log('Creating storage bucket: course-content');
      const { data, error } = await supabase.storage.createBucket('course-content', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/*', 'video/*', 'application/pdf']
      });
      
      if (error && !error.message.includes('already exists')) {
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.error('Error setting up storage bucket:', error);
  }
};
