
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, CalendarIcon, FileText, Github, HelpCircle, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';
import CourseCarousel from '@/components/dashboard/CourseCarousel';
import { 
  useAllCourses, 
  getRecentlyViewedCourses, 
  getPopularCourses, 
  getRecommendedCourses, 
  getInDemandCourses, 
  getCategoryCourseCount, 
  useSearchCourses,
  useEnrolledCourses,
  useTeacherCourses
} from '@/services/courseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { courses, loading: allCoursesLoading, refetchCourses } = useAllCourses();
  const { searchResults, loading: searchLoading } = useSearchCourses(searchTerm);
  const { enrolledCourses, loading: enrolledLoading } = useEnrolledCourses();
  const { teacherCourses, loading: teacherCoursesLoading } = useTeacherCourses();
  const [hasSearched, setHasSearched] = useState(false);

  // Refresh courses data when user changes
  useEffect(() => {
    if (user) {
      refetchCourses();
    }
  }, [user, refetchCourses]);

  // Get user's name or fallback
  const userName = user?.username || 'User';
  const isTeacher = user?.role === 'teacher';

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHasSearched(e.target.value.length > 0);
  };

  // Filter courses based on search term
  const filteredCourses = searchResults;

  // Get dummy data for testing - this will be replaced by actual API calls in production
  const recentlyViewedCourses = getRecentlyViewedCourses(courses);
  const popularCourses = getPopularCourses(courses);
  const recommendedCourses = getRecommendedCourses(courses);
  const inDemandCourses = getInDemandCourses(courses);
  const categoryCourseCount = getCategoryCourseCount(courses);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="grid gap-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
              <p className="text-muted-foreground">Here's what's happening with your account today.</p>
            </div>
            <div className="space-x-2">
              <Input
                type="search"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Schedule</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Github className="mr-2 h-4 w-4" />
                    <span>Github</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    <span>Twitter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Courses</CardTitle>
                <CardDescription>Total number of courses on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Number of courses you are currently enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrolledCourses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed Courses</CardTitle>
                <CardDescription>Number of courses you have successfully completed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Balance</CardTitle>
                <CardDescription>Your current account balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦{user?.metadata?.balance || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Course Category Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Courses by Category</CardTitle>
              <CardDescription>Distribution of courses across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryCourseCount}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Teacher's Created Courses (only shown to teachers) */}
          {isTeacher && (
            <CourseCarousel
              title="Your Created Courses"
              courses={teacherCourses}
              loading={teacherCoursesLoading}
              emptyMessage="You haven't created any courses yet. Click 'Create Course' to get started!"
            />
          )}

          {/* User's Enrolled Courses */}
          <CourseCarousel
            title="Your Enrolled Courses"
            courses={enrolledCourses}
            loading={enrolledLoading}
            emptyMessage="You're not enrolled in any courses yet. Browse courses below to get started!"
          />

          {/* Course Carousels */}
          <CourseCarousel
            title="Recently Viewed Courses"
            courses={recentlyViewedCourses}
            loading={allCoursesLoading}
            emptyMessage="You haven't viewed any courses yet."
          />

          <CourseCarousel
            title="Popular Courses"
            courses={popularCourses}
            loading={allCoursesLoading}
            emptyMessage="No popular courses available."
          />

          <CourseCarousel
            title="Recommended For You"
            courses={recommendedCourses}
            loading={allCoursesLoading}
            emptyMessage="No courses recommended for you yet."
          />

          <CourseCarousel
            title="In Demand Courses"
            courses={inDemandCourses}
            loading={allCoursesLoading}
            emptyMessage="No in-demand courses available."
          />

          {/* Search Results Carousel */}
          {searchTerm && (
            <CourseCarousel
              title="Search Results"
              courses={filteredCourses}
              loading={searchLoading}
              emptyMessage={hasSearched ? "No courses found matching your search." : "Type to search for courses."}
            />
          )}

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your recent activities and course progress</CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">INV001</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Paid</Badge>
                    </TableCell>
                    <TableCell>Credit Card</TableCell>
                    <TableCell className="text-right">₦250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV002</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Unpaid</Badge>
                    </TableCell>
                    <TableCell>PayPal</TableCell>
                    <TableCell className="text-right">₦150.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV003</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Paid</Badge>
                    </TableCell>
                    <TableCell>Direct Transfer</TableCell>
                    <TableCell className="text-right">₦300.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">INV004</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Paid</Badge>
                    </TableCell>
                    <TableCell>Credit Card</TableCell>
                    <TableCell className="text-right">₦200.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
