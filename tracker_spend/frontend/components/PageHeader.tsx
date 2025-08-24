import React from 'react';
import LogoMark from './LogoMark';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  className?: string;
  showLogo?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  rightAction,
  onBack,
  className = '',
  showLogo = true
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        {showLogo && (
          <div className="flex-shrink-0">
            <LogoMark size={28} className="text-brand-peach sm:w-8 sm:h-8" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-1 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-white truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-brand-peach/80 text-xs sm:text-sm truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {rightAction && (
        <div className="ml-2 flex-shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
