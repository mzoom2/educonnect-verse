
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, BookOpen, Calendar, Settings, LogOut, 
  Search, Bell, MessageSquare, User, ChevronDown, LayoutDashboard
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border/40 bg-background z-40 sticky top-0">
        <div className="flex h-16 items-center px-4">
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden mr-2" 
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Menu size={24} />
          </button>
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-0 font-medium text-xl text-foreground mr-6">
            <span className="text-edu-blue">Skill</span>
            <span className="dark:text-white">versity</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-1 items-center space-x-1">
            <Link to="/dashboard" className="px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center">
              <Home size={16} className="mr-2" />
              Dashboard
            </Link>
            <Link to="/courses" className="px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center">
              <BookOpen size={16} className="mr-2" />
              Courses
            </Link>
            {isAdmin && (
              <Link to="/admin" className="px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center">
                <LayoutDashboard size={16} className="mr-2" />
                Admin Panel
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors flex items-center">
                  <span>Categories</span>
                  <ChevronDown size={16} className="ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>
                  <Link to="/category/web-development" className="w-full">Web Development</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/category/data-science" className="w-full">Data Science</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/category/business" className="w-full">Business</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/category/design" className="w-full">Design</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex relative mx-auto w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="search"
              placeholder="Search for courses..."
              className="bg-secondary/50 focus:bg-background border border-input rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-edu-blue/20 text-sm"
            />
          </div>
          
          {/* Right Side */}
          <div className="ml-auto flex items-center space-x-3">
            <button className="rounded-full p-2 hover:bg-secondary transition-colors" aria-label="Messages">
              <MessageSquare size={20} />
            </button>
            <button className="rounded-full p-2 hover:bg-secondary transition-colors" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <ThemeToggle />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full overflow-hidden border border-border/50 w-10 h-10 flex items-center justify-center bg-primary/5 hover:bg-secondary transition-colors">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.user_metadata?.username || 'User'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/profile" className="w-full flex items-center">
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem>
                    <Link to="/admin" className="w-full flex items-center">
                      <LayoutDashboard size={16} className="mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link to="/settings" className="w-full flex items-center">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="lg:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="search"
              placeholder="Search for courses..."
              className="bg-secondary/50 focus:bg-background border border-input rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-edu-blue/20 text-sm"
            />
          </div>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-black/50 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar} />
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-card shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/dashboard" className="flex items-center gap-0 font-medium text-xl text-foreground">
            <span className="text-edu-blue">Skill</span>
            <span className="dark:text-white">versity</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-secondary"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4">
          <div className="space-y-1">
            <Link 
              to="/dashboard" 
              className="block w-full p-3 rounded-md hover:bg-secondary transition-colors flex items-center"
              onClick={toggleSidebar}
            >
              <Home size={18} className="mr-3" />
              Dashboard
            </Link>
            <Link 
              to="/courses" 
              className="block w-full p-3 rounded-md hover:bg-secondary transition-colors flex items-center"
              onClick={toggleSidebar}
            >
              <BookOpen size={18} className="mr-3" />
              Courses
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="block w-full p-3 rounded-md hover:bg-secondary transition-colors flex items-center"
                onClick={toggleSidebar}
              >
                <LayoutDashboard size={18} className="mr-3" />
                Admin Panel
              </Link>
            )}
            <Link 
              to="/schedule" 
              className="block w-full p-3 rounded-md hover:bg-secondary transition-colors flex items-center"
              onClick={toggleSidebar}
            >
              <Calendar size={18} className="mr-3" />
              Schedule
            </Link>
            <Link 
              to="/settings" 
              className="block w-full p-3 rounded-md hover:bg-secondary transition-colors flex items-center"
              onClick={toggleSidebar}
            >
              <Settings size={18} className="mr-3" />
              Settings
            </Link>
          </div>
          
          <div className="mt-10 pt-6 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut size={18} className="mr-3" />
              Sign out
            </Button>
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
