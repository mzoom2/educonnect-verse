
import { supabase } from '@/integrations/supabase/client';
import { createStorageBucket } from '@/services/supabaseService';

// Set up custom RPC functions
export const setupSupabaseRPC = async () => {
  try {
    // Create the increment_view_count function if it doesn't exist
    // Note: This should be done using migrations, but for demo purposes we'll create it here
    const viewCountSQL = `
    CREATE OR REPLACE FUNCTION increment_view_count(course_id UUID)
    RETURNS void AS $$
    BEGIN
      UPDATE courses 
      SET view_count = view_count + 1
      WHERE id = course_id;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Since we can't directly execute SQL from client SDK, we'll skip this for now
    // In a real app, this would be done through migrations or admin functions
    console.log('Skipping increment_view_count function creation - should be handled by migrations');
    
  } catch (error) {
    console.error('Failed to create increment_view_count function:', error);
  }
};

// Set up storage bucket
export const setupStorageBucket = async () => {
  try {
    await createStorageBucket();
  } catch (error) {
    console.error('Error creating storage bucket:', error);
  }
};

// Initialize Supabase setup
export const initializeSupabase = async () => {
  try {
    // Set up RPC functions
    await setupSupabaseRPC();
    
    // Set up storage bucket
    await setupStorageBucket();
    
    console.log('Supabase initialization complete');
    
    return true;
  } catch (error) {
    console.error('Error initializing Supabase:', error);
    return false;
  }
};
