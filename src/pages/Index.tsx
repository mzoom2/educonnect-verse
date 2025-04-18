import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/hero/HeroSection';
import FeatureSection from '@/components/features/FeatureSection';
import CourseCarousel from '@/components/courses/CourseCarousel';
import SocialProof from '@/components/ui/SocialProof';
import Footer from '@/components/layout/Footer';

const Index = () => {
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const href = this.getAttribute('href');
        if (!href) return;
        
        const targetElement = document.querySelector(href);
        if (!targetElement) return;
        
        window.scrollTo({
          top: targetElement.getBoundingClientRect().top + window.pageYOffset - 80,
          behavior: 'smooth'
        });
      });
    });
    
    // Initial animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', () => {});
      });
      
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <CourseCarousel />
        <SocialProof />
        <div className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background to-secondary/10">
          <div className="container mx-auto text-center">
            <h2 className="section-heading">
              Ready to <span className="text-edu-blue">Begin Learning?</span>
            </h2>
            <p className="section-subheading mx-auto mb-6 md:mb-8">
              Join thousands of students already learning on our platform. Get started today with access to hundreds of quality courses.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/register" className="btn-primary px-6 py-2.5 text-base">
                Sign Up Now
              </a>
              <a href="/courses" className="btn-secondary px-6 py-2.5 text-base">
                Explore Courses
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
