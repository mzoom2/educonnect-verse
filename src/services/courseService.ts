import { Course } from '@/components/dashboard/CourseCarousel';
import { useEffect, useState } from 'react';

// Mock database of courses
const coursesDB: Course[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Introduction to Machine Learning with Python",
    author: "Dr. Sarah Johnson",
    rating: 4.8,
    duration: "8 weeks",
    price: "₦15,000",
    category: "Data Science",
    createdAt: "2023-01-15",
    viewCount: 1250,
    enrollmentCount: 320,
    popularityScore: 95
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?ixlib=rb-4.0.3&auto=format&fit=crop&w=1206&q=80",
    title: "Modern Web Development: React & Node.js",
    author: "Michael Chen",
    rating: 4.7,
    duration: "10 weeks",
    price: "₦18,000",
    category: "Programming",
    createdAt: "2023-02-01",
    viewCount: 980,
    enrollmentCount: 210,
    popularityScore: 88
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Fundamentals of UI/UX Design",
    author: "Emma Thompson",
    rating: 4.9,
    duration: "6 weeks",
    price: "₦14,500",
    category: "Design",
    createdAt: "2023-01-20",
    viewCount: 1100,
    enrollmentCount: 280,
    popularityScore: 92
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Digital Marketing Fundamentals",
    author: "Jessica Adams",
    rating: 4.6,
    duration: "6 weeks",
    price: "₦12,500",
    category: "Marketing",
    createdAt: "2023-03-10",
    viewCount: 860,
    enrollmentCount: 175,
    popularityScore: 83
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Financial Planning & Investment Strategies",
    author: "Robert Williams",
    rating: 4.9,
    duration: "4 weeks",
    price: "₦20,000",
    category: "Finance",
    createdAt: "2023-02-15",
    viewCount: 750,
    enrollmentCount: 150,
    popularityScore: 87
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Data Analytics for Business Decision-Making",
    author: "Daniel Morgan",
    rating: 4.7,
    duration: "9 weeks",
    price: "₦19,500",
    category: "Business",
    createdAt: "2023-04-05",
    viewCount: 690,
    enrollmentCount: 130,
    popularityScore: 85
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "JavaScript: From Fundamentals to Advanced",
    author: "Alex Johnson",
    rating: 4.8,
    duration: "12 weeks",
    price: "₦22,000",
    category: "Programming",
    createdAt: "2023-01-05",
    viewCount: 1500,
    enrollmentCount: 355,
    popularityScore: 94
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Mobile App Development with Flutter",
    author: "Maria Garcia",
    rating: 4.6,
    duration: "10 weeks",
    price: "₦17,500",
    category: "Mobile Development",
    createdAt: "2023-03-20",
    viewCount: 920,
    enrollmentCount: 190,
    popularityScore: 86
  },
  {
    id: "9",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Content Marketing Masterclass",
    author: "Chris Wilson",
    rating: 4.5,
    duration: "5 weeks",
    price: "₦13,000",
    category: "Marketing",
    createdAt: "2023-04-15",
    viewCount: 780,
    enrollmentCount: 160,
    popularityScore: 81
  },
  {
    id: "10",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
    title: "Photography Essentials for Beginners",
    author: "Sophia Lee",
    rating: 4.7,
    duration: "4 weeks",
    price: "₦11,000",
    category: "Photography",
    createdAt: "2023-02-25",
    viewCount: 850,
    enrollmentCount: 175,
    popularityScore: 82
  }
];

export function useAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchCourses = () => {
      try {
        setTimeout(() => {
          setCourses(coursesDB);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("Failed to fetch courses");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
}

export function useSearchCourses(initialSearchTerm: string = '') {
  const { courses, loading, error } = useAllCourses();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  
  // Function to handle search submission
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    const searchTermLower = term.toLowerCase();
    const results = courses.filter(
      course => 
        course.title.toLowerCase().includes(searchTermLower) || 
        course.category.toLowerCase().includes(searchTermLower) ||
        course.author.toLowerCase().includes(searchTermLower)
    );
    
    setSearchResults(results);
  };

  return { 
    searchResults, 
    loading, 
    error, 
    searchTerm, 
    handleSearch 
  };
}

export function getRecentCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 6);
}

export function getPopularCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => 
    (b.enrollmentCount || 0) - (a.enrollmentCount || 0)
  ).slice(0, 6);
}

export function getRecommendedCourses(courses: Course[]): Course[] {
  // In a real app, this would use user preferences, history, etc.
  // For now, just sort by rating
  return [...courses].sort((a, b) => b.rating - a.rating).slice(0, 6);
}

export function getInDemandCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => 
    (b.popularityScore || 0) - (a.popularityScore || 0)
  ).slice(0, 6);
}

export function getRecentlyViewedCourses(courses: Course[]): Course[] {
  // In a real app, this would be based on user's viewing history
  // For now, just sort by view count
  return [...courses].sort((a, b) => 
    (b.viewCount || 0) - (a.viewCount || 0)
  ).slice(0, 6);
}

export function getCategoryCourseCount(courses: Course[]): { name: string, count: number }[] {
  const categories = courses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = 0;
    }
    acc[course.category]++;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);
}
