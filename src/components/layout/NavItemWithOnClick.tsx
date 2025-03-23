
import React from 'react';

interface NavItemWithOnClickProps {
  children: string;
  href: string;
  className?: string;
  onClick: () => void;
}

const NavItemWithOnClick = ({ children, href, className, onClick }: NavItemWithOnClickProps) => {
  return (
    <li>
      <a 
        href={href} 
        className={className || "nav-link"} 
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
      >
        {children}
      </a>
    </li>
  );
};

export default NavItemWithOnClick;
