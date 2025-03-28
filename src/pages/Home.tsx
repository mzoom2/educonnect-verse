
import React, { useState } from 'react';
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

const Home = () => {
  const { toast } = useToast();
  const { user, isTeacher } = useAuth();
  
  // Default courses for development
  const defaultCourses = [
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
  
  // Use default courses
  const recentCourses = defaultCourses.slice(0, 3);

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course) => (
              <DashboardCourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
