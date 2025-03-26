
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardCourseCard from './DashboardCourseCard';

// Course type definition
export type Course = {
  id: string;
  image: string;
  title: string;
  author: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
  createdAt?: string;
  viewCount?: number;
  enrollmentCount?: number;
  popularityScore?: number;
};

interface CourseCarouselProps {
  title?: string;
  courses: Course[];
  emptyMessage?: string;
  loading?: boolean;
}

const CourseCarousel = ({ title, courses, emptyMessage = "No courses available", loading = false }: CourseCarouselProps) => {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
        <div className="bg-secondary/30 rounded-lg p-10 text-center">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
        <div className="bg-secondary/30 rounded-lg p-10 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
      <div className="relative group">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 shadow-md rounded-full p-2 opacity-90 hover:opacity-100 transform -translate-x-1/2"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 shadow-md rounded-full p-2 opacity-90 hover:opacity-100 transform translate-x-1/2"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
        
        {/* Carousel */}
        <div 
          className="overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
          ref={carouselRef}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-4" style={{ minWidth: 'min-content' }}>
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px]"
              >
                <DashboardCourseCard {...course} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCarousel;
