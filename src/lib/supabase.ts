
import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase URL and anon key
const supabaseUrl = 'https://bkkgvewvwamwhljgqezx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra2d2ZXd2d2Ftd2hsamdxZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzA2NzMsImV4cCI6MjA1ODMwNjY3M30.qGl6LA9W69G__iC4amhTAMKOJ5BL1tJbCmnRw2JljZ8';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize database if needed
(async () => {
  try {
    // Check if the profiles table exists
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.log('Setting up profiles table...');
      
      // Note: We can't directly create tables from the client-side for security reasons
      // The proper way is to have this set up in Supabase dashboard or through migrations
      console.log('Please create the profiles table in the Supabase dashboard with the following structure:');
      console.log(`
        - id (UUID, Primary Key, References auth.users.id)
        - username (Text, Unique)
        - email (Text, Unique)
        - created_at (Timestamp with time zone, Default: now())
        - updated_at (Timestamp with time zone, Default: now())
      `);
    }
  } catch (err) {
    console.error('Error checking profiles table:', err);
  }
})();
