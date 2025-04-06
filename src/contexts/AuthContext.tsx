
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService, UserProfile } from '@/services/supabaseService';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserMetadata: (userId: string, data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to refresh user data from the backend
  const refreshUserData = async () => {
    if (!(await authService.isAuthenticated())) {
      setUser(null);
      setIsAdmin(false);
      setIsTeacher(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await authService.getCurrentUser();
      
      if (error || !data) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
        setUser(null);
        setIsAdmin(false);
        setIsTeacher(false);
        return;
      }
      
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      setIsTeacher(data.user.role === 'teacher');
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setUser(null);
      setIsAdmin(false);
      setIsTeacher(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user metadata
  const updateUserMetadata = async (userId: string, data: any) => {
    try {
      setLoading(true);
      console.log("Updating user metadata with:", data);
      
      const { data: responseData, error } = await authService.updateUserMetadata(userId, data);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update user data",
          variant: "destructive"
        });
        throw new Error(error);
      }
      
      // Refresh user data to get the updated metadata
      await refreshUserData();
      
      return responseData;
    } catch (err) {
      console.error("Error updating user metadata:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Only synchronous state updates here
        if (session) {
          // We have a session, but defer the user profile fetch
          setTimeout(() => {
            refreshUserData();
          }, 0);
        } else {
          // No session, clear user data
          setUser(null);
          setIsAdmin(false);
          setIsTeacher(false);
          setLoading(false);
        }
      }
    );
    
    // Check for existing session
    refreshUserData();
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error, data } = await authService.login(email, password);
      
      if (!error && data) {
        // Successfully logged in, refresh user data
        await refreshUserData();
        
        navigate('/dashboard');
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      } else {
        toast({
          title: "Login failed",
          description: error || "Unknown error occurred",
          variant: "destructive"
        });
      }
      
      return { error: error ? new Error(error) : null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);
      const { error, data } = await authService.register(email, password, username);
      
      if (error) {
        // Handle specific error cases
        if (error.includes("already exists")) {
          toast({
            title: "Registration failed",
            description: "An account with this email already exists.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Registration failed",
            description: error,
            variant: "destructive"
          });
        }
        return { error: new Error(error), data: null };
      }
      
      if (data) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. You can now log in.",
        });
        navigate('/login');
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
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    await authService.logout();
    setUser(null);
    setIsAdmin(false);
    setIsTeacher(false);
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    user,
    loading,
    isAdmin,
    isTeacher,
    signIn,
    signUp,
    signOut,
    refreshUserData,
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
