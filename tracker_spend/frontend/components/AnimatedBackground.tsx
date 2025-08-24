import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Container per le linee animate */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Linea verde - rotazione lenta */}
        <div className="absolute w-[600px] h-[600px] animate-spin-slow">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 20px rgba(72, 187, 120, 0.6))' }}
          >
            <path
              d="M 100 100 m -80 0 a 80 80 0 1 1 160 0 a 80 80 0 1 1 -160 0"
              fill="none"
              stroke="#48BB78"
              strokeWidth="3"
              strokeDasharray="10 5"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Linea blu - rotazione media */}
        <div className="absolute w-[700px] h-[700px] animate-spin-medium">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 25px rgba(66, 133, 244, 0.7))' }}
          >
            <path
              d="M 100 100 m -90 0 a 90 90 0 1 1 180 0 a 90 90 0 1 1 -180 0"
              fill="none"
              stroke="#4285F4"
              strokeWidth="4"
              strokeDasharray="15 8"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Linea arancione - rotazione veloce */}
        <div className="absolute w-[800px] h-[800px] animate-spin-fast">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 30px rgba(200, 155, 123, 0.8))' }}
          >
            <path
              d="M 100 100 m -100 0 a 100 100 0 1 1 200 0 a 100 100 0 1 1 -200 0"
              fill="none"
              stroke="#C89B7B"
              strokeWidth="5"
              strokeDasharray="20 10"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Particelle fluttuanti */}
        <div className="absolute inset-0">
          {/* Particelle verdi */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-float-slow" 
               style={{ filter: 'drop-shadow(0 0 10px rgba(72, 187, 120, 0.8))' }} />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-green-400 rounded-full animate-float-medium" 
               style={{ filter: 'drop-shadow(0 0 8px rgba(72, 187, 120, 0.6))' }} />
          
          {/* Particelle blu */}
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-fast" 
               style={{ filter: 'drop-shadow(0 0 12px rgba(66, 133, 244, 0.7))' }} />
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-float-slow" 
               style={{ filter: 'drop-shadow(0 0 8px rgba(66, 133, 244, 0.6))' }} />
          
          {/* Particelle arancioni */}
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-float-medium" 
               style={{ filter: 'drop-shadow(0 0 15px rgba(200, 155, 123, 0.8))' }} />
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-orange-400 rounded-full animate-float-fast" 
               style={{ filter: 'drop-shadow(0 0 10px rgba(200, 155, 123, 0.7))' }} />
        </div>

        {/* Effetto di glow centrale */}
        <div className="absolute w-96 h-96 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" />
      </div>
    </div>
  );
};

export default AnimatedBackground;
