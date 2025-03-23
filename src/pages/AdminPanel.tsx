
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { localAuth, User } from '@/lib/localAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isToday } from 'date-fns';
import { 
  Users, LogIn, GraduationCap, BookOpen, ChartLine, 
  CalendarDays, Clock, Settings, Filter 
} from 'lucide-react';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayLogins, setTodayLogins] = useState(0);
  const [newUsersToday, setNewUsersToday] = useState(0);

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

  useEffect(() => {
    const fetchData = () => {
      try {
        // Get all users
        const allUsers = localAuth.getAllUsers();
        setUsers(allUsers);
        setTotalUsers(allUsers.length);
        
        // Calculate today's logins
        const todayLoginCount = allUsers.filter(user => 
          user.user_metadata.last_login && 
          isToday(parseISO(user.user_metadata.last_login))
        ).length;
        setTodayLogins(todayLoginCount);
        
        // Calculate new users today
        const todayNewUsers = allUsers.filter(user => 
          isToday(parseISO(user.created_at))
        ).length;
        setNewUsersToday(todayNewUsers);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load admin dashboard data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh data every minute
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
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
          {/* Admin Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform and view analytics</p>
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
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      +{newUsersToday} today
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
                    <div className="text-2xl font-bold">{todayLogins}</div>
                    <p className="text-xs text-muted-foreground">
                      {(todayLogins / totalUsers * 100).toFixed(1)}% of users active today
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
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      Across 8 categories
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
                    <div className="text-2xl font-bold">56</div>
                    <p className="text-xs text-muted-foreground">
                      2.3 courses per student
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="col-span-4">
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
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(user => user.user_metadata.last_login)
                        .sort((a, b) => {
                          const dateA = a.user_metadata.last_login ? new Date(a.user_metadata.last_login).getTime() : 0;
                          const dateB = b.user_metadata.last_login ? new Date(b.user_metadata.last_login).getTime() : 0;
                          return dateB - dateA;
                        })
                        .slice(0, 5)
                        .map((user, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{user.user_metadata.username}</TableCell>
                            <TableCell>Logged in</TableCell>
                            <TableCell>
                              {user.user_metadata.last_login ? 
                                format(new Date(user.user_metadata.last_login), 'MMM dd, yyyy HH:mm') : 
                                'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{user.user_metadata.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.user_metadata.role || 'student'}</TableCell>
                          <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            {user.user_metadata.last_login ? 
                              format(new Date(user.user_metadata.last_login), 'MMM dd, yyyy HH:mm') : 
                              'Never'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>
                    Manage all courses on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">Course Data</h3>
                    <p className="text-muted-foreground">
                      This is a mockup. In a real app, this would display actual course data.
                    </p>
                  </div>
                </CardContent>
              </Card>
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
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">Settings Panel</h3>
                    <p className="text-muted-foreground">
                      This is a mockup. In a real app, this would display actual settings.
                    </p>
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
