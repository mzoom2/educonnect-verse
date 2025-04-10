
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import CourseCard from './CourseCard';
import { Course } from '@/services/courseService';
import { useApi } from '@/hooks/useApi';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface CourseCarouselProps {
  customCourses?: Course[];
  isLoading?: boolean;
}

const CourseCarousel = ({ customCourses, isLoading: propIsLoading = false }: CourseCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const { data: fetchedCourses, isLoading: apiIsLoading, error, refetch } = useApi<Course[]>('/courses', 'get');
  const courses = customCourses || fetchedCourses || [];
  const isLoading = propIsLoading || apiIsLoading;
  
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
  
  // Effect to re-check scroll buttons when courses load
  useEffect(() => {
    if (!isLoading && courses.length > 0) {
      // Small delay to allow for render
      setTimeout(updateScrollButtons, 100);
    }
  }, [isLoading, courses.length]);
  
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

  // Log data for debugging purposes
  console.log("CourseCarousel data:", { 
    fetchedCourses, 
    customCourses, 
    coursesLength: courses.length, 
    isLoading, 
    error 
  });

  // Fallback courses for demonstration if needed
  const fallbackCourses = [
    {
      id: '1',
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Introduction to Machine Learning with Python",
      author: "Dr. Sarah Johnson",
      rating: 4.8,
      duration: "8 weeks",
      price: "₦15,000",
      category: "Data Science"
    },
    {
      id: '2',
      image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
      title: "Modern Web Development: React & Node.js",
      author: "Michael Chen",
      rating: 4.7,
      duration: "10 weeks",
      price: "₦18,000",
      category: "Programming"
    },
    {
      id: '3',
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
      title: "Fundamentals of UI/UX Design",
      author: "Emma Thompson",
      rating: 4.9,
      duration: "6 weeks",
      price: "₦14,500",
      category: "Design"
    },
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Courses</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>{error}. Please try refreshing.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-fit" 
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        ) : courses.length > 0 ? (
          <div 
            className="overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4"
            ref={carouselRef}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-6" style={{ minWidth: 'min-content' }}>
              {courses.map((course, index) => (
                <div 
                  key={course.id || index} 
                  className="min-w-[300px] max-w-[300px] sm:min-w-[320px] sm:max-w-[320px]"
                >
                  <CourseCard {...course} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No courses available at the moment.</p>
            <div 
              className="overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4"
              ref={carouselRef}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex space-x-6" style={{ minWidth: 'min-content' }}>
                {fallbackCourses.map((course, index) => (
                  <div 
                    key={course.id || index} 
                    className="min-w-[300px] max-w-[300px] sm:min-w-[320px] sm:max-w-[320px]"
                  >
                    <CourseCard {...course} />
                  </div>
                ))}
              </div>
            </div>
            <p className="text-muted-foreground mt-6 text-sm italic">Showing example courses</p>
          </div>
        )}
        
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
