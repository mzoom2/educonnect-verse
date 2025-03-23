
import React from 'react';
import { Clock, User, Star, BookOpen } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

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
