
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(supabaseUrl && supabaseAnonKey);
  };

  useEffect(() => {
    // Check active sessions and set the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Supabase not configured",
        description: "Please add your Supabase URL and anon key to environment variables.",
        variant: "destructive"
      });
      return { error: new Error('Supabase not configured') };
    }

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    
    if (!error) {
      navigate('/dashboard');
    }
    
    return { error };
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Supabase not configured",
        description: "Please add your Supabase URL and anon key to environment variables.",
        variant: "destructive"
      });
      return { error: new Error('Supabase not configured'), data: null };
    }
    
    // First register the user
    const { error, data } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { 
          username 
        }
      }
    });
    
    if (!error) {
      // If successful, insert user data into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.user?.id, 
          username, 
          email 
        }]);
      
      if (profileError) {
        console.error('Error saving profile:', profileError);
        return { error: new Error(profileError.message), data: null };
      }
      
      navigate('/dashboard');
    }
    
    return { error, data };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
