
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from './contexts/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { initializeSupabase } from './services/setupSupabase';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import CreateCourse from "./pages/CreateCourse";
import AdminPanel from "./pages/AdminPanel";
import CourseOverview from "./pages/CourseOverview";
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  // Initialize Supabase when the app loads
  useEffect(() => {
    initializeSupabase()
      .then(() => console.log('Supabase initialized successfully'))
      .catch(err => console.error('Error initializing Supabase:', err));
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-course" element={<CreateCourse />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/courses" element={<CourseOverview />} />
            </Route>
            
            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
