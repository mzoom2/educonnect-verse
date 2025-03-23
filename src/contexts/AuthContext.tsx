import React, { createContext, useContext, useEffect, useState } from 'react';
import { localAuth, User, AuthSession } from '@/lib/localAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Define the specific admin email
const ADMIN_EMAIL = "mzoomolabewa@gmail.com";

type AuthContextType = {
  session: AuthSession | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  updateUserMetadata: (userId: string, metadata: Partial<User['user_metadata']>) => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check active sessions and set the user
    const { data: { session } } = localAuth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
    
    // Check if user has the admin email
    if (session?.user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    
    setLoading(false);

    // Listen for auth changes
    const { data: { subscription } } = localAuth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user has the admin email
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await localAuth.signInWithPassword({ email, password });
      
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
      
      return { error: error ? new Error(error.message) : null };
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
      const { error, data } = await localAuth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            username 
          }
        }
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes("already exists")) {
          toast({
            title: "Registration failed",
            description: "An account with this email already exists.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive"
          });
        }
        return { error: new Error(error.message), data: null };
      }
      
      if (data?.user) {
        toast({
          title: "Registration successful",
          description: "Your account has been created",
        });
        navigate('/dashboard');
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
    await localAuth.signOut();
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Update user metadata
  const updateUserMetadata = async (userId: string, metadata: Partial<User['user_metadata']>) => {
    try {
      const updatedUser = localAuth.updateUserMetadata(userId, metadata);
      
      if (updatedUser) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
      
      return updatedUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateUserMetadata
  };

  return (
    <AuthContext.Provider value={value}>
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
