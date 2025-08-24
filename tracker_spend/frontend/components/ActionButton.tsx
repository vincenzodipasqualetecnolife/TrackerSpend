import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
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
    `
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      <span className="flex items-center justify-center">
        {icon}
      </span>
    </button>
  );
};

export default ActionButton;
