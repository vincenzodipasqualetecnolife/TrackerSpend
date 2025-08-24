import React from 'react';

const WavyLines: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Linea verde ondulata - movimento lento */}
        <div className="absolute w-[800px] h-[800px] animate-spin-slow">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-glow-green"
          >
            <path
              d="M 100 100 m -90 0 a 90 90 0 1 1 180 0 a 90 90 0 1 1 -180 0"
              fill="none"
              stroke="#48BB78"
              strokeWidth="4"
              strokeDasharray="8 4"
              className="animate-dash"
            />
          </svg>
        </div>

        {/* Linea blu ondulata - movimento medio */}
        <div className="absolute w-[900px] h-[900px] animate-spin-medium">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-glow-blue"
          >
            <path
              d="M 100 100 m -100 0 a 100 100 0 1 1 200 0 a 100 100 0 1 1 -200 0"
              fill="none"
              stroke="#4285F4"
              strokeWidth="5"
              strokeDasharray="12 6"
              className="animate-dash-reverse"
            />
          </svg>
        </div>

        {/* Linea arancione ondulata - movimento veloce */}
        <div className="absolute w-[1000px] h-[1000px] animate-spin-fast">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-glow-orange"
          >
            <path
              d="M 100 100 m -110 0 a 110 110 0 1 1 220 0 a 110 110 0 1 1 -220 0"
              fill="none"
              stroke="#C89B7B"
              strokeWidth="6"
              strokeDasharray="16 8"
              className="animate-dash"
            />
          </svg>
        </div>

        {/* Linee ondulate aggiuntive per effetto più dinamico */}
        <div className="absolute w-[700px] h-[700px] animate-spin-slow">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 20px rgba(72, 187, 120, 0.6))' }}
          >
            <path
              d="M 100 100 m -70 0 a 70 70 0 1 1 140 0 a 70 70 0 1 1 -140 0"
              fill="none"
              stroke="#48BB78"
              strokeWidth="2"
              strokeDasharray="6 3"
              opacity="0.7"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="absolute w-[1100px] h-[1100px] animate-spin-medium">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 25px rgba(66, 133, 244, 0.7))' }}
          >
            <path
              d="M 100 100 m -120 0 a 120 120 0 1 1 240 0 a 120 120 0 1 1 -240 0"
              fill="none"
              stroke="#4285F4"
              strokeWidth="3"
              strokeDasharray="10 5"
              opacity="0.6"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Particelle luminose che seguono le linee */}
        <div className="absolute inset-0">
          {/* Particelle verdi */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-400 rounded-full animate-orbit" 
               style={{ filter: 'drop-shadow(0 0 15px rgba(72, 187, 120, 1))' }} />
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-orbit-reverse" 
               style={{ filter: 'drop-shadow(0 0 12px rgba(72, 187, 120, 0.8))' }} />
          
          {/* Particelle blu */}
          <div className="absolute top-1/2 left-1/3 w-2.5 h-2.5 bg-blue-400 rounded-full animate-orbit" 
               style={{ filter: 'drop-shadow(0 0 18px rgba(66, 133, 244, 1))' }} />
          <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-orbit-reverse" 
               style={{ filter: 'drop-shadow(0 0 10px rgba(66, 133, 244, 0.8))' }} />
          
          {/* Particelle arancioni */}
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-orange-400 rounded-full animate-orbit" 
               style={{ filter: 'drop-shadow(0 0 20px rgba(200, 155, 123, 1))' }} />
          <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-orange-400 rounded-full animate-orbit-reverse" 
               style={{ filter: 'drop-shadow(0 0 15px rgba(200, 155, 123, 0.9))' }} />
        </div>

        {/* Effetto di glow centrale più intenso */}
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-green-400/30 via-blue-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-r from-green-400/20 via-blue-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse" />
      </div>
    </div>
  );
};

export default WavyLines;
