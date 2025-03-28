
import React, { useState } from 'react';
import { Clock, User, Star, BookOpen, FileText, Award, BarChart3, ImageIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CourseResource } from '@/services/courseService';
import { useToast } from '@/hooks/use-toast';

interface CourseCardProps {
  id?: string;
  image: string;
  title: string;
  author: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
  resources?: CourseResource[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  progress?: number;
  lessonCount?: number;
  enrollmentStatus?: 'not-enrolled' | 'enrolled' | 'completed';
}

const CourseCard = ({ 
  id,
  image, 
  title, 
  author, 
  rating, 
  duration, 
  price, 
  category,
  resources,
  difficulty = 'Beginner',
  progress = 0,
  lessonCount = 0,
  enrollmentStatus = 'not-enrolled'
}: CourseCardProps) => {
  const { toast } = useToast();
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

  // Get action button text based on enrollment status
  const getActionButtonText = () => {
    switch(enrollmentStatus) {
      case 'enrolled': return 'Continue Learning';
      case 'completed': return 'View Certificate';
      default: return 'Enroll Now';
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

  return (
    <Card 
      className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group h-full relative"
      data-course-id={id}
      data-enrollment-status={enrollmentStatus}
      data-difficulty-level={difficulty}
      data-category-id={category}
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
              <Award className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {enrollmentStatus !== 'not-enrolled' && (
        <div className="px-5 -mt-1 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{Math.round(progress)}% complete</span>
            {progress === 100 && <Award size={12} className="text-green-500" />}
          </div>
          <Progress 
            value={progress} 
            className="h-1.5" 
            // Dynamic color based on progress
            style={{ 
              background: '#f1f1f1',
              '--tw-progress-fill': progress < 30 ? '#f87171' : progress < 70 ? '#facc15' : '#4ade80'
            } as React.CSSProperties}
          />
        </div>
      )}
      
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 transition-colors group-hover:text-edu-blue">
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
        
        {resources && resources.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 mt-2 mb-3">
            <TooltipProvider>
              {resources.slice(0, 3).map((resource, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center bg-secondary/50 text-xs rounded-md px-2 py-1">
                      <FileText size={12} className="mr-1 text-edu-purple" />
                      {resource.name.length > 10 ? resource.name.substring(0, 10) + '...' : resource.name}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{resource.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {resources.length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center bg-secondary/50 text-xs rounded-md px-2 py-1">
                      +{resources.length - 3} more
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      <p className="mb-1 font-medium">Additional resources:</p>
                      <ul className="text-xs">
                        {resources.slice(3).map((resource, idx) => (
                          <li key={idx}>{resource.name}</li>
                        ))}
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
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
          >
            {getActionButtonText()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
