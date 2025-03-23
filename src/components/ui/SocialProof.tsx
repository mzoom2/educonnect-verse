
import React, { useRef, useEffect } from 'react';
import { Quote } from 'lucide-react';

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  avatarUrl: string;
  delay: string;
}

const Testimonial = ({ content, author, role, avatarUrl, delay }: TestimonialProps) => (
  <div className={`glass-card p-6 animate-on-scroll opacity-0 ${delay}`}>
    <Quote size={36} className="text-edu-blue/20 mb-4" />
    <p className="mb-6 text-foreground/90 italic">"{content}"</p>
    <div className="flex items-center">
      <img src={avatarUrl} alt={author} className="w-12 h-12 rounded-full mr-4 object-cover" />
      <div>
        <h4 className="font-medium">{author}</h4>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  </div>
);

const SocialProof = () => {
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
      { threshold: 0.1 }
    );
    
    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach(el => observer.observe(el));
    
    return () => {
      elements?.forEach(el => observer.unobserve(el));
    };
  }, []);

  const testimonials = [
    {
      content: "EduSocial transformed my learning experience. The combination of structured courses and social features makes education engaging and fun.",
      author: "Amara Okonkwo",
      role: "Data Science Student",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      delay: "animate-delay-100"
    },
    {
      content: "As a teacher, I've found EduSocial to be a game-changer. The platform gives me tools to create compelling content and I love the monetization options.",
      author: "Dr. Emmanuel Adebayo",
      role: "Computer Science Professor",
      avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      delay: "animate-delay-200"
    },
    {
      content: "The AI-powered evaluations provide meaningful feedback on my assignments. I've improved my skills faster than I would have with traditional methods.",
      author: "Chioma Eze",
      role: "UX Design Student",
      avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
      delay: "animate-delay-300"
    }
  ];

  return (
    <section id="testimonials" ref={sectionRef} className="section-padding bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-heading animate-on-scroll opacity-0">
            What Our <span className="text-edu-blue">Users Say</span>
          </h2>
          <p className="section-subheading mx-auto animate-on-scroll opacity-0 animate-delay-100">
            Hear from students and teachers who have transformed their educational experience with EduSocial.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              content={testimonial.content}
              author={testimonial.author}
              role={testimonial.role}
              avatarUrl={testimonial.avatarUrl}
              delay={testimonial.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
