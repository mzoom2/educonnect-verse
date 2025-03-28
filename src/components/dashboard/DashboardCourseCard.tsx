import React, { useState } from 'react';
import { Clock, User, Star, BookOpen, ImageIcon, AlertCircle, Award, Play, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  id: string;
  image: string;
  title: string;
  author: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  lessonCount?: number;
  enrollmentStatus?: 'not-enrolled' | 'enrolled' | 'completed';
  lastAccessed?: string;
}

const DashboardCourseCard = ({ 
  id, 
  image, 
  title, 
  author, 
  rating, 
  duration, 
  price, 
  category,
  difficulty = 'Beginner',
  progress = 0,
  lessonCount = 0,
  enrollmentStatus = 'not-enrolled',
  lastAccessed
}: CourseCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  // Track if image failed to load
  const [imageError, setImageError] = useState(false);
  // Default image if image path is missing or invalid
  const defaultImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
  
  // Enhanced image error handling with detailed logging
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Log detailed information about the image that failed to load
    console.log(`Image failed to load: ${image}`);
    console.log(`Course ID: ${id} | Course Title: ${title}`);
    
    // Only show toast and log error on first failure
    if (!imageError) {
      console.error(`Image URL structure incorrect or resource missing for course "${title}" (ID: ${id})`);
      
      // Show detailed toast with more actionable information
      toast({
        title: "Image failed to load",
        description: `Failed to load image for "${title}". Using default image instead.`,
        variant: "destructive",
      });
    }
    
    setImageError(true);
    e.currentTarget.src = defaultImage;
  };

  // Get the appropriate color for the difficulty badge
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle enrollment action based on current status
  const handleEnrollmentAction = () => {
    if (enrollmentStatus === 'not-enrolled') {
      // For demo purposes, we'll simulate enrollment
      setEnrolling(true);
      
      // Simulate backend call for enrollment
      setTimeout(() => {
        setEnrolling(false);
        
        if (price === "Free" || price === "₦0") {
          // Free course enrollment
          toast({
            title: "Enrollment Successful",
            description: `You've been enrolled in "${title}". Start learning now!`,
            variant: "default",
          });
          navigate(`/courses/${id}/learn`);
        } else {
          // Paid course - redirect to payment
          navigate(`/courses/${id}/payment`);
        }
      }, 1000);
    } else if (enrollmentStatus === 'enrolled') {
      // Continue learning - navigate to course learning page
      navigate(`/courses/${id}/learn`);
    } else if (enrollmentStatus === 'completed') {
      // View certificate
      navigate(`/courses/${id}/certificate`);
    }
  };

  // Card click handler - navigate to details or learning page
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger if clicking on the CTA button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (enrollmentStatus === 'not-enrolled') {
      navigate(`/courses/${id}`);
    } else {
      navigate(`/courses/${id}/learn`);
    }
  };

  // Get action button text based on enrollment status
  const getActionButtonText = () => {
    if (enrolling) return "Processing...";
    
    switch(enrollmentStatus) {
      case 'enrolled': return 'Continue Learning';
      case 'completed': return 'View Certificate';
      default: return price === "Free" || price === "₦0" ? "Enroll Now - FREE" : `Enroll Now - ${price}`;
    }
  };

  // Get action button variant based on enrollment status
  const getActionButtonVariant = () => {
    switch(enrollmentStatus) {
      case 'enrolled': return 'secondary';
      case 'completed': return 'outline';
      default: return 'edu';
    }
  };

  // Get the appropriate icon for the action button
  const getActionButtonIcon = () => {
    if (enrolling) return null;
    
    switch(enrollmentStatus) {
      case 'enrolled': return <Play size={16} />;
      case 'completed': return <Award size={16} />;
      default: return null;
    }
  };

  return (
    <Card 
      className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group h-full relative cursor-pointer"
      data-course-id={id}
      data-enrollment-status={enrollmentStatus}
      data-difficulty-level={difficulty}
      data-category-id={category}
      onClick={handleCardClick}
    >
      <div className="relative aspect-video overflow-hidden">
        {image && !imageError ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy" 
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            {imageError && (
              <div className="text-xs text-muted-foreground px-4 text-center">
                <span className="flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Image failed to load
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 text-edu-blue shadow-sm">
            {category}
          </Badge>
          
          <Badge className={`${getDifficultyColor()} backdrop-blur-sm text-xs font-medium px-2.5 py-1 shadow-sm`}>
            {difficulty}
          </Badge>
        </div>

        {enrollmentStatus === 'completed' && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-green-500 text-white text-xs font-medium px-2.5 py-1 shadow-sm flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {enrollmentStatus !== 'not-enrolled' && (
        <div className="px-4 -mt-1 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{Math.round(progress)}% complete</span>
            {progress === 100 && <Award size={12} className="text-green-500" />}
            
            {lastAccessed && enrollmentStatus === 'enrolled' && (
              <span className="text-xs text-muted-foreground">
                Last accessed: {lastAccessed}
              </span>
            )}
          </div>
          <Progress 
            value={progress} 
            className="h-1.5" 
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-2 line-clamp-2 transition-colors group-hover:text-edu-blue">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <User size={14} className="mr-1 text-edu-blue/70" />
            <span className="mr-4">{author}</span>
          </div>
          <div className="flex items-center">
            <Star size={14} className="mr-1 text-edu-yellow" fill="#FFCC00" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground gap-3 mb-3">
          {lessonCount > 0 && (
            <div className="flex items-center">
              <BookOpen size={12} className="mr-1 text-edu-blue/70" />
              <span>{lessonCount} lessons</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock size={12} className="mr-1 text-edu-purple/70" />
            <span>{duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
          <div className="font-semibold text-edu-blue">
            {price === "Free" || price === "₦0" ? (
              <span className="text-green-600">FREE</span>
            ) : (
              price
            )}
          </div>
          
          <Button 
            variant={getActionButtonVariant() as any} 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleEnrollmentAction();
            }}
            disabled={enrolling}
          >
            {getActionButtonIcon()}
            {getActionButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCourseCard;
