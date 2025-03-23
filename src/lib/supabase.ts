
import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase URL and anon key
const supabaseUrl = 'https://bkkgvewvwamwhljgqezx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra2d2ZXd2d2Ftd2hsamdxZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MzA2NzMsImV4cCI6MjA1ODMwNjY3M30.qGl6LA9W69G__iC4amhTAMKOJ5BL1tJbCmnRw2JljZ8';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
