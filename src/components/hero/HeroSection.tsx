
import React, { useState, useEffect } from 'react';

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="hero" className="hero-section pt-32 md:pt-40 pb-16 md:pb-24 relative min-h-[90vh] flex items-center">
      <div className="absolute inset-0 bg-gradient-radial from-edu-blue/5 to-transparent">
        {/* You can add animated particles or other decorative elements here */}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="hero-content">
          {/* Main Heading */}
          <h1 className="hero-heading animate-on-scroll opacity-0">
            Education Meets <span className="text-edu-blue">Social Networking</span>
          </h1>
          
          {/* Subheading */}
          <p className="hero-subheading animate-on-scroll opacity-0 animate-delay-100 mb-6 md:mb-8">
            Skillversity combines intelligent learning management with social networking features to create personalized, engaging learning experiences.
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-buttons animate-on-scroll opacity-0 animate-delay-200">
            <a href="/register" className="btn-primary mr-4">
              Get Started
            </a>
            <a href="/courses" className="btn-secondary">
              Explore Courses
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
