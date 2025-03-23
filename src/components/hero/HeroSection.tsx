
import React, { useEffect, useRef } from 'react';
import { ChevronRight, Users, BookOpen, Award, Star } from 'lucide-react';

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      },
      { threshold: 0.1 }
    );
    
    const elements = containerRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden py-16 md:py-20 lg:py-24">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-edu-blue/5 blur-3xl animate-float"></div>
        <div className="absolute top-[20%] right-[5%] w-[30%] h-[40%] rounded-full bg-edu-purple/5 blur-3xl animate-float animate-delay-300"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-edu-teal/5 blur-3xl animate-float animate-delay-500"></div>
      </div>

      <div className="container mx-auto pt-14 md:pt-20 lg:pt-24 flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12">
        <div className="flex-1 text-center md:text-left">
          {/* Badge */}
          <div className="animate-on-scroll opacity-0 inline-flex items-center bg-edu-light-gray rounded-full px-3 py-1 text-sm font-medium text-edu-blue mb-4 md:mb-6">
            <span className="mr-1.5">Future of Learning</span>
            <span className="flex h-2 w-2 rounded-full bg-edu-blue animate-pulse-subtle"></span>
          </div>
          
          {/* Heading */}
          <h1 className="hero-heading animate-on-scroll opacity-0 mb-4 md:mb-6">
            Education Meets <br className="hidden sm:block" />
            <span className="text-edu-blue">Social Networking</span>
          </h1>
          
          {/* Subheading */}
          <p className="hero-subheading animate-on-scroll opacity-0 animate-delay-100 mb-6 md:mb-8">
            Skillversity combines intelligent learning management with social networking features to create personalized, engaging learning experiences.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-on-scroll opacity-0 animate-delay-200 justify-center md:justify-start">
            <a href="/register" className="btn-primary px-5 py-2.5 text-base h-auto flex items-center justify-center">
              Get Started <ChevronRight size={16} className="ml-1" />
            </a>
            <a href="#features" className="btn-secondary px-5 py-2.5 text-base h-auto flex items-center justify-center">
              Learn More
            </a>
          </div>
        </div>

        <div className="flex-1 mt-8 md:mt-0 relative max-w-md mx-auto md:max-w-xl animate-on-scroll opacity-0 animate-delay-300">
          <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
              alt="Students collaborating" 
              className="w-full"
            />
          </div>
          <div className="absolute top-1/4 -right-8 sm:-right-12 z-0 rounded-lg overflow-hidden shadow-xl w-36 sm:w-48 h-36 sm:h-48 transform -rotate-6 hover:rotate-0 transition-transform duration-500 hidden sm:block">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Student with laptop" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 sm:-bottom-8 -left-6 sm:-left-10 z-20 rounded-lg overflow-hidden shadow-xl w-32 sm:w-40 h-32 sm:h-40 transform rotate-12 hover:rotate-0 transition-transform duration-500 hidden sm:block">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Mobile app" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="container mx-auto mt-12 md:mt-16 lg:mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-on-scroll opacity-0 animate-delay-400">
          <div className="glass-card p-4 md:p-6 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-edu-blue/10 flex items-center justify-center mr-3 sm:mr-4 shrink-0">
              <Users size={20} className="text-edu-blue" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">10,000+</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Active Students</p>
            </div>
          </div>
          <div className="glass-card p-4 md:p-6 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-edu-purple/10 flex items-center justify-center mr-3 sm:mr-4 shrink-0">
              <BookOpen size={20} className="text-edu-purple" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">500+</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Quality Courses</p>
            </div>
          </div>
          <div className="glass-card p-4 md:p-6 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-edu-green/10 flex items-center justify-center mr-3 sm:mr-4 shrink-0">
              <Award size={20} className="text-edu-green" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">95%</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Completion Rate</p>
            </div>
          </div>
          <div className="glass-card p-4 md:p-6 flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-edu-yellow/10 flex items-center justify-center mr-3 sm:mr-4 shrink-0">
              <Star size={20} className="text-edu-yellow" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold">4.9/5</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
