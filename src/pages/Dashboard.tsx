import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel, { Course } from '@/components/dashboard/CourseCarousel';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search as SearchIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { 
  useAllCourses, 
  useSearchCourses,
  getRecentlyViewedCourses,
  getPopularCourses,
  getRecommendedCourses,
  getInDemandCourses,
  getCategoryCourseCount
} from '@/services/courseService';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { courses, loading: coursesLoading } = useAllCourses();
  const { searchResults, loading: searchLoading } = useSearchCourses(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Get user's name from username, or fallback to "Student"
  const userName = user ? user.username : 'Student';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(!!searchTerm.trim());
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
  };

  if (coursesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-edu-blue"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Get courses for different sections
  const recentlyViewedCourses = getRecentlyViewedCourses(courses);
  const popularCourses = getPopularCourses(courses);
  const recommendedCourses = getRecommendedCourses(courses);
  const inDemandCourses = getInDemandCourses(courses);
  const categoryData = getCategoryCourseCount(courses);

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
              {searchLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-edu-blue"></div>
                </div>
              ) : (
                <CourseCarousel 
                  courses={searchResults} 
                  emptyMessage="No courses matching your search criteria"
                />
              )}
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
                <CourseCarousel courses={recentlyViewedCourses} />
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
