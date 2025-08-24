import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'border-brand-medium',
    success: 'border-brand-peach/30 bg-brand-peach/5',
    warning: 'border-brand-orange/30 bg-brand-orange/5',
    error: 'border-brand-orange/30 bg-brand-orange/5',
    info: 'border-brand-medium/30 bg-brand-medium/5',
    brand: 'border-brand-peach/30 bg-gradient-brand-subtle'
  };

  const valueColors = {
    default: 'text-white',
    success: 'text-brand-peach',
    warning: 'text-brand-orange',
    error: 'text-brand-orange',
    info: 'text-brand-medium',
    brand: 'text-brand-peach'
  };

  return (
    <div className={`
      bg-brand-secondary 
      border border-brand-medium 
      rounded-xl p-4
      transition-all duration-200
      hover:bg-brand-medium
      ${variantClasses[variant]}
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            {icon && (
              <div className="text-brand-peach">
                {icon}
              </div>
            )}
            <p className="text-xs font-medium text-brand-peach uppercase tracking-wide">
              {title}
            </p>
          </div>
          
          <div className="flex items-baseline space-x-2">
            <p className={`text-2xl font-bold ${valueColors[variant]}`}>
              {typeof value === 'number' ? `€${value.toFixed(2)}` : value}
            </p>
            
            {trend && (
              <div className={`
                flex items-center space-x-1 text-xs font-medium
                ${trend.isPositive ? 'text-brand-peach' : 'text-brand-orange'}
              `}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-brand-peach mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
