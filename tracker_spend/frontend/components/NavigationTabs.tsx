import React from 'react';
import FlatButton from './FlatButton';

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  tabs,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-x-auto [-webkit-overflow-scrolling:touch]`}>
      <div className={`flex space-x-1 p-1 bg-buddy-dark-tertiary rounded-lg min-w-max ${className}`}>
        {tabs.map((tab) => (
          <FlatButton
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className="flex-1 min-w-[110px]"
            icon={tab.icon}
          >
            <span className="truncate text-xs sm:text-sm">{tab.label}</span>
          </FlatButton>
        ))}
      </div>
    </div>
  );
};

export default NavigationTabs;
