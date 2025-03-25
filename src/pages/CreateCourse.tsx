
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ExternalLink, Plus, Trash, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import QuizBuilder from '@/components/courses/QuizBuilder';
import PracticalTaskBuilder from '@/components/courses/PracticalTaskBuilder';
import { 
  CourseCreationData, 
  CourseLesson, 
  QuizQuestion, 
  PracticalTask,
  createCourse,
  saveCourseAsDraft,
  uploadCourseMedia 
} from '@/services/courseService';

// Form schema for basic course information
const courseSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }).max(200, {
    message: "Title must not exceed 200 characters",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters",
  }),
  category: z.string().min(1, {
    message: "Please select a category",
  }),
  difficulty: z.string().min(1, {
    message: "Please select a difficulty level",
  }),
  prerequisites: z.string().optional(),
  estimatedHours: z.string().min(1, {
    message: "Please specify estimated completion hours",
  }),
  price: z.string().min(1, {
    message: "Please specify a price (or 0 for free)",
  }),
  duration: z.string().min(1, {
    message: "Please specify the course duration in days",
  }),
});

// Enhanced interface for lesson with quiz and practical task
interface EnhancedLesson extends CourseLesson {
  videoFile?: File;
  pdfFile?: File;
  externalLinks: string[];
}

const CreateCourse = () => {
  const { user, updateUserMetadata } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lessons, setLessons] = useState<EnhancedLesson[]>([]);
  
  // Check if user is a teacher
  const isTeacher = user?.role === 'teacher';

  // Check if user has enough balance for teacher registration
  const userBalance = user?.metadata?.balance || 0;
  const teacherRegistrationFee = 10000; // ₦10,000
  const hasEnoughBalance = userBalance >= teacherRegistrationFee;
  
  // Teacher application status
  const teacherApplication = user?.metadata?.teacherApplication;
  const applicationStatus = teacherApplication?.status || null;

  // Setup form for course basic info
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      difficulty: "",
      prerequisites: "",
      estimatedHours: "",
      price: "0",
      duration: "7", // Default to 7 days
    },
  });

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, or WebP image",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum image size is 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setCourseImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle next step
  const handleNextStep = async (values?: z.infer<typeof courseSchema>) => {
    if (currentStep === 1 && values) {
      // Create empty lessons based on duration
      const duration = parseInt(values.duration);
      const emptyLessons = Array.from({ length: duration }, (_, i) => ({
        title: `Day ${i + 1}`,
        content: "",
        externalLinks: [],
        quiz: [{
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          timeLimit: 60,
          reward: 100
        }],
        practicalTask: {
          description: "",
          expectedOutcome: "",
          reward: 200
        }
      }));
      setLessons(emptyLessons);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate lessons
      let isValid = true;
      lessons.forEach((lesson, index) => {
        if (!lesson.title || !lesson.content) {
          toast({
            title: "Missing lesson content",
            description: `Please complete the content for Day ${index + 1}`,
            variant: "destructive"
          });
          isValid = false;
        }
      });
      
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle lesson update
  const updateLesson = (index: number, field: keyof EnhancedLesson, value: any) => {
    const updatedLessons = [...lessons];
    updatedLessons[index] = {
      ...updatedLessons[index],
      [field]: value
    };
    setLessons(updatedLessons);
  };

  // Handle file upload for lessons
  const handleLessonFileUpload = (index: number, type: 'videoFile' | 'pdfFile', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (type === 'videoFile') {
        const validTypes = ['video/mp4', 'video/webm'];
        if (!validTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Please upload an MP4 or WebM video",
            variant: "destructive"
          });
          return;
        }
        
        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Maximum video size is 100MB",
            variant: "destructive"
          });
          return;
        }
      } else if (type === 'pdfFile') {
        if (file.type !== 'application/pdf') {
          toast({
            title: "Invalid file type",
            description: "Please upload a PDF document",
            variant: "destructive"
          });
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Maximum PDF size is 10MB",
            variant: "destructive"
          });
          return;
        }
      }
      
      updateLesson(index, type, file);
    }
  };

  // Handle external links
  const addExternalLink = (lessonIndex: number) => {
    const updatedLessons = [...lessons];
    const currentLinks = updatedLessons[lessonIndex].externalLinks || [];
    updatedLessons[lessonIndex].externalLinks = [...currentLinks, ''];
    setLessons(updatedLessons);
  };

  const updateExternalLink = (lessonIndex: number, linkIndex: number, value: string) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].externalLinks[linkIndex] = value;
    setLessons(updatedLessons);
  };

  const removeExternalLink = (lessonIndex: number, linkIndex: number) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].externalLinks.splice(linkIndex, 1);
    setLessons(updatedLessons);
  };

  // Handle quiz update
  const updateQuiz = (lessonIndex: number, questions: QuizQuestion[]) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].quiz = questions;
    setLessons(updatedLessons);
  };

  // Handle practical task update
  const updatePracticalTask = (lessonIndex: number, task: PracticalTask) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIndex].practicalTask = task;
    setLessons(updatedLessons);
  };

  // Handle teacher registration
  const handleTeacherRegistration = async () => {
    if (!hasEnoughBalance) {
      toast({
        title: "Insufficient balance",
        description: "You need ₦10,000 to register as a teacher",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (updateUserMetadata && user) {
        // Deduct the registration fee
        const newBalance = userBalance - teacherRegistrationFee;
        
        await updateUserMetadata(user.id, { 
          metadata: {
            ...user.metadata,
            balance: newBalance
          },
          role: 'teacher'
        });
        
        toast({
          title: "Registration successful",
          description: "You are now registered as a teacher!",
        });
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "There was an error processing your registration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit course
  const handleSubmitCourse = async (isDraft = false) => {
    setIsSubmitting(true);
    try {
      // Upload course image if provided
      let imageUrl = '';
      if (courseImage) {
        imageUrl = await uploadCourseMedia(courseImage, 'image');
      }
      
      // Upload lesson files and prepare lesson data
      const processedLessons = await Promise.all(lessons.map(async (lesson) => {
        // Upload video if provided
        let videoUrl = '';
        if (lesson.videoFile) {
          videoUrl = await uploadCourseMedia(lesson.videoFile, 'video');
        }
        
        // Upload PDF if provided
        let pdfUrl = '';
        if (lesson.pdfFile) {
          pdfUrl = await uploadCourseMedia(lesson.pdfFile, 'pdf');
        }
        
        // Return processed lesson without the file objects
        return {
          title: lesson.title,
          content: lesson.content,
          videoUrl,
          pdfUrl,
          externalLinks: lesson.externalLinks.filter(link => link.trim() !== ''),
          quiz: lesson.quiz,
          practicalTask: lesson.practicalTask
        };
      }));
      
      // Prepare course data
      const courseData: CourseCreationData = {
        title: form.getValues().title,
        description: form.getValues().description,
        category: form.getValues().category,
        difficulty: form.getValues().difficulty,
        imageUrl,
        prerequisites: form.getValues().prerequisites,
        estimatedHours: parseInt(form.getValues().estimatedHours),
        price: parseInt(form.getValues().price),
        duration: parseInt(form.getValues().duration),
        lessons: processedLessons,
        isDraft
      };
      
      // Submit course to API
      const response = isDraft 
        ? await saveCourseAsDraft(courseData)
        : await createCourse(courseData);
      
      toast({
        title: isDraft ? "Draft saved" : "Course created",
        description: isDraft 
          ? "Your course draft has been saved successfully!"
          : "Your course has been published successfully!",
      });
      
      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isDraft ? 'save draft' : 'create course'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different content based on teacher status
  if (!isTeacher && !applicationStatus) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Become a Teacher</CardTitle>
              <CardDescription>
                You need to be registered as a teacher to create courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Teacher Registration Required</AlertTitle>
                <AlertDescription>
                  To create courses, you need to register as a teacher first. There is a one-time fee of ₦10,000.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-md mb-6">
                <div>
                  <p className="font-semibold">Your current balance</p>
                  <p className="text-2xl font-bold">₦{userBalance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Registration fee</p>
                  <p className="text-2xl font-bold">₦{teacherRegistrationFee.toLocaleString()}</p>
                </div>
              </div>
              
              {!hasEnoughBalance && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Insufficient balance</AlertTitle>
                  <AlertDescription>
                    You need to add funds to your account before you can register as a teacher.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleTeacherRegistration} 
                disabled={!hasEnoughBalance || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Processing..." : "Register as Teacher (₦10,000)"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="w-full sm:w-auto"
              >
                Back to Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // If user has a pending application
  if (!isTeacher && applicationStatus === 'pending') {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Application Pending</CardTitle>
              <CardDescription>
                Your teacher application is currently under review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Application Status: Pending</AlertTitle>
                <AlertDescription>
                  Your application to become a teacher is currently being reviewed. 
                  You'll be notified once it's approved.
                </AlertDescription>
              </Alert>
              
              {teacherApplication && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Qualification</h3>
                    <p>{teacherApplication.qualification}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Experience</h3>
                    <p>{teacherApplication.experience}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Specialization</h3>
                    <p>{teacherApplication.specialization}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Submitted</h3>
                    <p>{teacherApplication.submittedAt ? new Date(teacherApplication.submittedAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Main course creation content for approved teachers
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create a New Course</h1>
          
          {/* Step indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
                <span className="text-sm">Basic Info</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
                <span className="text-sm">Lessons</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
                <span className="text-sm">Review</span>
              </div>
            </div>
          </div>
          
          {/* Step 1: Basic Course Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Provide the basic details about your course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleNextStep)} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4 md:col-span-2">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Introduction to JavaScript" {...field} />
                              </FormControl>
                              <FormDescription>
                                A descriptive name for your course (5-200 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe what students will learn in this course..." 
                                  className="min-h-32"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Detailed explanation of what the course covers (min 20 characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="programming">Programming</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="language">Language</SelectItem>
                                <SelectItem value="science">Science</SelectItem>
                                <SelectItem value="math">Mathematics</SelectItem>
                                <SelectItem value="health">Health</SelectItem>
                                <SelectItem value="art">Art</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                                <SelectItem value="finance">Finance</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="course-image">Course Image</Label>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="h-32 w-32 rounded-md border border-input flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Course preview" 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              id="course-image"
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleImageUpload}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Recommended: 1280x720px (16:9 ratio), JPG, PNG or WebP (max 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="prerequisites"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prerequisites (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any knowledge or skills students should have before taking the course..." 
                                  className="min-h-20"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                List any prerequisites for students taking this course
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="estimatedHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Hours to Complete</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Price (₦)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="100" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter 0 for free courses
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Duration (Days)</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" max="30" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of daily lessons (1-30)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Continue to Lessons
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Create Lessons */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Lessons</CardTitle>
                <CardDescription>
                  Create the daily lessons for your course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {lessons.map((lesson, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">Day {index + 1}</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <Label htmlFor={`lesson-title-${index}`}>Lesson Title</Label>
                          <Input
                            id={`lesson-title-${index}`}
                            value={lesson.title}
                            onChange={(e) => updateLesson(index, 'title', e.target.value)}
                            placeholder="Lesson title"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`lesson-content-${index}`}>Lesson Content</Label>
                          <Textarea
                            id={`lesson-content-${index}`}
                            value={lesson.content}
                            onChange={(e) => updateLesson(index, 'content', e.target.value)}
                            placeholder="Write your lesson content here..."
                            className="mt-1 min-h-32"
                          />
                        </div>
                        
                        {/* Video Upload */}
                        <div>
                          <Label htmlFor={`lesson-video-${index}`}>Video (Optional)</Label>
                          <Input
                            id={`lesson-video-${index}`}
                            type="file"
                            accept="video/mp4,video/webm"
                            className="mt-1"
                            onChange={(e) => handleLessonFileUpload(index, 'videoFile', e)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Max size: 100MB (.mp4, .webm)
                          </p>
                        </div>
                        
                        {/* PDF Materials */}
                        <div>
                          <Label htmlFor={`lesson-pdf-${index}`}>PDF Materials (Optional)</Label>
                          <Input
                            id={`lesson-pdf-${index}`}
                            type="file"
                            accept=".pdf"
                            className="mt-1"
                            onChange={(e) => handleLessonFileUpload(index, 'pdfFile', e)}
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Max size: 10MB (.pdf)
                          </p>
                        </div>
                        
                        {/* External Links */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>External Links (Optional)</Label>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addExternalLink(index)}
                              className="flex items-center gap-1 text-xs"
                            >
                              <Plus className="h-3 w-3" />
                              Add Link
                            </Button>
                          </div>
                          
                          {lesson.externalLinks && lesson.externalLinks.length > 0 ? (
                            <div className="space-y-2">
                              {lesson.externalLinks.map((link, linkIndex) => (
                                <div key={linkIndex} className="flex items-center gap-2">
                                  <Input
                                    value={link}
                                    onChange={(e) => updateExternalLink(index, linkIndex, e.target.value)}
                                    placeholder="https://example.com/resource"
                                    className="flex-1"
                                  />
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeExternalLink(index, linkIndex)}
                                    className="h-8 w-8"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-20 border border-dashed rounded-md">
                              <div className="text-center text-muted-foreground">
                                <ExternalLink className="h-8 w-8 mx-auto mb-2" />
                                <p>No external links added</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Quiz Builder */}
                        <div className="mt-6">
                          <h4 className="text-base font-medium mb-2">Quiz</h4>
                          <QuizBuilder 
                            value={lesson.quiz || []} 
                            onChange={(questions) => updateQuiz(index, questions)} 
                          />
                        </div>
                        
                        {/* Practical Task */}
                        <div className="mt-6">
                          <h4 className="text-base font-medium mb-2">Practical Task</h4>
                          <PracticalTaskBuilder 
                            value={lesson.practicalTask || { description: '', expectedOutcome: '', reward: 200 }} 
                            onChange={(task) => updatePracticalTask(index, task)} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <Button onClick={() => handleNextStep()}>
                  Continue to Review
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Step 3: Review and Submit */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Course</CardTitle>
                <CardDescription>
                  Review all details before publishing your course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">Course Details</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Title</p>
                        <p>{form.getValues().title}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p className="capitalize">{form.getValues().category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                        <p className="capitalize">{form.getValues().difficulty}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Price</p>
                        <p>₦{parseInt(form.getValues().price).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p>{form.getValues().duration} days</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Estimated Hours</p>
                        <p>{form.getValues().estimatedHours} hours</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="mt-2">{form.getValues().description}</p>
                  </div>
                  
                  {form.getValues().prerequisites && (
                    <div>
                      <h3 className="text-lg font-semibold">Prerequisites</h3>
                      <p className="mt-2">{form.getValues().prerequisites}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg font-semibold">Course Image</h3>
                    {imagePreview ? (
                      <div className="mt-2 h-40 w-64 rounded-md overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Course preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 italic text-muted-foreground">No image uploaded</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Lessons Overview</h3>
                    <div className="mt-2 space-y-4">
                      {lessons.map((lesson, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Day {index + 1}: {lesson.title}</p>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {lesson.content.substring(0, 100)}
                                {lesson.content.length > 100 ? '...' : ''}
                              </p>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {lesson.videoFile && <p>Video: ✓</p>}
                              {lesson.pdfFile && <p>PDF: ✓</p>}
                              {lesson.externalLinks?.filter(Boolean).length > 0 && (
                                <p>Links: {lesson.externalLinks.filter(Boolean).length}</p>
                              )}
                              {lesson.quiz && lesson.quiz.length > 0 && (
                                <p>Quiz: {lesson.quiz.filter(q => q.question).length} questions</p>
                              )}
                              {lesson.practicalTask?.description && <p>Task: ✓</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Back
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSubmitCourse(true)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button 
                    onClick={() => handleSubmitCourse(false)} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Publishing..." : "Publish Course"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCourse;
