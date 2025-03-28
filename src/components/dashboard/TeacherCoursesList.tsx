
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, Edit, BarChart, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useTeacherCourses } from '@/hooks/useApi';

interface TeacherCourse {
  id: string;
  title: string;
  enrollmentCount: number;
  price: string;
  createdAt: string;
  lastUpdated: string;
  category: string;
  status: 'published' | 'draft';
  averageRating?: number;
}

const TeacherCoursesList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof TeacherCourse>('enrollmentCount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { data, isLoading, error, refetch: refreshCourses } = useTeacherCourses();
  
  // Ensure data is always treated as an array even if API returns null/undefined
  const teacherCourses = data || [];
  
  // Log API connection issues for debugging
  useEffect(() => {
    if (error) {
      console.log('Teacher courses API error:', error);
    }
  }, [error]);

  const handleSort = (field: keyof TeacherCourse) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Check if the error is likely due to network or server issue
  const isNetworkOrServerError = error?.includes('timeout') || 
                                error?.includes('network') ||
                                error?.includes('Server error') ||
                                error?.includes('Unable to connect') ||
                                error?.includes('not available');
  
  // Check if the error is likely due to permissions
  const isPermissionError = error?.includes('permission') || 
                           error?.includes('not have access') ||
                           error?.includes('401') || 
                           error?.includes('403');
  
  // Check if the error is likely due to missing implementation
  const isMissingImplementationError = error?.includes('not found') ||
                                      error?.includes('endpoint not found') ||
                                      error?.includes('not implemented');
  
  // If there's an error, show error message with appropriate guidance
  if (error && !isLoading) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error Loading Courses</CardTitle>
          <CardDescription>
            {isNetworkOrServerError
              ? 'Unable to connect to the backend server. Please verify the server is running.'
              : isMissingImplementationError
              ? 'The backend endpoint for teacher courses appears to be missing or not implemented.'
              : 'There was a problem loading your courses. Please try again later.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          {isNetworkOrServerError ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Please check if the backend server is running correctly. The application is trying to connect to: 
                <code className="bg-slate-100 px-1 py-0.5 rounded mx-1">
                  {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
                </code>
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refreshCourses()} variant="outline">
                  Check Connection Again
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="bg-edu-blue">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : isPermissionError ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                It appears you might not have teacher permissions. 
                Please check your account status in your profile page.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refreshCourses()} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => navigate('/profile')} className="bg-edu-blue">
                  Go to Profile
                </Button>
              </div>
            </div>
          ) : isMissingImplementationError ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                The teacher courses feature might not be fully implemented in the backend yet.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => refreshCourses()} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => navigate('/dashboard')} className="bg-edu-blue">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Button onClick={() => refreshCourses()} variant="outline" className="mr-2">
                Try Again
              </Button>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Sort the courses based on current sort settings
  const sortedCourses = [...teacherCourses].sort((a, b) => {
    if (sortField === 'enrollmentCount' || sortField === 'averageRating') {
      return sortDirection === 'asc' 
        ? (a[sortField] || 0) - (b[sortField] || 0)
        : (b[sortField] || 0) - (a[sortField] || 0);
    }
    
    // String comparison for other fields
    const aValue = String(a[sortField] || '');
    const bValue = String(b[sortField] || '');
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Calculate statistics from real data
  const totalEnrollments = teacherCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
  const publishedCourses = teacherCourses.filter(course => course.status === 'published').length;
  const draftCourses = teacherCourses.filter(course => course.status === 'draft').length;
  const ratedCourses = teacherCourses.filter(course => course.averageRating !== undefined);
  const averageRating = ratedCourses.length > 0 
    ? ratedCourses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / ratedCourses.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">Students across all courses</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{publishedCourses}</div>
                <p className="text-xs text-muted-foreground">{draftCourses} drafts</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Across all published courses</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Manage your courses and view enrollment statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between">
            <Button 
              onClick={() => refreshCourses()} 
              variant="outline" 
              disabled={isLoading}
              className="mr-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>Refresh</>
              )}
            </Button>
            <Button onClick={() => navigate('/create-course')} className="bg-edu-blue">
              Create New Course
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </div>
          ) : teacherCourses.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/20">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">Create your first course to start teaching.</p>
              <Button onClick={() => navigate('/create-course')} className="bg-edu-blue">
                Create Your First Course
              </Button>
            </div>
          ) : (
            <Table>
              <TableCaption>A list of your courses and their details.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort('title')}>
                    Course Title
                    {sortField === 'title' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('enrollmentCount')}>
                    Enrollments
                    {sortField === 'enrollmentCount' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('price')}>
                    Price
                    {sortField === 'price' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('lastUpdated')}>
                    Last Updated
                    {sortField === 'lastUpdated' && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
                  </TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCourses.map((course) => (
                  <TableRow key={course.id || `course-${Math.random()}`}>
                    <TableCell className="font-medium">{course.title || 'Untitled Course'}</TableCell>
                    <TableCell>{course.enrollmentCount || 0}</TableCell>
                    <TableCell className="text-right">{course.price || 'Free'}</TableCell>
                    <TableCell className="text-right">{course.lastUpdated || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        className={course.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                        }
                      >
                        {course.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/edit-course/${course.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherCoursesList;
