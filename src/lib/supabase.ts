
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For development/testing purposes - create a mock client when credentials are missing
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  
  // Create a mock Supabase client that doesn't throw errors
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured'), data: { session: null, user: null } }),
      signUp: () => Promise.resolve({ error: new Error('Supabase not configured'), data: { user: null } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      insert: () => ({ error: new Error('Supabase not configured') }),
      select: () => ({ error: new Error('Supabase not configured') }),
    })
  };
} else {
  // Create the real Supabase client when credentials are available
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
