
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const PrivateRoute = () => {
  const { user, loading, refreshUserData } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Verify user data on route access by fetching from DB
    const verifyUser = async () => {
      try {
        if (!user) {
          await refreshUserData();
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your session. Please log in again.",
          variant: "destructive",
        });
      }
    };
    
    verifyUser();
  }, [refreshUserData, toast, user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-edu-blue"></div>
      </div>
    );
  }
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
