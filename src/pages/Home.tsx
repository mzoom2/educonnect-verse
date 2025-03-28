
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Award, Clock, FileText
} from 'lucide-react';
import DashboardCourseCard from '@/components/dashboard/DashboardCourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Course, useAllCourses } from '@/services/courseService';

const Home = () => {
  const { toast } = useToast();
  const { user, isTeacher } = useAuth();
  const { courses, loading, error } = useAllCourses();
  
  // Get the most recent courses for the "Continue Learning" section
  const recentCourses = courses && courses.length > 0 
    ? courses.slice(0, 3) 
    : [];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        {/* Welcome Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {user?.username || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your learning journey today.
          </p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">7</div>
                <BookOpen className="text-edu-blue" size={24} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                2 new this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">3</div>
                <Award className="text-edu-purple" size={24} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1 this month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hours Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">24</div>
                <Clock className="text-edu-yellow" size={24} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +5 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">2</div>
                <FileText className="text-edu-green" size={24} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed certifications
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Courses */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Clock size={20} className="mr-2 text-edu-blue" />
              Continue Learning
            </h2>
            <Link to="/courses">
              <Button variant="outline" size="sm">
                View All Courses
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading courses...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading courses. Please try again later.
            </div>
          ) : recentCourses.length === 0 ? (
            <div className="text-center py-8">
              No courses available. Explore our catalog to start learning!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentCourses.map((course) => (
                <DashboardCourseCard 
                  key={course.id} 
                  id={course.id}
                  title={course.title}
                  author={course.author}
                  image={course.image}
                  rating={course.rating}
                  duration={course.duration}
                  price={course.price}
                  category={course.category}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
