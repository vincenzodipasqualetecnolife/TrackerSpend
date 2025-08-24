import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostra il toast con un piccolo delay per l'animazione
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Nasconde il toast dopo la durata specificata
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Aspetta che l'animazione finisca
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out max-w-sm w-full pointer-events-auto";
    const visibilityStyles = isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0";
    
    return `${baseStyles} ${visibilityStyles}`;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-white'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={getToastStyles()}>
      <div className={`${styles.bg} rounded-lg shadow-lg p-3 flex items-center justify-between`}>
        <div className={`flex-1 ${styles.text} pr-2`}>
          <span className="text-xs font-medium whitespace-nowrap overflow-hidden block">{message}</span>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
