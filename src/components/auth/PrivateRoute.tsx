
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (!loading && !user && (!supabaseUrl || !supabaseAnonKey)) {
      toast({
        title: "Supabase configuration missing",
        description: "Please set up your Supabase environment variables to enable authentication.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [loading, user, toast, supabaseUrl, supabaseAnonKey]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-edu-blue"></div>
      </div>
    );
  }
  
  // Allow access to the dashboard in development mode if Supabase is not configured
  if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
    toast({
      title: "Development mode",
      description: "Bypassing authentication in development. Set up Supabase for production.",
      duration: 5000,
    });
    return <Outlet />;
  }
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
