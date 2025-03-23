
import React, { useEffect, useRef } from 'react';
import { ChevronRight, Users, BookOpen, Award } from 'lucide-react';

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
    <div ref={containerRef} className="relative overflow-hidden pt-20 pb-16 md:pb-24 lg:pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-edu-blue/5 blur-3xl animate-float"></div>
        <div className="absolute top-[20%] right-[5%] w-[30%] h-[40%] rounded-full bg-edu-purple/5 blur-3xl animate-float animate-delay-300"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-edu-teal/5 blur-3xl animate-float animate-delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 pt-20 md:pt-28 lg:pt-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="animate-on-scroll opacity-0 bg-edu-light-gray rounded-full px-4 py-1.5 text-sm font-medium text-edu-blue mb-6 inline-flex items-center">
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
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-on-scroll opacity-0 animate-delay-200">
            <a href="/register" className="btn-primary px-6 py-3 text-base h-auto flex items-center justify-center">
              Get Started <ChevronRight size={16} className="ml-1" />
            </a>
            <a href="#features" className="btn-secondary px-6 py-3 text-base h-auto flex items-center justify-center">
              Learn More
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full max-w-3xl animate-on-scroll opacity-0 animate-delay-300">
            <div className="glass-card p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-edu-blue/10 flex items-center justify-center mb-3">
                <Users size={20} className="text-edu-blue" />
              </div>
              <h3 className="text-2xl font-bold">10,000+</h3>
              <p className="text-muted-foreground">Active Students</p>
            </div>
            <div className="glass-card p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-edu-purple/10 flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-edu-purple" />
              </div>
              <h3 className="text-2xl font-bold">500+</h3>
              <p className="text-muted-foreground">Quality Courses</p>
            </div>
            <div className="glass-card p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-edu-green/10 flex items-center justify-center mb-3">
                <Award size={20} className="text-edu-green" />
              </div>
              <h3 className="text-2xl font-bold">95%</h3>
              <p className="text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
