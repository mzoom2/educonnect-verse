
import { supabase } from '@/integrations/supabase/client';

// Create the increment_view_count function in Supabase
export const setupSupabaseRPC = async () => {
  const rpcQuery = `
    -- Function to increment the view count of a course
    CREATE OR REPLACE FUNCTION increment_view_count(course_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE courses 
      SET view_count = view_count + 1
      WHERE id = course_id;
    END;
    $$ LANGUAGE plpgsql;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: rpcQuery });
    if (error) {
      console.error('Failed to create increment_view_count function:', error);
    } else {
      console.log('Successfully created increment_view_count function');
    }
  } catch (err) {
    console.error('Error setting up Supabase RPC:', err);
  }
};

// Create the storage bucket for course content
export const setupStorageBucket = async () => {
  try {
    // Create the bucket using direct API call
    const { error: bucketError } = await supabase.storage.createBucket('course-content', {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    });
    
    if (bucketError) {
      // If the bucket already exists, this is fine
      if (!bucketError.message.includes('already exists')) {
        console.error('Error creating storage bucket:', bucketError);
      }
    } else {
      console.log('Successfully created course-content bucket');
    }
  } catch (err) {
    console.error('Error setting up storage bucket:', err);
  }
};

// Run all setup functions
export const initializeSupabase = async () => {
  await setupSupabaseRPC();
  await setupStorageBucket();
  console.log('Supabase initialization complete');
};
