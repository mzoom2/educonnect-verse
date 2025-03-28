
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { 
  BookOpen, Award, Clock, FileText, // Fixed the FileText import here too
  TrendingUp, Activity, Star 
} from 'lucide-react';
import DashboardCourseCard from '@/components/dashboard/DashboardCourseCard';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CourseOverview = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  
  // Demo data for charts
  const demoData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 21 },
    { name: 'Fri', value: 25 },
    { name: 'Sat', value: 18 },
    { name: 'Sun', value: 14 },
  ];
  
  const categoryData = [
    { name: 'Data Science', count: 18 },
    { name: 'Web Dev', count: 24 },
    { name: 'Design', count: 15 },
    { name: 'Marketing', count: 9 },
    { name: 'Business', count: 14 },
  ];

  // Default enrolled courses for development
  const enrolledCourses = [
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
    }
  ];
  
  const recentCourses = enrolledCourses.slice(0, 3);
  const popularCourses = [...enrolledCourses].sort(() => Math.random() - 0.5).slice(0, 3);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border shadow-sm rounded-md">
          <p className="text-sm font-medium">{`${label}`}</p>
          <p className="text-sm text-edu-blue">{`${payload[0].value} Hours`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Your Enrolled Courses
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress and explore your enrolled courses.
          </p>
        </div>
        
        {/* Main Tabs */}
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mycourses">My Courses</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            
            {/* Course Activity & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity size={18} className="mr-2 text-edu-blue" />
                      Course Activity
                    </CardTitle>
                    <CardDescription>
                      Your weekly learning activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demoData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star size={18} className="mr-2 text-edu-yellow" />
                      Top Categories
                    </CardTitle>
                    <CardDescription>
                      Your most engaged subjects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.map((category, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-36 font-medium truncate pr-2">{category.name}</div>
                          <div className="w-full bg-secondary rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                index === 0 ? "bg-edu-blue" : 
                                index === 1 ? "bg-edu-purple" : 
                                index === 2 ? "bg-edu-green" : 
                                index === 3 ? "bg-edu-yellow" : "bg-edu-red"
                              }`} 
                              style={{ width: `${(category.count / 25) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-right text-muted-foreground text-sm">
                            {category.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Continue Learning Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <Clock size={20} className="mr-2 text-edu-blue" />
                  Continue Learning
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("mycourses")}>
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentCourses.map((course) => (
                  <DashboardCourseCard key={course.id} {...course} />
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* My Courses Tab Content */}
          <TabsContent value="mycourses" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">All Enrolled Courses</h2>
              <Button variant="outline">
                Browse New Courses
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <DashboardCourseCard key={course.id} {...course} />
              ))}
            </div>
          </TabsContent>
          
          {/* Progress Tab Content */}
          <TabsContent value="progress">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Learning Progress</CardTitle>
                  <CardDescription>
                    Track your course completions and learning milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border-b pb-4 last:border-0">
                        <h3 className="font-medium mb-2">{course.title}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="h-2.5 rounded-full bg-edu-blue" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CourseOverview;
