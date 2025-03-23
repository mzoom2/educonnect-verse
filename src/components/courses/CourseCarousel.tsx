
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import CourseCard from './CourseCard';

const CourseCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };
  
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      window.addEventListener('resize', updateScrollButtons);
    }
    
    return () => {
      if (carousel) {
        carousel.removeEventListener('scroll', updateScrollButtons);
      }
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const carousel = carouselRef.current;
    const scrollAmount = carousel.clientWidth * 0.75;
    
    if (direction === 'left') {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  const courses = [
    {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Introduction to Machine Learning with Python",
      author: "Dr. Sarah Johnson",
      rating: 4.8,
      duration: "8 weeks",
      price: "₦15,000",
      category: "Data Science"
    },
    {
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
      title: "Modern Web Development: React & Node.js",
      author: "Michael Chen",
      rating: 4.7,
      duration: "10 weeks",
      price: "₦18,000",
      category: "Programming"
    },
    {
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Fundamentals of UI/UX Design",
      author: "Emma Thompson",
      rating: 4.9,
      duration: "6 weeks",
      price: "₦14,500",
      category: "Design"
    },
    {
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Digital Marketing Fundamentals",
      author: "Jessica Adams",
      rating: 4.6,
      duration: "6 weeks",
      price: "₦12,500",
      category: "Marketing"
    },
    {
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Financial Planning & Investment Strategies",
      author: "Robert Williams",
      rating: 4.9,
      duration: "4 weeks",
      price: "₦20,000",
      category: "Finance"
    },
    {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Data Analytics for Business Decision-Making",
      author: "Daniel Morgan",
      rating: 4.7,
      duration: "9 weeks",
      price: "₦19,500",
      category: "Business"
    }
  ];

  return (
    <section id="courses" className="section-padding bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
          <div>
            <div className="inline-flex items-center mb-4 bg-edu-blue/10 rounded-full px-4 py-1.5">
              <BookOpen size={16} className="text-edu-blue mr-2" />
              <span className="text-sm font-medium text-edu-blue">Top-Rated Courses</span>
            </div>
            <h2 className="section-heading mb-3">
              Trending <span className="text-edu-blue">Courses</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Browse our most popular courses across different categories. Start your learning journey today.
            </p>
          </div>
          
          <div className="hidden md:flex space-x-2">
            <button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-3 rounded-full border bg-background hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-3 rounded-full border bg-background hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div 
          className="overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4"
          ref={carouselRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-6" style={{ minWidth: 'min-content' }}>
            {courses.map((course, index) => (
              <div 
                key={index} 
                className="min-w-[300px] max-w-[300px] sm:min-w-[320px] sm:max-w-[320px]"
              >
                <CourseCard {...course} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <a href="/courses" className="btn-primary px-6 py-3 text-base">
            View All Courses
          </a>
        </div>
      </div>
    </section>
  );
};

export default CourseCarousel;
