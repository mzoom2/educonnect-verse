
import React, { useEffect, useRef } from 'react';
import { 
  BookOpen, Users, Award, Zap, 
  LineChart, CreditCard, ShieldCheck, 
  MessageSquare 
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <div className={`feature-card animate-on-scroll opacity-0 ${delay}`}>
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-12 h-12 rounded-full bg-edu-blue/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    
    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  const features = [
    {
      icon: <BookOpen size={20} className="text-edu-blue" />,
      title: "Comprehensive Courses",
      description: "Structured learning with multi-format content including videos, PDFs, quizzes, and practical tasks.",
      delay: "animate-delay-100"
    },
    {
      icon: <Users size={20} className="text-edu-purple" />,
      title: "Social Learning Network",
      description: "Connect with fellow learners, follow teachers, and engage with educational content.",
      delay: "animate-delay-200"
    },
    {
      icon: <Award size={20} className="text-edu-green" />,
      title: "Achievements & Rewards",
      description: "Earn achievements, XP, and monetary rewards for completing educational activities.",
      delay: "animate-delay-300"
    },
    {
      icon: <Zap size={20} className="text-edu-orange" />,
      title: "AI-Powered Evaluation",
      description: "Submit tasks and receive AI evaluations using advanced natural language processing.",
      delay: "animate-delay-100"
    },
    {
      icon: <LineChart size={20} className="text-edu-pink" />,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics and progress visualization.",
      delay: "animate-delay-200"
    },
    {
      icon: <CreditCard size={20} className="text-edu-teal" />,
      title: "Monetization Options",
      description: "Teachers can earn by creating courses, while students earn rewards for accomplishments.",
      delay: "animate-delay-300"
    },
    {
      icon: <ShieldCheck size={20} className="text-edu-yellow" />,
      title: "Secure & Private",
      description: "Industry-standard security with robust authentication and data protection.",
      delay: "animate-delay-100"
    },
    {
      icon: <MessageSquare size={20} className="text-edu-light-blue" />,
      title: "Community Engagement",
      description: "Interact with posts, receive notifications, and participate in educational discussions.",
      delay: "animate-delay-200"
    }
  ];

  return (
    <section id="features" ref={sectionRef} className="section-padding bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-heading animate-on-scroll opacity-0">
            Powerful Features for <span className="text-edu-blue">Modern Learning</span>
          </h2>
          <p className="section-subheading mx-auto animate-on-scroll opacity-0 animate-delay-100">
            EduSocial combines innovative educational tools with social networking to create a unique learning ecosystem.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
