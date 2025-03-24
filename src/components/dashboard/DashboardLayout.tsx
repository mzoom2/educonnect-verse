import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Home, BookOpen, Calendar, Settings, LogOut, 
  Bell, MessageSquare, User, ChevronDown, LayoutDashboard, Search
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
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";
import { useSearchCourses } from '@/services/courseService';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { searchResults, loading, handleSearch } = useSearchCourses();
  const navigate = useNavigate();

  // This effect ensures that the search results are maintained when the dialog reopens
  useEffect(() => {
    if (searchDialogOpen && inputValue.trim() !== "") {
      handleSearch(inputValue);
    }
  }, [searchDialogOpen, inputValue, handleSearch]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleSearchSubmit = () => {
    if (inputValue.trim() !== "") {
      handleSearch(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSearchDialogOpen(false);
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Search Dialog */}
      <CommandDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <div className="flex items-center border-b px-3">
          <CommandInput 
            placeholder="Search for courses..." 
            value={inputValue}
            onValueChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSearchSubmit}
            className="ml-2"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <CommandList>
          {inputValue.trim() === "" ? (
            <CommandEmpty>Type and press Enter to search...</CommandEmpty>
          ) : loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-edu-blue"></div>
            </div>
          ) : (
            <>
              {searchResults.length === 0 ? (
                <CommandEmpty>No courses found matching "{inputValue}"</CommandEmpty>
              ) : (
                <CommandGroup heading={`${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`}>
                  {searchResults.map((course) => (
                    <CommandItem 
                      key={course.id}
                      onSelect={() => handleSelectCourse(course.id)}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center w-full">
                        <div className="w-10 h-10 mr-3 rounded overflow-hidden">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.category} • {course.author}</p>
                        </div>
                        <div className="text-sm font-medium text-edu-blue">
                          {course.price}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>

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
          
          {/* Search Bar with keyboard shortcut - Desktop */}
          <div className="hidden lg:flex relative mx-auto w-full max-w-md">
            <Button
              variant="outline"
              className="relative w-full justify-start text-sm text-muted-foreground"
              onClick={() => setSearchDialogOpen(true)}
            >
              <span className="inline-flex">Search for courses...</span>
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
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
          <Button
            variant="outline"
            className="relative w-full justify-start text-sm text-muted-foreground"
            onClick={() => setSearchDialogOpen(true)}
          >
            <span className="inline-flex">Search for courses...</span>
          </Button>
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
