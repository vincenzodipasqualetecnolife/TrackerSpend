
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  className = '' 
}) => {
  const Icon = ({ name }: { name: string }) => {
    switch (name) {
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M6 15l4-4 3 3 5-6"/>
          </svg>
        );
      case 'target':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        );
      case 'book':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        );
      case 'trending-up':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/>
            <polyline points="16,7 22,7 22,13"/>
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        );
      case 'settings':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .69.28 1.32.73 1.77.45.45 1.08.73 1.77.73H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'dashboard', icon: 'chart', label: 'Dashboard' },
    { id: 'goals', icon: 'target', label: 'Obiettivi' },
    { id: 'education', icon: 'book', label: 'Educazione' },
    { id: 'review-optimize', icon: 'trending-up', label: 'Predizioni' },
    { id: 'risk-guard', icon: 'shield', label: 'Protezione' },
    { id: 'settings', icon: 'settings', label: 'Impostazioni' }
  ];

  return (
    <div className={`${className}`}>
      {/* pill nav */}
      <div className="rounded-full bg-brand-secondary/95 border border-brand-medium shadow-lg backdrop-blur px-2 py-1 inline-flex" style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.25)' }}>
        <div className="flex justify-center items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              className={`flex items-center gap-2 h-11 px-3 rounded-full text-xs font-medium transition-all duration-200
                ${activeTab === tab.id ? 'bg-brand-peach text-brand-brown' : 'text-brand-peach/80 hover:text-brand-peach hover:bg-brand-medium/60'}
              `}
            >
              <span className="text-base"><Icon name={tab.icon} /></span>
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
