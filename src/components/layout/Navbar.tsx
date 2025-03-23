
import React, { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavItemWithOnClick from './NavItemWithOnClick';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from "@/components/ui/command";
import { Button } from '@/components/ui/button';
import { useSearchCourses } from '@/services/courseService';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavItem = ({ href, children, className }: NavItemProps) => (
  <li>
    <a 
      href={href} 
      className={cn(
        "nav-link",
        className
      )}
    >
      {children}
    </a>
  </li>
);

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { searchResults, loading } = useSearchCourses(searchQuery);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const handleSelectCourse = (courseId: string) => {
    setOpen(false);
    navigate(`/courses/${courseId}`);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search courses..." 
          value={searchQuery}
          onValueChange={handleSearch}
        />
        <CommandList>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-edu-blue"></div>
            </div>
          ) : (
            <>
              <CommandEmpty>No courses found.</CommandEmpty>
              <CommandGroup heading="Courses">
                {searchResults.map((course) => (
                  <CommandItem 
                    key={course.id}
                    onSelect={() => handleSelectCourse(course.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        {course.title}
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>

      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out backdrop-blur-md w-full",
          scrolled ? "py-3 bg-background/80 shadow-sm border-b border-border/40" : "py-5 bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <a 
            href="/" 
            className="flex items-center gap-0 font-medium text-xl text-foreground"
            aria-label="Skillversity"
          >
            <span className="text-edu-blue">Skill</span>
            <span className="dark:text-white">versity</span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <NavItem href="#features">Features</NavItem>
              <NavItem href="#courses">Courses</NavItem>
              <NavItem href="#testimonials">Testimonials</NavItem>
              <NavItem href="#pricing">Pricing</NavItem>
            </ul>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {isDashboard && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setOpen(true)}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            )}
            <ThemeToggle />
            <a href="/login" className="nav-link">
              Login
            </a>
            <a href="/register" className="btn-primary">
              Sign Up
            </a>
          </div>
          
          {/* Mobile Menu */}
          {isMobile ? (
            <div className="flex items-center space-x-2">
              {isDashboard && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground"
                  onClick={() => setOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="text-foreground"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                  >
                    <Menu size={24} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="pt-12 w-full sm:w-[350px]">
                  <nav className="flex flex-col">
                    <ul className="flex flex-col space-y-5 text-lg mb-8">
                      <NavItemWithOnClick href="#features" className="text-lg" onClick={closeMenu}>
                        Features
                      </NavItemWithOnClick>
                      <NavItemWithOnClick href="#courses" className="text-lg" onClick={closeMenu}>
                        Courses
                      </NavItemWithOnClick>
                      <NavItemWithOnClick href="#testimonials" className="text-lg" onClick={closeMenu}>
                        Testimonials
                      </NavItemWithOnClick>
                      <NavItemWithOnClick href="#pricing" className="text-lg" onClick={closeMenu}>
                        Pricing
                      </NavItemWithOnClick>
                    </ul>
                    
                    <div className="flex flex-col space-y-4">
                      <a href="/login" className="btn-secondary w-full text-center" onClick={closeMenu}>
                        Login
                      </a>
                      <a href="/register" className="btn-primary w-full text-center" onClick={closeMenu}>
                        Sign Up
                      </a>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center space-x-2 md:hidden">
              {isDashboard && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground"
                  onClick={() => setOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
              <ThemeToggle />
              <button 
                className="text-foreground"
                onClick={toggleMenu}
                aria-label={isOpen ? "Close menu" : "Open menu"}
              >
                <Menu size={24} />
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;
