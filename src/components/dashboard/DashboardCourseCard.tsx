
import React from 'react';
import { Clock, User, Star, BookOpen, ImageIcon } from 'lucide-react';

interface CourseCardProps {
  id: string;
  image: string;
  title: string;
  author: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
}

const DashboardCourseCard = ({ 
  id, 
  image, 
  title, 
  author, 
  rating, 
  duration, 
  price, 
  category 
}: CourseCardProps) => {
  // Default image if image path is missing or invalid
  const defaultImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
  
  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`Image failed to load: ${image}`);
    e.currentTarget.src = defaultImage;
  };

  return (
    <div className="overflow-hidden border border-border/40 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group h-full bg-card">
      <div className="relative aspect-video overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy" 
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-edu-blue shadow-sm">
            {category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4">
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
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={14} className="mr-1 text-edu-purple/70" />
            <span>{duration}</span>
          </div>
          
          <div className="font-semibold text-edu-blue">
            {price}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCourseCard;
