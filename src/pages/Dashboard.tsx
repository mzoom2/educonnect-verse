
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Sample course data for dashboard
const sampleCourses = [
  {
    id: '1',
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Introduction to Machine Learning with Python",
    author: "Dr. Sarah Johnson",
    rating: 4.8,
    duration: "8 weeks",
    price: "₦15,000",
    category: "Data Science",
    createdAt: "2023-05-10T10:30:00Z",
    viewCount: 1250,
    enrollmentCount: 562,
    popularityScore: 89
  },
  {
    id: '2',
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
    title: "Modern Web Development: React & Node.js",
    author: "Michael Chen",
    rating: 4.7,
    duration: "10 weeks",
    price: "₦18,000",
    category: "Programming",
    createdAt: "2023-06-15T14:45:00Z",
    viewCount: 980,
    enrollmentCount: 421,
    popularityScore: 76
  },
  {
    id: '3',
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Fundamentals of UI/UX Design",
    author: "Emma Thompson",
    rating: 4.9,
    duration: "6 weeks",
    price: "₦14,500",
    category: "Design",
    createdAt: "2023-04-20T09:15:00Z",
    viewCount: 1520,
    enrollmentCount: 689,
    popularityScore: 92
  },
  {
    id: '4',
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Digital Marketing Fundamentals",
    author: "Jessica Adams",
    rating: 4.6,
    duration: "6 weeks",
    price: "₦12,500",
    category: "Marketing",
    createdAt: "2023-07-05T11:20:00Z",
    viewCount: 750,
    enrollmentCount: 310,
    popularityScore: 68
  },
  {
    id: '5',
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Financial Planning & Investment Strategies",
    author: "Robert Williams",
    rating: 4.9,
    duration: "4 weeks",
    price: "₦20,000",
    category: "Finance",
    createdAt: "2023-03-12T16:30:00Z",
    viewCount: 950,
    enrollmentCount: 405,
    popularityScore: 81
  },
  {
    id: '6',
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Data Analytics for Business Decision-Making",
    author: "Daniel Morgan",
    rating: 4.7,
    duration: "9 weeks",
    price: "₦19,500",
    category: "Business",
    createdAt: "2023-02-28T13:10:00Z",
    viewCount: 1100,
    enrollmentCount: 470,
    popularityScore: 85
  }
];

// Helper functions for course filtering
const getRecentlyViewedCourses = (courses) => {
  return [...courses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
};

const getPopularCourses = (courses) => {
  return [...courses].sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0)).slice(0, 6);
};

const getRecommendedCourses = (courses) => {
  return [...courses].sort((a, b) => b.rating - a.rating).slice(0, 6);
};

const getInDemandCourses = (courses) => {
  return [...courses].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0)).slice(0, 6);
};

const getCategoryCourseCount = (courses) => {
  const categories = {};
  
  courses.forEach(course => {
    if (course.category) {
      categories[course.category] = (categories[course.category] || 0) + 1;
    }
  });
  
  return Object.entries(categories).map(([name, count]) => ({ name, count }));
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Get user's name from username, or fallback to "Student"
  const userName = user ? user.username : 'Student';

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(!!searchTerm.trim());
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  // Search functionality with mock data
  const searchResults = isSearching ? 
    sampleCourses.filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.author.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

  // Get courses for different sections
  const recentlyViewedCourses = getRecentlyViewedCourses(sampleCourses);
  const popularCourses = getPopularCourses(sampleCourses);
  const recommendedCourses = getRecommendedCourses(sampleCourses);
  const inDemandCourses = getInDemandCourses(sampleCourses);
  const categoryData = getCategoryCourseCount(sampleCourses);

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="container mx-auto px-4">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-edu-blue/10 to-edu-purple/10 rounded-lg p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="text-muted-foreground">
              Continue your learning journey. You have 0 courses in progress.
            </p>
            {isAdmin && (
              <div className="mt-4">
                <Link to="/admin">
                  <Button className="bg-edu-blue hover:bg-edu-blue/90">
                    Access Admin Panel
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Search Form - Desktop and Mobile */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="search"
                  placeholder="Search for courses..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="bg-edu-blue">Search</Button>
              {isSearching && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </form>
          </div>

          {/* Search Results */}
          {isSearching && (
            <section className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-semibold">Search Results</h2>
              </div>
              <CourseCarousel 
                courses={searchResults} 
                emptyMessage={"No courses matching your search criteria"} 
              />
            </section>
          )}

          {!isSearching && (
            <>
              {/* Recently Viewed Courses */}
              <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold">Recently Viewed Courses</h2>
                  <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                    View all <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
                <CourseCarousel 
                  courses={recentlyViewedCourses} 
                  emptyMessage={"You haven't viewed any courses yet"} 
                />
              </section>

              {/* Most Popular Courses */}
              <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold">Most Popular Courses</h2>
                  <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                    View all <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
                <CourseCarousel 
                  courses={popularCourses} 
                  emptyMessage={"No popular courses available"} 
                />
              </section>

              {/* Personalized Recommendations */}
              <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold">Recommended For You</h2>
                  <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                    See all recommendations <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
                <CourseCarousel 
                  courses={recommendedCourses} 
                  emptyMessage={"No recommendations available yet"} 
                />
              </section>

              {/* In-Demand Skills */}
              <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold">In-Demand Skills</h2>
                  <Button variant="ghost" className="text-edu-blue hover:text-edu-blue/90 p-0 flex items-center">
                    View all <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
                <CourseCarousel 
                  courses={inDemandCourses} 
                  emptyMessage={"No in-demand courses available"} 
                />
              </section>

              {/* Categories */}
              <section className="mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold">Browse by Category</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryData.map((category, index) => (
                    <div 
                      key={index} 
                      className="bg-card border border-border/40 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <h3 className="font-medium mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} course{category.count !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
