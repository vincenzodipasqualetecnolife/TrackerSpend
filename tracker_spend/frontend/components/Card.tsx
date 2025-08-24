import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  onClick,
  variant = 'default'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const variantClasses = {
    default: `
      bg-brand-secondary
      border border-brand-medium
      shadow-sm
    `,
    elevated: `
      bg-brand-secondary
      border border-brand-medium
      shadow-lg
      hover:shadow-xl
      transition-shadow duration-200
    `,
    outlined: `
      bg-transparent
      border-2 border-brand-medium
      hover:border-brand-peach/50
      transition-colors duration-200
    `
  };

  const baseClasses = `
    relative overflow-hidden
    rounded-xl
    transition-all duration-200 ease-out
  `;
  
  const interactiveClasses = onClick ? `
    cursor-pointer 
    hover:bg-brand-medium
    active:scale-[0.98]
    focus:outline-none focus:ring-2 focus:ring-brand-peach/50 focus:ring-offset-2 focus:ring-offset-brand-dark
  ` : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    interactiveClasses,
    className
  ].join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
