import React from 'react';
import { useResponsive } from '../src/hooks/useResponsive';

interface MobileOptimizedChartProps {
  children: React.ReactNode;
  height?: number;
  mobileHeight?: number;
  className?: string;
}

const MobileOptimizedChart: React.FC<MobileOptimizedChartProps> = ({
  children,
  height = 300,
  mobileHeight = 200,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  
  const chartHeight = isMobile ? mobileHeight : height;

  return (
    <div 
      className={`w-full ${className}`}
      style={{ height: `${chartHeight}px` }}
    >
      {children}
    </div>
  );
};

export default MobileOptimizedChart;
