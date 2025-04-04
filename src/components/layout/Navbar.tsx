
import React, { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import NavItemWithOnClick from './NavItemWithOnClick';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { authService } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out"
    });
    navigate('/');
    closeMenu();
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    // Check if user is logged in
    setIsLoggedIn(authService.isAuthenticated());
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <a href="/dashboard" className="nav-link">
                Dashboard
              </a>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="nav-link">
                Login
              </a>
              <a href="/register" className="btn-primary">
                Sign Up
              </a>
            </>
          )}
        </div>
        
        {/* Mobile Menu */}
        {isMobile ? (
          <div className="flex items-center space-x-2">
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
                    {isLoggedIn ? (
                      <>
                        <a href="/dashboard" className="btn-secondary w-full text-center" onClick={closeMenu}>
                          Dashboard
                        </a>
                        <button onClick={handleLogout} className="btn-primary w-full text-center">
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <a href="/login" className="btn-secondary w-full text-center" onClick={closeMenu}>
                          Login
                        </a>
                        <a href="/register" className="btn-primary w-full text-center" onClick={closeMenu}>
                          Sign Up
                        </a>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center space-x-2 md:hidden">
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
  );
};

export default Navbar;
