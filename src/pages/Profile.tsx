
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { User, Send, BookOpen, GraduationCap } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [teacherFormData, setTeacherFormData] = useState({
    fullName: '',
    expertise: '',
    experience: '',
    education: '',
    socialLinks: '',
    motivation: '',
  });
  
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setBio(user.metadata?.bio || '');
      
      // Pre-fill teacher application form from any saved data
      if (user.metadata?.teacherApplication) {
        setTeacherFormData({
          fullName: user.metadata.teacherApplication.fullName || '',
          expertise: user.metadata.teacherApplication.expertise || '',
          experience: user.metadata.teacherApplication.experience || '',
          education: user.metadata.teacherApplication.education || '',
          socialLinks: user.metadata.teacherApplication.socialLinks || '',
          motivation: user.metadata.teacherApplication.motivation || '',
        });
      }
    }
  }, [user]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      await updateUser({
        ...user,
        username,
        metadata: {
          ...user.metadata,
          bio,
        },
      });
      
      setProfileSaved(true);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
      
      setTimeout(() => {
        setProfileSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
  };
  
  const handleTeacherFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeacherFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const { fetchData: applyAsTeacher, isLoading } = useApi(`/auth/users/${user?.id}/apply-teacher`, 'post', undefined, false);
  
  const handleTeacherApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      const { data, error } = await applyAsTeacher({
        teacherApplication: teacherFormData,
      });
      
      if (error) {
        throw new Error(error);
      }
      
      toast({
        title: "Application Submitted",
        description: "Your teacher application has been submitted successfully!",
      });
      
      // Update the local user data if the role was changed
      if (data?.user) {
        updateUser(data.user);
      }
      
      // Redirect to dashboard after successful application
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting teacher application:', error);
      
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application.",
        variant: "destructive",
      });
    }
  };

  // Check if user is already a teacher
  const isTeacher = user?.role === 'teacher';
  // Check if user has a pending teacher application
  const hasPendingApplication = user?.metadata?.teacherApplication && !isTeacher;
  
  if (authLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your profile settings and preferences</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
        >
          Return to Dashboard
        </Button>
      </div>
      
      <Tabs 
        defaultValue="profile" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="teacher" className="flex items-center gap-2">
            <GraduationCap size={16} />
            <span>Teacher Status</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user.email} 
                    disabled 
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself"
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  {profileSaved ? "Profile saved!" : ""}
                </p>
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="teacher" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Status</CardTitle>
              <CardDescription>
                {isTeacher 
                  ? "You are a certified teacher on our platform" 
                  : hasPendingApplication 
                    ? "Your application is under review" 
                    : "Apply to become a teacher"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTeacher ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-md">
                    <h3 className="font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Certified Teacher
                    </h3>
                    <p className="mt-2">You are now a certified teacher on our platform and have access to all teacher features.</p>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/create-course')}
                    className="w-full sm:w-auto"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create a New Course
                  </Button>
                </div>
              ) : hasPendingApplication ? (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 p-4 rounded-md">
                  <h3 className="font-semibold">Application Under Review</h3>
                  <p className="mt-2">Your application to become a teacher is currently under review. We'll notify you once it's approved.</p>
                </div>
              ) : (
                <form onSubmit={handleTeacherApplication} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      name="fullName"
                      value={teacherFormData.fullName} 
                      onChange={handleTeacherFieldChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="expertise">Area of Expertise</Label>
                    <Input 
                      id="expertise" 
                      name="expertise"
                      value={teacherFormData.expertise} 
                      onChange={handleTeacherFieldChange}
                      placeholder="What subjects do you specialize in?"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="experience">Teaching Experience</Label>
                    <Textarea 
                      id="experience" 
                      name="experience"
                      value={teacherFormData.experience} 
                      onChange={handleTeacherFieldChange}
                      placeholder="Describe your teaching experience"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="education">Education</Label>
                    <Textarea 
                      id="education" 
                      name="education"
                      value={teacherFormData.education} 
                      onChange={handleTeacherFieldChange}
                      placeholder="Your educational background"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="socialLinks">Social Links (Optional)</Label>
                    <Input 
                      id="socialLinks" 
                      name="socialLinks"
                      value={teacherFormData.socialLinks} 
                      onChange={handleTeacherFieldChange}
                      placeholder="LinkedIn, personal website, etc."
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="motivation">Why do you want to teach?</Label>
                    <Textarea 
                      id="motivation" 
                      name="motivation"
                      value={teacherFormData.motivation} 
                      onChange={handleTeacherFieldChange}
                      placeholder="Tell us why you want to become a teacher on our platform"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
