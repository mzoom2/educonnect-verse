
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  useAllCourses, 
  getRecentlyViewedCourses,
  getPopularCourses,
  getRecommendedCourses,
  getInDemandCourses,
  getCategoryCourseCount
} from '@/services/courseService';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { courses, loading: coursesLoading } = useAllCourses();
  
  // Get user's name from username in metadata, or email, or fallback to "Student"
  const userName = user?.user_metadata?.username || 
                  (user?.email ? user.email.split('@')[0] : 'Student');

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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
