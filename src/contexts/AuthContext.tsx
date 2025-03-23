
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ProfileSetupAlert from '@/components/auth/ProfileSetupAlert';

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
  const [showProfileSetupAlert, setShowProfileSetupAlert] = useState(false);
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
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      let tableExists = !tableCheckError;
      
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
        let profileSuccess = false;
        
        // Only try to insert into profiles if the table exists
        if (tableExists) {
          try {
            // Insert user data into profiles table - use the UUID string directly
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({ 
                id: data.user.id, // This is already a UUID string, no need to convert
                username, 
                email 
              });
            
            if (profileError) {
              console.error('Error saving profile:', profileError);
              setShowProfileSetupAlert(true);
              toast({
                title: "Profile setup incomplete",
                description: "Your account was created, but profile setup needs to be completed later.",
                variant: "destructive"
              });
            } else {
              profileSuccess = true;
              toast({
                title: "Registration successful",
                description: "Your account has been created",
              });
            }
          } catch (profileErr) {
            console.error('Profile creation error:', profileErr);
            setShowProfileSetupAlert(true);
            toast({
              title: "Profile setup incomplete",
              description: "Your account was created, but profile setup needs to be completed later.",
              variant: "destructive"
            });
          }
        } else {
          // Table doesn't exist, show setup instructions
          setShowProfileSetupAlert(true);
          toast({
            title: "Account created but profile setup incomplete",
            description: "Please contact an administrator to complete your account setup.",
            variant: "destructive"
          });
        }
        
        // In some Supabase configurations, email verification is required
        if (data.user.identities && data.user.identities.length === 0) {
          toast({
            title: "Email verification required",
            description: "Please check your email to verify your account",
          });
        } else if (profileSuccess) {
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

  return (
    <AuthContext.Provider value={value}>
      {showProfileSetupAlert && <ProfileSetupAlert />}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
