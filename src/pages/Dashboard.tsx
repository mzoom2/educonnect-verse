
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Course type definition
type Course = {
  id: string;
  image: string;
  title: string;
  author: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [inDemandCourses, setInDemandCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // In a real app, these would be separate API calls to fetch different categories of courses
        const mockCourses = [
          {
            id: "1",
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            title: "Introduction to Machine Learning with Python",
            author: "Dr. Sarah Johnson",
            rating: 4.8,
            duration: "8 weeks",
            price: "₦15,000",
            category: "Data Science"
          },
          {
            id: "2",
            image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
            title: "Modern Web Development: React & Node.js",
            author: "Michael Chen",
            rating: 4.7,
            duration: "10 weeks",
            price: "₦18,000",
            category: "Programming"
          },
          {
            id: "3",
            image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            title: "Fundamentals of UI/UX Design",
            author: "Emma Thompson",
            rating: 4.9,
            duration: "6 weeks",
            price: "₦14,500",
            category: "Design"
          },
          {
            id: "4",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            title: "Digital Marketing Fundamentals",
            author: "Jessica Adams",
            rating: 4.6,
            duration: "6 weeks",
            price: "₦12,500",
            category: "Marketing"
          },
          {
            id: "5",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            title: "Financial Planning & Investment Strategies",
            author: "Robert Williams",
            rating: 4.9,
            duration: "4 weeks",
            price: "₦20,000",
            category: "Finance"
          },
          {
            id: "6",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
            title: "Data Analytics for Business Decision-Making",
            author: "Daniel Morgan",
            rating: 4.7,
            duration: "9 weeks",
            price: "₦19,500",
            category: "Business"
          }
        ];

        // Set different courses for different sections (in a real app, these would come from API)
        setRecentCourses(mockCourses.slice(0, 4));
        setPopularCourses(mockCourses.slice(1, 5));
        setRecommendedCourses(mockCourses.slice(2, 6));
        setInDemandCourses(mockCourses.slice(0, 4).reverse());
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Error fetching courses",
          description: "Could not load courses. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-edu-blue"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="container mx-auto px-4">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-edu-blue/10 to-edu-purple/10 rounded-lg p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.username || 'Student'}!
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey. You have 0 courses in progress.
            </p>
          </div>

          {/* Recently Viewed Courses */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Recently Viewed Courses</h2>
              <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                View all <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            <CourseCarousel courses={recentCourses} />
          </section>

          {/* Most Popular Courses */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Most Popular Courses</h2>
              <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                View all <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            <CourseCarousel courses={popularCourses} />
          </section>

          {/* Personalized Recommendations */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Recommended For You</h2>
              <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                See all recommendations <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            <CourseCarousel courses={recommendedCourses} />
          </section>

          {/* In-Demand Skills */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">In-Demand Skills</h2>
              <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                View all <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            <CourseCarousel courses={inDemandCourses} />
          </section>

          {/* Categories */}
          <section className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Browse by Category</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "Web Development", count: "42 courses" },
                { name: "Data Science", count: "38 courses" },
                { name: "Business", count: "25 courses" },
                { name: "Design", count: "19 courses" },
                { name: "Marketing", count: "27 courses" },
                { name: "Mobile Development", count: "31 courses" },
                { name: "IT & Software", count: "43 courses" },
                { name: "Personal Development", count: "22 courses" }
              ].map((category, index) => (
                <div 
                  key={index} 
                  className="bg-card border border-border/40 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
