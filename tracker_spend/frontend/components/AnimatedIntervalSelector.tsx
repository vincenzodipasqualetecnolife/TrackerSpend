import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntervalSelectorProps {
  selectedInterval: 'day' | 'week' | 'month';
  onIntervalChange: (interval: 'day' | 'week' | 'month') => void;
  className?: string;
}

const AnimatedIntervalSelector: React.FC<IntervalSelectorProps> = ({
  selectedInterval,
  onIntervalChange,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const intervals = [
    { value: 'day', label: 'Giorno', icon: '📅', color: '#FF6B6B' },
    { value: 'week', label: 'Settimana', icon: '📆', color: '#4ECDC4' },
    { value: 'month', label: 'Mese', icon: '📊', color: '#45B7D1' }
  ] as const;

  const handleIntervalChange = (interval: 'day' | 'week' | 'month') => {
    if (interval === selectedInterval || isAnimating) return;
    
    setIsAnimating(true);
    onIntervalChange(interval);
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getSelectedIntervalData = () => {
    return intervals.find(interval => interval.value === selectedInterval);
  };

  return (
    <div className={`bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-3 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span className="text-lg sm:text-xl">⏱️</span>
          Intervallo
        </h3>
        
        {/* Indicatore animato dell'intervallo selezionato */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedInterval}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 border border-white/20"
          >
            <span className="text-lg">{getSelectedIntervalData()?.icon}</span>
            <span className="text-sm font-medium text-white">
              {getSelectedIntervalData()?.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pulsanti intervallo con animazioni */}
      <div className="grid grid-cols-3 gap-2">
        {intervals.map((interval) => {
          const isSelected = interval.value === selectedInterval;
          
          return (
            <motion.button
              key={interval.value}
              onClick={() => handleIntervalChange(interval.value)}
              disabled={isAnimating}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative p-3 rounded-xl border transition-all duration-300
                ${isSelected 
                  ? 'bg-gradient-to-br from-brand-peach/20 to-brand-peach/10 border-brand-peach/50 text-brand-peach shadow-lg' 
                  : 'bg-brand-dark/30 border-brand-medium/30 text-brand-peach/60 hover:border-brand-peach/30 hover:bg-brand-dark/50'
                }
                ${isAnimating ? 'pointer-events-none' : ''}
              `}
            >
              {/* Indicatore di selezione animato */}
              {isSelected && (
                <motion.div
                  layoutId="selectedIndicator"
                  className="absolute inset-0 bg-gradient-to-br from-brand-peach/10 to-transparent rounded-xl border border-brand-peach/30"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Contenuto del pulsante */}
              <div className="relative z-10 flex flex-col items-center space-y-1">
                <motion.span 
                  className="text-2xl"
                  animate={isSelected ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {interval.icon}
                </motion.span>
                <span className="text-xs font-medium">
                  {interval.label}
                </span>
              </div>

              {/* Effetto glow per l'elemento selezionato */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: `0 0 20px ${interval.color}40`,
                    border: `1px solid ${interval.color}60`
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${interval.color}40`,
                      `0 0 30px ${interval.color}60`,
                      `0 0 20px ${interval.color}40`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Barra di progresso animata */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-brand-peach/60 mb-2">
          <span>Inizio</span>
          <span>Fine</span>
        </div>
        <div className="relative h-2 bg-brand-dark/30 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-peach to-brand-peach/60 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
      </div>

      {/* Statistiche rapide per l'intervallo selezionato */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedInterval}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="mt-4 pt-4 border-t border-white/10"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-brand-peach/60">Media</div>
              <div className="text-sm font-bold text-white">
                €{selectedInterval === 'day' ? '45' : selectedInterval === 'week' ? '315' : '1,350'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-brand-peach/60">Tendenza</div>
              <div className="text-sm font-bold text-green-400">
                +{selectedInterval === 'day' ? '5%' : selectedInterval === 'week' ? '12%' : '8%'}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedIntervalSelector;
