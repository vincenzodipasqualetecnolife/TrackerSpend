import React from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

const LogoMark: React.FC<LogoMarkProps> = ({ size = 40, className = '' }) => {
  const width = size;
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tiles in ordine crescente, più grandi e più vicini */}
      <rect x="10" y="22" rx="3" ry="3" width="20" height="20" fill="#804012" />
      <rect x="16" y="16" rx="3" ry="3" width="20" height="20" fill="#DB9F75" />
      <rect x="22" y="10" rx="3" ry="3" width="20" height="20" fill="#545748" />
    </svg>
  );
};

export default LogoMark;


