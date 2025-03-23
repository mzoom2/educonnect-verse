
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
    <div ref={containerRef} className="relative overflow-hidden py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-edu-blue/5 blur-3xl animate-float"></div>
        <div className="absolute top-[20%] right-[5%] w-[30%] h-[40%] rounded-full bg-edu-purple/5 blur-3xl animate-float animate-delay-300"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-edu-teal/5 blur-3xl animate-float animate-delay-500"></div>
      </div>

      <div className="container mx-auto px-4 pt-20 md:pt-28 lg:pt-32 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="flex-1 text-center md:text-left">
          {/* Badge */}
          <div className="animate-on-scroll opacity-0 inline-flex items-center bg-edu-light-gray rounded-full px-4 py-1.5 text-sm font-medium text-edu-blue mb-6">
            <span className="mr-1.5">Future of Learning</span>
            <span className="flex h-2 w-2 rounded-full bg-edu-blue animate-pulse-subtle"></span>
          </div>
          
          {/* Heading */}
          <h1 className="hero-heading animate-on-scroll opacity-0 mb-6">
            Education Meets <br className="hidden sm:block" />
            <span className="text-edu-blue">Social Networking</span>
          </h1>
          
          {/* Subheading */}
          <p className="hero-subheading animate-on-scroll opacity-0 animate-delay-100 mb-8 md:mb-10">
            EduSocial combines intelligent learning management with social networking features to create personalized, engaging learning experiences.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-on-scroll opacity-0 animate-delay-200 justify-center md:justify-start">
            <a href="/register" className="btn-primary px-6 py-3 text-base h-auto flex items-center justify-center">
              Get Started <ChevronRight size={16} className="ml-1" />
            </a>
            <a href="#features" className="btn-secondary px-6 py-3 text-base h-auto flex items-center justify-center">
              Learn More
            </a>
          </div>
        </div>

        <div className="flex-1 hidden md:block relative max-w-xl animate-on-scroll opacity-0 animate-delay-300">
          <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
              alt="Students collaborating" 
              className="w-full"
            />
          </div>
          <div className="absolute top-1/4 -right-12 z-0 rounded-lg overflow-hidden shadow-xl w-48 h-48 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Student with laptop" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -left-10 z-20 rounded-lg overflow-hidden shadow-xl w-40 h-40 transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Mobile app" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="container mx-auto px-4 mt-16 md:mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll opacity-0 animate-delay-400">
          <div className="glass-card p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-edu-blue/10 flex items-center justify-center mr-4 shrink-0">
              <Users size={22} className="text-edu-blue" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">10,000+</h3>
              <p className="text-muted-foreground">Active Students</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-edu-purple/10 flex items-center justify-center mr-4 shrink-0">
              <BookOpen size={22} className="text-edu-purple" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">500+</h3>
              <p className="text-muted-foreground">Quality Courses</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-edu-green/10 flex items-center justify-center mr-4 shrink-0">
              <Award size={22} className="text-edu-green" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">95%</h3>
              <p className="text-muted-foreground">Completion Rate</p>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center">
            <div className="w-12 h-12 rounded-full bg-edu-yellow/10 flex items-center justify-center mr-4 shrink-0">
              <Star size={22} className="text-edu-yellow" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">4.9/5</h3>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
