
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCourse } from '@/services/courseService';
import { Upload, BookOpen, FileUp } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { supabase } from '@/lib/supabase';

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    price: '',
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { createCourse, isLoading } = useCreateCourse();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setCourseData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  
  const uploadToSupabase = async (file: File, folder: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('course-resources')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-resources')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(error.message || 'Error uploading file');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a course",
          variant: "destructive",
        });
        return;
      }
      
      if (user.role !== 'teacher') {
        toast({
          title: "Permission Error",
          description: "Only teachers can create courses",
          variant: "destructive",
        });
        return;
      }
      
      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.category) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      
      // Upload resource file if selected
      let resourceUrl = '';
      if (uploadedFile) {
        resourceUrl = await uploadToSupabase(uploadedFile, 'resources');
      }
      
      // Upload image file if selected
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadToSupabase(imageFile, 'images');
      } else {
        // Default image if none provided
        imageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
      }
      
      // Prepare course data for API
      const newCourseData = {
        title: courseData.title,
        description: courseData.description,
        author: user.username || user.email,
        category: courseData.category,
        duration: courseData.duration || '4 weeks', // Default value
        price: courseData.price || 'Free', // Default value
        image: imageUrl,
        resourceUrl: resourceUrl,
      };
      
      // Create the course using the API
      const result = await createCourse(newCourseData);
      
      if (result && result.data) {
        toast({
          title: "Course Created",
          description: "Your course has been created successfully!",
        });
        
        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      
      toast({
        title: "Creation Failed",
        description: error.message || "There was an error creating your course",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Check if user is a teacher, if not redirect
  if (user && user.role !== 'teacher') {
    navigate('/dashboard');
    return null;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <p className="text-muted-foreground">Share your knowledge with the world</p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Fill in the details for your new course</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="required">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={courseData.title}
                  onChange={handleChange}
                  placeholder="Enter course title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="required">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={courseData.description}
                  onChange={handleChange}
                  placeholder="Provide a description of your course"
                  rows={5}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="required">Category</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('category', value)}
                    value={courseData.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programming">Programming</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 4 weeks"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    value={courseData.price}
                    onChange={handleChange}
                    placeholder="e.g. ₦15,000 or Free"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Course Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="flex-1"
                    />
                    {imageFile && (
                      <div className="text-sm text-green-600">
                        ✓ Image selected
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Upload a cover image for your course</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="resource">Course Resource</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resource"
                    type="file"
                    onChange={handleResourceFileChange}
                    className="flex-1"
                  />
                  {uploadedFile && (
                    <div className="text-sm text-green-600">
                      ✓ {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload materials for your course (PDF, ZIP, etc.)</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || isUploading}
                className="flex items-center"
              >
                {isLoading || isUploading ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Course
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateCourse;
