
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Wallet, GraduationCap, PlusCircle, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import TeacherCoursesList from '@/components/dashboard/TeacherCoursesList';

// Form schema for becoming a teacher
const teacherFormSchema = z.object({
  qualification: z.string().min(1, {
    message: "Qualification is required",
  }),
  experience: z.string().min(1, {
    message: "Experience is required",
  }),
  specialization: z.string().min(1, {
    message: "Area of specialization is required",
  }),
});

const Profile = () => {
  const { user, refreshUserData, isTeacher } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  
  // Use the API hook for teacher application
  const { fetchData: submitTeacherApplication } = useApi(
    `/auth/users/${user?.id}/apply-teacher`, 
    'post', 
    undefined,
    false
  );
  
  // Get user's name or fallback
  const userName = user?.username || 'User';
  
  // User's balance (default to 0 if not set)
  const userBalance = user?.metadata?.balance || 0;
  
  // Remove this duplicate declaration since we're now getting isTeacher from useAuth()
  // const isTeacher = user?.role === 'teacher';

  // Setup form
  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      qualification: "",
      experience: "",
      specialization: "",
    },
  });

  // Calculate initials for avatar fallback
  const getInitials = () => {
    if (userName) {
      return userName.substring(0, 2).toUpperCase();
    }
    return "US";
  };

  // Handle teacher application submission
  const onSubmitTeacherApplication = async (values: z.infer<typeof teacherFormSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to apply as a teacher.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const applicationData = {
        teacherApplication: {
          qualification: values.qualification,
          experience: values.experience,
          specialization: values.specialization,
          status: 'approved', // Set to approved since we're immediately making them a teacher
          submittedAt: new Date().toISOString()
        }
      };

      console.log("Submitting application data:", applicationData);
      
      // Use the API hook to submit the application
      const { error, data } = await submitTeacherApplication(applicationData);
      
      if (error) {
        throw new Error(error);
      }
      
      // Refresh user data to get updated role
      await refreshUserData();
      
      toast({
        title: "Application approved",
        description: "You are now a teacher! You can create and manage courses.",
        variant: "default",
      });
      
      setShowTeacherForm(false);
    } catch (error: any) {
      console.error("Teacher application error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get teacher application status if available
  const teacherApplication = user?.metadata?.teacherApplication;
  const applicationStatus = teacherApplication?.status || null;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        {isTeacher ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Teacher Dashboard</h2>
            <TeacherCoursesList />
          </div>
        ) : null}
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* User Information Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="text-lg bg-edu-blue text-white">{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userName}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="font-medium">Role:</div>
                  <div className="ml-2 flex items-center">
                    {isTeacher ? (
                      <>
                        <span className="text-green-600 font-medium">Teacher</span>
                        <Check className="h-4 w-4 text-green-600 ml-1" />
                      </>
                    ) : (
                      'Student'
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">Member since:</div>
                  <div className="ml-2">{new Date(user?.created_at || Date.now()).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-edu-blue" />
                  <div className="font-medium">Balance:</div>
                  <div className="ml-2">₦{userBalance.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teacher Application or Status */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-edu-blue" />
                {isTeacher ? 'Teacher Status' : 'Become a Teacher'}
              </CardTitle>
              <CardDescription>
                {isTeacher 
                  ? 'You are currently registered as a teacher on our platform.' 
                  : 'Share your knowledge and earn by becoming a teacher on our platform.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTeacher ? (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-md p-4">
                    <p className="font-medium">You are now a teacher!</p>
                    <p className="mt-2">You can create courses and earn by sharing your knowledge.</p>
                  </div>
                  <Link to="/create-course">
                    <Button className="mt-4 bg-edu-blue w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create a New Course
                    </Button>
                  </Link>
                </div>
              ) : showTeacherForm ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitTeacherApplication)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Qualification</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Bachelor's Degree in Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 5 years in web development" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area of Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Web Development, Machine Learning" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex gap-4">
                      <Button type="submit" disabled={isSubmitting} className="bg-edu-blue">
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowTeacherForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <p>
                    As a teacher, you can create and sell courses on our platform, reaching students 
                    worldwide and earning money from your expertise.
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Create engaging courses in your area of expertise</li>
                    <li>Set your own prices and earn up to 70% of sales</li>
                    <li>Access teaching tools and analytics</li>
                    <li>Join a community of educators</li>
                  </ul>
                  <Button onClick={() => setShowTeacherForm(true)} className="bg-edu-blue mt-4">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Apply to Become a Teacher
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Courses Progress (Placeholder) */}
          {!isTeacher && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Your Learning Progress</CardTitle>
                <CardDescription>Track your learning journey and course progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-10 text-center text-muted-foreground">
                  <p>You haven't enrolled in any courses yet.</p>
                  <Button variant="outline" className="mt-4">Browse Courses</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
