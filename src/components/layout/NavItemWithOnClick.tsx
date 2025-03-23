
import React from 'react';

interface NavItemWithOnClickProps {
  children: string;
  href: string;
  className?: string;
  onClick: () => void;
}

const NavItemWithOnClick = ({ children, href, className, onClick }: NavItemWithOnClickProps) => {
  return (
    <a 
      href={href} 
      className={className || "nav-link"} 
      onClick={(e) => {
        if (href.startsWith('#')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </a>
  );
};

export default NavItemWithOnClick;
