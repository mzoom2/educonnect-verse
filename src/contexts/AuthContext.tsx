import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api';

// Define types for user data
type UserData = {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
  last_login: string | null;
  metadata?: {
    balance?: number;
    teacherApplication?: {
      qualification: string;
      experience: string;
      specialization: string;
      status: string;
      submittedAt: string;
    };
  };
};

type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  isTeacher: boolean; // Add this property
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserMetadata: (userId: number, data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false); // Add this state
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to refresh user data from the backend
  const refreshUserData = async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsAdmin(false);
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
        return;
      }
      
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
    } catch (err) {
      console.error("Error refreshing user data:", err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user metadata
  const updateUserMetadata = async (userId: number, data: any) => {
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

  // Function to check if the user is authenticated with the backend
  const verifyAuthentication = async () => {
    try {
      setLoading(true);
      
      if (!authService.isAuthenticated()) {
        setUser(null);
        setIsAdmin(false);
        setIsTeacher(false); // Reset teacher status
        setLoading(false);
        return;
      }
      
      // Verify token with backend
      const { valid, data } = await authService.verifyToken();
      
      if (!valid) {
        console.log("Token invalid, logging out");
        await signOut();
        return;
      }
      
      // Set user data from the verification response
      if (data && data.user) {
        setUser(data.user);
        setIsAdmin(data.user.role === 'admin');
        setIsTeacher(data.user.role === 'teacher'); // Set teacher status
      }
    } catch (error) {
      console.error("Authentication verification error:", error);
      toast({
        title: "Authentication error",
        description: "Could not verify your authentication status",
        variant: "destructive"
      });
      setUser(null);
      setIsAdmin(false);
      setIsTeacher(false); // Reset teacher status
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial authentication check
    verifyAuthentication();
    
    // Set up an interval to periodically check authentication
    const interval = setInterval(() => {
      if (authService.isAuthenticated()) {
        verifyAuthentication();
      }
    }, 30 * 60 * 1000); // Check every 30 minutes
    
    return () => clearInterval(interval);
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
        // Auto login after successful registration
        const loginResult = await signIn(email, password);
        
        if (!loginResult.error) {
          toast({
            title: "Registration successful",
            description: "Your account has been created",
          });
        } else {
          // If auto-login fails, show a message but don't treat signup as failed
          toast({
            title: "Registration successful",
            description: "Your account has been created, but we couldn't log you in automatically. Please try logging in.",
          });
          navigate('/login');
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
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
    setIsTeacher(false); // Reset teacher status
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
    isTeacher, // Include teacher status in context value
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
