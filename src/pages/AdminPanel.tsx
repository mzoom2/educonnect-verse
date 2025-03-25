import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isToday } from 'date-fns';
import { 
  Users, LogIn, GraduationCap, BookOpen, ChartLine, 
  CalendarDays, Clock, Settings, Filter, Edit, Trash, 
  RefreshCcw, TrendingUp, BarChart3, Eye, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AdminDashboardData {
  stats: {
    total_users: number;
    new_users_today: number;
    today_logins: number;
    total_courses: number;
    total_enrollments: number;
    avg_courses_per_user: number;
  };
  categories: { name: string; count: number }[];
  most_viewed_courses: any[];
  recent_activities: {
    id: number;
    username: string;
    email: string;
    action_type: string;
    details: string;
    created_at: string;
  }[];
}

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
  last_login: string | null;
}

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin && !isLoading) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access the admin panel.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate, toast]);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    setLoadError(null);
    try {
      console.log("Fetching dashboard data...");
      const response = await api.get('/admin/dashboard');
      console.log("Dashboard data received:", response.data);
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Error fetching admin dashboard data:', error);
      const errorMessage = error.response?.data?.message || "Could not load admin dashboard data.";
      setLoadError(errorMessage);
      toast({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    setLoadError(null);
    try {
      console.log("Fetching users data...");
      const response = await api.get('/admin/users');
      console.log("Users data received:", response.data);
      setUsers(response.data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || "Could not load user data.";
      setLoadError(errorMessage);
      toast({
        title: "Error loading users",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const fetchCourses = async () => {
    setLoadError(null);
    try {
      console.log("Fetching courses data...");
      const response = await api.get('/courses');
      console.log("Courses data received:", response.data);
      setCourses(response.data);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      const errorMessage = error.response?.data?.message || "Could not load course data.";
      setLoadError(errorMessage);
      toast({
        title: "Error loading courses",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Verify admin access before continuing
        if (isAdmin) {
          console.log("Fetching all admin data...");
          await fetchDashboardData();
          await fetchUsers();
          await fetchCourses();
          console.log("All admin data fetched successfully");
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        const errorMessage = error.response?.data?.message || "Could not load admin data.";
        setLoadError(errorMessage);
        toast({
          title: "Error fetching data",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchAllData();
      
      // Set up interval to refresh data every 60 seconds
      const interval = setInterval(() => {
        if (activeTab === 'overview') {
          fetchDashboardData();
        }
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  useEffect(() => {
    // Fetch tab-specific data when tab changes
    if (isAdmin) {
      if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'courses') {
        fetchCourses();
      }
    }
  }, [activeTab, isAdmin]);

  const handleRefreshData = () => {
    if (activeTab === 'overview') {
      fetchDashboardData();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'courses') {
      fetchCourses();
    }
  };

  // Format activity type for display
  const formatActivityType = (type: string) => {
    switch (type) {
      case 'login':
        return <Badge className="bg-green-500">Login</Badge>;
      case 'registration':
        return <Badge className="bg-blue-500">Registration</Badge>;
      case 'course_view':
        return <Badge className="bg-purple-500">Course View</Badge>;
      case 'course_create':
        return <Badge className="bg-yellow-500">Course Created</Badge>;
      case 'course_update':
        return <Badge className="bg-orange-500">Course Updated</Badge>;
      case 'course_delete':
        return <Badge className="bg-red-500">Course Deleted</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-edu-blue"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if there's an error
  if (loadError) {
    return (
      <DashboardLayout>
        <div className="py-6 container mx-auto px-4">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Admin Data</h2>
            <p className="mb-4">{loadError}</p>
            <Button 
              onClick={handleRefreshData} 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <RefreshCcw size={16} className="mr-2" /> Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="container mx-auto px-4">
          {/* Admin Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your platform and view analytics</p>
            </div>
            <Button onClick={handleRefreshData} className="flex items-center gap-2" disabled={isRefreshing}>
              <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Students Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.total_users || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{dashboardData?.stats.new_users_today || 0} today
                    </p>
                  </CardContent>
                </Card>

                {/* Today's Logins Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Logins</CardTitle>
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.today_logins || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.stats.total_users 
                        ? ((dashboardData.stats.today_logins / dashboardData.stats.total_users) * 100).toFixed(1) 
                        : 0}% of users active today
                    </p>
                  </CardContent>
                </Card>

                {/* Total Courses Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.total_courses || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Across {dashboardData?.categories?.length || 0} categories
                    </p>
                  </CardContent>
                </Card>

                {/* Active Enrollments Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData?.stats.total_enrollments || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData?.stats.avg_courses_per_user || 0} courses per student
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Categories Distribution */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Most Viewed Courses */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Top Performing Courses</CardTitle>
                    <CardDescription>Courses with the highest view counts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.most_viewed_courses?.map((course, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="font-medium text-muted-foreground">{i + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium truncate">{course.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs flex items-center gap-1">
                                <Eye size={12} /> {course.viewCount}
                              </span>
                              <span className="text-xs flex items-center gap-1">
                                <GraduationCap size={12} /> {course.enrollmentCount}
                              </span>
                              <span className="text-xs flex items-center gap-1">
                                <TrendingUp size={12} /> {course.popularityScore}
                              </span>
                            </div>
                          </div>
                          <Progress value={course.popularityScore} className="w-[60px]" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Courses by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.categories?.map((category, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{category.name}</span>
                            <span className="text-sm text-muted-foreground">{category.count} courses</span>
                          </div>
                          <Progress 
                            value={(category.count / (dashboardData?.stats.total_courses || 1)) * 100} 
                            className="h-2" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="col-span-1 md:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest student activities across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData?.recent_activities?.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{activity.username || activity.email}</TableCell>
                          <TableCell>{formatActivityType(activity.action_type)}</TableCell>
                          <TableCell className="max-w-[300px] truncate">{activity.details}</TableCell>
                          <TableCell>
                            {format(parseISO(activity.created_at), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">No recent activities found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Manage and view all users on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{user.username || 'No username'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role || 'student'}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(parseISO(user.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            {user.last_login ? 
                              format(parseISO(user.last_login), 'MMM dd, yyyy HH:mm') : 
                              'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash size={16} className="text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">No users found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* User Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Registration Timeline</CardTitle>
                    <CardDescription>New user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Registration timeline chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity Metrics</CardTitle>
                    <CardDescription>Login frequency and engagement</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
                      <p>User activity metrics chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>
                      Manage all courses on the platform
                    </CardDescription>
                  </div>
                  <Button className="flex items-center gap-2">
                    <GraduationCap size={16} />
                    Add New Course
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Enrollments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium max-w-[200px] truncate">{course.title}</TableCell>
                          <TableCell>{course.author}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.category}</Badge>
                          </TableCell>
                          <TableCell>{course.price}</TableCell>
                          <TableCell>{course.viewCount}</TableCell>
                          <TableCell>{course.enrollmentCount}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit size={16} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash size={16} className="text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {courses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">No courses found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Course Performance Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Courses by category</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Category distribution chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Engagement</CardTitle>
                    <CardDescription>Views and enrollments over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ChartLine size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Course engagement metrics chart will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>
                    Configure platform-wide settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">General Settings</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <p className="font-medium">Platform Name</p>
                            <p className="text-sm text-muted-foreground">Change the name of your platform</p>
                          </div>
                          <div>
                            <Button variant="outline">Edit</Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <p className="font-medium">Platform Logo</p>
                            <p className="text-sm text-muted-foreground">Update your platform's logo</p>
                          </div>
                          <div>
                            <Button variant="outline">Upload</Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <p className="font-medium">Maintenance Mode</p>
                            <p className="text-sm text-muted-foreground">Put your platform in maintenance mode</p>
                          </div>
                          <div>
                            <Button variant="outline" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Enable</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Data Management</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <p className="font-medium">Database Backup</p>
                            <p className="text-sm text-muted-foreground">Download a backup of your database</p>
                          </div>
                          <div>
                            <Button variant="outline" className="flex items-center gap-2">
                              <Download size={16} />
                              Backup
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center border-b pb-4">
                          <div>
                            <p className="font-medium">Clear Cache</p>
                            <p className="text-sm text-muted-foreground">Clear your platform's cache</p>
                          </div>
                          <div>
                            <Button variant="outline">Clear</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
