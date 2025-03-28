
import React from 'react';
import { Clock, User, Star, BookOpen, FileText } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CourseResource } from '@/services/courseService';

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
  resources
}: CourseCardProps) => {
  return (
    <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group h-full">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy" 
        />
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-edu-blue shadow-sm">
            {category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
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
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={14} className="mr-1 text-edu-purple/70" />
            <span>{duration}</span>
          </div>
          
          <div className="font-semibold text-edu-blue">
            {price}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
