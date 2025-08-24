import React, { useState, useRef } from 'react';

interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = rippleIdRef.current++;

    setRipples(prev => [...prev, { id, x, y }]);

    // Rimuovi il ripple dopo l'animazione
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      createRipple(event);
      onClick?.();
    }
  };

  const baseClasses = `
    relative overflow-hidden
    backdrop-blur-md border border-white/20
    rounded-xl font-semibold
    transform transition-all duration-300 ease-out
    hover:scale-[1.02] hover:-translate-y-0.5
    active:scale-[0.98] active:translate-y-0
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-buddy-purple/20 to-purple-600/20
      text-white shadow-lg shadow-buddy-purple/20
      hover:shadow-xl hover:shadow-buddy-purple/30
      focus:ring-buddy-purple/50
      hover:from-buddy-purple/30 hover:to-purple-600/30
    `,
    secondary: `
      bg-gradient-to-r from-white/10 to-white/5
      text-buddy-text-primary shadow-lg shadow-black/10
      hover:shadow-xl hover:shadow-black/20
      focus:ring-white/30
      hover:from-white/15 hover:to-white/10
    `,
    success: `
      bg-gradient-to-r from-green-500/20 to-green-600/20
      text-green-100 shadow-lg shadow-green-500/20
      hover:shadow-xl hover:shadow-green-500/30
      focus:ring-green-500/50
      hover:from-green-500/30 hover:to-green-600/30
    `,
    danger: `
      bg-gradient-to-r from-red-500/20 to-red-600/20
      text-red-100 shadow-lg shadow-red-500/20
      hover:shadow-xl hover:shadow-red-500/30
      focus:ring-red-500/50
      hover:from-red-500/30 hover:to-red-600/30
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
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
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={classes}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '600ms'
          }}
        />
      ))}
      
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </button>
  );
};

export default RippleButton;
