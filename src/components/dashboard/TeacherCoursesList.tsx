
import React, { useState } from 'react';
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
import { BookOpen, Users, Calendar, Edit, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  // We'll use a mock data for now, in a real app this would come from the API
  const mockTeacherCourses: TeacherCourse[] = [
    {
      id: '1',
      title: 'Introduction to Web Development',
      enrollmentCount: 156,
      price: '₦15,000',
      createdAt: '2023-06-15',
      lastUpdated: '2023-08-20',
      category: 'Programming',
      status: 'published',
      averageRating: 4.7
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      enrollmentCount: 89,
      price: '₦25,000',
      createdAt: '2023-09-10',
      lastUpdated: '2023-10-05',
      category: 'Programming',
      status: 'published',
      averageRating: 4.9
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      enrollmentCount: 212,
      price: '₦18,000',
      createdAt: '2023-04-22',
      lastUpdated: '2023-07-15',
      category: 'Design',
      status: 'published',
      averageRating: 4.5
    },
    {
      id: '4',
      title: 'Mobile App Development with Flutter',
      enrollmentCount: 0,
      price: '₦30,000',
      createdAt: '2023-11-01',
      lastUpdated: '2023-11-01',
      category: 'Programming',
      status: 'draft',
      averageRating: 0
    },
  ];

  // In a real app, this would be:
  // const { data: teacherCourses, isLoading, error } = useApi('/courses/teacher', 'get');

  const handleSort = (field: keyof TeacherCourse) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedCourses = [...mockTeacherCourses].sort((a, b) => {
    if (sortField === 'enrollmentCount' || sortField === 'averageRating') {
      return sortDirection === 'asc' 
        ? (a[sortField] || 0) - (b[sortField] || 0)
        : (b[sortField] || 0) - (a[sortField] || 0);
    }
    
    // String comparison for other fields
    const aValue = String(a[sortField]);
    const bValue = String(b[sortField]);
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Calculate statistics
  const totalEnrollments = mockTeacherCourses.reduce((sum, course) => sum + course.enrollmentCount, 0);
  const publishedCourses = mockTeacherCourses.filter(course => course.status === 'published').length;
  const draftCourses = mockTeacherCourses.filter(course => course.status === 'draft').length;
  const averageRating = mockTeacherCourses
    .filter(course => course.averageRating)
    .reduce((sum, course) => sum + (course.averageRating || 0), 0) / 
    mockTeacherCourses.filter(course => course.averageRating).length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Students across all courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCourses}</div>
            <p className="text-xs text-muted-foreground">{draftCourses} drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Across all published courses</p>
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
          <div className="mb-4 flex justify-end">
            <Button onClick={() => navigate('/create-course')} className="bg-edu-blue">
              Create New Course
            </Button>
          </div>
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
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.enrollmentCount}</TableCell>
                  <TableCell className="text-right">{course.price}</TableCell>
                  <TableCell className="text-right">{course.lastUpdated}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherCoursesList;
