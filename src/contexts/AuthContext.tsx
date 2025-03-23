
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
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error) {
        navigate('/dashboard');
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      }
      
      return { error };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    try {
      // First check if the profiles table exists and create it if it doesn't
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.log('Creating profiles table...');
        // Create the profiles table if it doesn't exist
        const { error: createTableError } = await supabase.rpc('create_profiles_table');
        if (createTableError && !createTableError.message.includes('already exists')) {
          console.error('Error creating profiles table:', createTableError);
          toast({
            title: "Setup error",
            description: "There was an issue setting up your account. Please try again later.",
            variant: "destructive"
          });
          return { error: new Error(createTableError.message), data: null };
        }
      }

      // Register the user
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            username 
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return { error, data: null };
      }
      
      if (data?.user) {
        try {
          // Insert user data into profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              username, 
              email 
            }]);
          
          if (profileError) {
            console.error('Error saving profile:', profileError);
            // If profile creation fails, don't fail the sign-up process
            // Just log it and show a warning to the user
            toast({
              title: "Profile setup incomplete",
              description: "Your account was created, but profile setup needs to be completed later.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Registration successful",
              description: "Your account has been created",
            });
          }
        } catch (profileErr) {
          console.error('Profile creation error:', profileErr);
          toast({
            title: "Profile setup incomplete",
            description: "Your account was created, but profile setup needs to be completed later.",
            variant: "destructive"
          });
        }
        
        // In some Supabase configurations, email verification is required
        if (data.user.identities && data.user.identities.length === 0) {
          toast({
            title: "Email verification required",
            description: "Please check your email to verify your account",
          });
        } else {
          navigate('/dashboard');
        }
      }
      
      return { error: null, data };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive"
      });
      return { error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
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
