
import React from 'react';
import { Clock, User, Star } from 'lucide-react';

interface CourseCardProps {
  image: string;
  title: string;
  author: string;
  rating: number;
  duration: string;
  price: string;
  category: string;
}

const CourseCard = ({ 
  image, 
  title, 
  author, 
  rating, 
  duration, 
  price, 
  category 
}: CourseCardProps) => {
  return (
    <div className="course-card group">
      <div className="relative">
        <img 
          src={image} 
          alt={title} 
          className="course-card-image group-hover:scale-[1.03]"
          loading="lazy" 
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-2">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 transition-colors group-hover:text-edu-blue">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <User size={14} className="mr-1" />
          <span className="mr-4">{author}</span>
          <Star size={14} className="mr-1 text-edu-yellow" />
          <span>{rating.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock size={14} className="mr-1" />
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

export default CourseCard;
