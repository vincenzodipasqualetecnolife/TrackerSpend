import React from 'react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`min-h-screen bg-brand-dark safe-area-top safe-area-bottom ${className}`}>
      {/* Container principale con padding responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      
      {/* Indicatore di orientamento per mobile */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <div className="bg-brand-secondary/80 backdrop-blur-sm rounded-lg p-2 text-xs text-brand-peach/60">
          <span className="hidden sm:inline">Tablet</span>
          <span className="sm:hidden">Mobile</span>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveLayout;
