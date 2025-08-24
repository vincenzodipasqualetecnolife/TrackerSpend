import React from 'react';
import LogoMark from './LogoMark';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ message }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-dark text-white">
      <div className="text-center px-6">
        <div className="inline-block relative">
          <div className="animate-logo-bob inline-block">
            <div className="animate-logo-spin inline-block">
              <LogoMark size={88} />
            </div>
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-90s tracking-wide uppercase relative inline-block">
          {/* Layer 1: Acronym TS, fades out */}
          <span className="title-abbr">TS</span>
          {/* Layer 2: Final name, revealed in two steps so we never see TS + word together */}
          <span className="inline-block overflow-hidden align-bottom animate-title-reveal-6 delay-200">TRACKER</span>
          <span className="inline-block overflow-hidden align-bottom ml-2 animate-title-reveal-5 delay-1000">SPEND</span>
        </h1>
        <p className="mt-2 text-brand-peach/80">Intelligenza per il risparmio</p>
        {message && (
          <p className="mt-4 text-sm text-brand-peach/70">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SplashScreen;


