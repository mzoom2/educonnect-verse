
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
      // Create a stored procedure to create the profiles table
      await supabase.rpc('create_profiles_table').catch(async (err) => {
        if (err.message.includes('function "create_profiles_table" does not exist')) {
          // Create the function if it doesn't exist
          const { error: sqlError } = await supabase.sql(`
            CREATE OR REPLACE FUNCTION create_profiles_table()
            RETURNS void AS $$
            BEGIN
              CREATE TABLE IF NOT EXISTS public.profiles (
                id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
              );
              
              -- Set up Row Level Security
              ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
              
              -- Create policies
              CREATE POLICY "Public profiles are viewable by everyone."
                ON public.profiles FOR SELECT
                USING (true);
                
              CREATE POLICY "Users can insert their own profile."
                ON public.profiles FOR INSERT
                WITH CHECK (auth.uid() = id);
                
              CREATE POLICY "Users can update their own profile."
                ON public.profiles FOR UPDATE
                USING (auth.uid() = id);
            END;
            $$ LANGUAGE plpgsql;
          `);
          
          if (sqlError) {
            console.error('Failed to create function:', sqlError);
          } else {
            // Try to create the table again
            await supabase.rpc('create_profiles_table').catch((finalErr) => {
              console.error('Final error creating profiles table:', finalErr);
            });
          }
        }
      });
    }
  } catch (err) {
    console.error('Error checking/creating profiles table:', err);
  }
})();
