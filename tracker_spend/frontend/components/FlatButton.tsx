import React from 'react';

interface FlatButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const FlatButton: React.FC<FlatButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  icon
}) => {
  const baseClasses = `
    relative overflow-hidden
    rounded-lg font-medium
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantClasses = {
    primary: `
      bg-brand-peach text-brand-brown font-semibold
      hover:bg-brand-orange active:bg-brand-orange/80
      focus:ring-brand-peach/50
      shadow-sm hover:shadow-md hover:shadow-brand-peach/20
    `,
    secondary: `
      bg-brand-medium text-white
      border border-brand-medium
      hover:bg-brand-secondary active:bg-brand-medium
      focus:ring-brand-medium/50
    `,
    success: `
      bg-brand-peach text-brand-brown
      hover:bg-brand-orange active:bg-brand-orange/80
      focus:ring-brand-peach/50
      shadow-sm hover:shadow-md
    `,
    danger: `
      bg-brand-orange text-white
      hover:bg-brand-orange/90 active:bg-brand-orange/80
      focus:ring-brand-orange/50
      shadow-sm hover:shadow-md
    `,
    ghost: `
      bg-transparent text-brand-peach
      hover:bg-brand-medium active:bg-brand-secondary
      focus:ring-brand-peach/50
    `,
    brand: `
      bg-gradient-to-r from-brand-peach to-brand-orange text-brand-brown font-semibold
      hover:from-brand-orange hover:to-brand-brown
      focus:ring-brand-peach/50
      shadow-sm hover:shadow-md hover:shadow-brand-peach/20
    `
  };

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
    md: 'px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base',
    lg: 'px-4 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className
  ].join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      <span className="flex items-center justify-center space-x-1 sm:space-x-2 min-w-0">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="min-w-0 flex-1">{children}</span>
      </span>
    </button>
  );
};

export default FlatButton;
