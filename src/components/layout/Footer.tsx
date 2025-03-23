import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary/30 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <a href="/" className="flex items-center gap-0 font-medium text-xl text-foreground mb-4" aria-label="Skillversity">
              <span className="text-edu-blue">Skill</span>
              <span className="dark:text-white">versity</span>
            </a>
            <p className="text-muted-foreground mb-6">
              An advanced interactive educational platform that combines intelligent learning management with social networking features.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Courses</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Become a Teacher</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Social Feed</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Achievements</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Rewards System</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">FAQs</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Community</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Partners</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-edu-blue transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              &copy; {currentYear} Skillversity. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-edu-blue transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-edu-blue transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-edu-blue transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
