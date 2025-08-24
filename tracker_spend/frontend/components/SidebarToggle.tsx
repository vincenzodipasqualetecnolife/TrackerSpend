import React from 'react';

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isOpen, onToggle, className = '' }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-3 rounded-full bg-brand-secondary border border-brand-medium shadow-lg
        hover:bg-brand-medium/50 transition-all duration-200
        ${className}
      `}
      aria-label={isOpen ? 'Chiudi sidebar' : 'Apri sidebar'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 sm:h-5 sm:w-5 text-brand-peach" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
};

export default SidebarToggle;
