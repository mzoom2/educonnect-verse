
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out backdrop-blur-md",
        scrolled ? "py-3 bg-background/80 shadow-sm" : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <a 
          href="/" 
          className="flex items-center gap-2 font-medium text-xl text-foreground"
          aria-label="EduSocial"
        >
          <span className="text-edu-blue">Edu</span>
          <span>Social</span>
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
          <a href="/login" className="nav-link">
            Login
          </a>
          <a href="/register" className="btn-primary">
            Sign Up
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/95 backdrop-blur-lg z-40 transition-all duration-300 ease-in-out md:hidden pt-24",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <nav className="container mx-auto px-6">
          <ul className="flex flex-col space-y-6 text-lg">
            <NavItem href="#features" className="text-lg" onClick={toggleMenu}>Features</NavItem>
            <NavItem href="#courses" className="text-lg" onClick={toggleMenu}>Courses</NavItem>
            <NavItem href="#testimonials" className="text-lg" onClick={toggleMenu}>Testimonials</NavItem>
            <NavItem href="#pricing" className="text-lg" onClick={toggleMenu}>Pricing</NavItem>
          </ul>
          
          <div className="mt-8 flex flex-col space-y-4">
            <a href="/login" className="btn-secondary w-full text-center" onClick={toggleMenu}>
              Login
            </a>
            <a href="/register" className="btn-primary w-full text-center" onClick={toggleMenu}>
              Sign Up
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
