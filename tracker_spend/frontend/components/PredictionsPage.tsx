import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiConnectionWithAuth } from '../src/services/api';
import { useDashboardStats } from '../src/hooks/useDashboardStats';
import { formatCurrency, formatPercentage } from '../src/utils/formatters';
import PageHeader from './PageHeader';
import LogoMark from './LogoMark';
import Card from './Card';
import WhatIfChart from './WhatIfChart';
import AnimatedIntervalSelector from './AnimatedIntervalSelector';

const PredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, isAuthenticated, isLoading } = useApiConnectionWithAuth();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const [selectedInterval, setSelectedInterval] = useState<'day' | 'week' | 'month'>('month');
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  // Hooks per caricare i dati
  const { 
    stats, 
    categoryStats, 
    spendingTrends,
    loading: statsLoading, 
    error: statsError, 
    refresh: refreshStats 
  } = useDashboardStats(currentYear, currentMonth, isAuthenticated);

  // Scenari predefiniti per le predizioni
  const scenarios = {
    conservative: {
      expenseReduction: 5,
      incomeIncrease: 2,
      description: 'Riduzione spese del 5% e aumento entrate del 2%',
      color: '#48BB78'
    },
    moderate: {
      expenseReduction: 15,
      incomeIncrease: 8,
      description: 'Riduzione spese del 15% e aumento entrate dell\'8%',
      color: '#DB9F75'
    },
    aggressive: {
      expenseReduction: 30,
      incomeIncrease: 20,
      description: 'Riduzione spese del 30% e aumento entrate del 20%',
      color: '#FF6B6B'
    }
  };

  // Calcola le predizioni basate sullo scenario selezionato
  const calculatePredictions = () => {
    if (!stats) return null;

    const scenario = scenarios[selectedScenario];
    const currentIncome = stats.total_income || 0;
    const currentExpenses = Math.abs(stats.total_expenses || 0);
    const currentSavings = stats.net_amount || 0;

    const projectedIncome = currentIncome * (1 + scenario.incomeIncrease / 100);
    const projectedExpenses = currentExpenses * (1 - scenario.expenseReduction / 100);
    const projectedSavings = projectedIncome - projectedExpenses;

    return {
      current: { income: currentIncome, expenses: currentExpenses, savings: currentSavings },
      projected: { income: projectedIncome, expenses: projectedExpenses, savings: projectedSavings },
      difference: projectedSavings - currentSavings,
      percentageChange: ((projectedSavings - currentSavings) / Math.abs(currentSavings)) * 100
    };
  };

  const predictions = calculatePredictions();

  // Gestisce il cambio di scenario
  const handleScenarioChange = (scenario: 'conservative' | 'moderate' | 'aggressive') => {
    setSelectedScenario(scenario);
  };

  // Gestisce il cambio di intervallo
  const handleIntervalChange = (interval: 'day' | 'week' | 'month') => {
    setSelectedInterval(interval);
  };

  // Connection status component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <LogoMark className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-brand-peach/70">Connessione in corso...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <LogoMark className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connessione Persa</h2>
          <p className="text-brand-peach/70 mb-4">Impossibile connettersi al server</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-peach text-white px-4 py-2 rounded-lg hover:bg-brand-peach/90 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <PageHeader
        title="Predizioni"
        subtitle="Simulazioni e analisi future"
        showLogo={true}
      />



      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
        {/* Selettore Intervallo */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="lg:col-span-1">
            <AnimatedIntervalSelector
              selectedInterval={selectedInterval}
              onIntervalChange={handleIntervalChange}
            />
          </div>

          {/* Scenari di Predizione */}
          <div className="lg:col-span-3">
            <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-brand-peach mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
                <span className="text-lg sm:text-xl md:text-2xl">🎯</span>
                Scenari di Predizione
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                {Object.entries(scenarios).map(([key, scenario]) => (
                  <button
                    key={key}
                    onClick={() => handleScenarioChange(key as 'conservative' | 'moderate' | 'aggressive')}
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                      selectedScenario === key
                        ? 'border-brand-peach bg-brand-peach/10 text-brand-peach'
                        : 'border-brand-medium/30 bg-brand-dark/30 text-brand-peach/60 hover:border-brand-peach/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">{key === 'conservative' ? '🟢' : key === 'moderate' ? '🟡' : '🔴'}</div>
                      <div className="font-bold text-sm sm:text-base md:text-lg capitalize mb-0.5 sm:mb-1">{key}</div>
                      <div className="text-xs sm:text-sm opacity-80">{scenario.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Grafico What If */}
        <WhatIfChart
          currentData={{
            income: stats?.total_income || 0,
            expenses: Math.abs(stats?.total_expenses || 0),
            savings: stats?.net_amount || 0
          }}
        />

        {/* Statistiche Dettagliate */}
        {predictions && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Confronto Attuale vs Proiettato */}
            <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
              <h3 className="text-base sm:text-lg font-bold text-brand-peach mb-3 sm:mb-4">Confronto Attuale vs Proiettato</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-brand-dark/30 rounded-lg">
                  <span className="text-brand-peach/80 text-sm sm:text-base">Entrate</span>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm sm:text-base">{formatCurrency(predictions.current.income)}</div>
                    <div className="text-green-400 text-xs sm:text-sm">→ {formatCurrency(predictions.projected.income)}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-2 sm:p-3 bg-brand-dark/30 rounded-lg">
                  <span className="text-brand-peach/80 text-sm sm:text-base">Spese</span>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm sm:text-base">{formatCurrency(predictions.current.expenses)}</div>
                    <div className="text-red-400 text-xs sm:text-sm">→ {formatCurrency(predictions.projected.expenses)}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-2 sm:p-3 bg-brand-dark/30 rounded-lg">
                  <span className="text-brand-peach/80 text-sm sm:text-base">Risparmio</span>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm sm:text-base">{formatCurrency(predictions.current.savings)}</div>
                    <div className={`text-xs sm:text-sm ${predictions.difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      → {formatCurrency(predictions.projected.savings)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Impatto delle Modifiche */}
            <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
              <h3 className="text-base sm:text-lg font-bold text-brand-peach mb-3 sm:mb-4">Impatto delle Modifiche</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-brand-peach/10 to-brand-orange/10 rounded-lg">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                    {predictions.difference >= 0 ? '+' : ''}{formatCurrency(predictions.difference)}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-peach/80">Differenza Annua</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg">
                  <div className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">
                    {predictions.percentageChange >= 0 ? '+' : ''}{formatPercentage(predictions.percentageChange)}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-peach/80">Variazione Percentuale</div>
                </div>
                
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                  <div className="text-sm sm:text-base md:text-lg font-bold text-white mb-1">
                    {formatCurrency(predictions.projected.savings / 12)}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-peach/80">Risparmio Mensile Medio</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Suggerimenti per l'Ottimizzazione */}
        <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
          <h3 className="text-base sm:text-lg font-bold text-brand-peach mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl">💡</span>
            Suggerimenti per l'Ottimizzazione
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-brand-dark/30 rounded-lg">
              <h4 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">Riduzione Spese</h4>
              <ul className="text-xs sm:text-sm text-brand-peach/80 space-y-0.5 sm:space-y-1">
                <li>• Analizza le categorie con spese più alte</li>
                <li>• Cerca alternative più economiche</li>
                <li>• Elimina abbonamenti non utilizzati</li>
                <li>• Pianifica gli acquisti in anticipo</li>
              </ul>
            </div>
            
            <div className="p-3 sm:p-4 bg-brand-dark/30 rounded-lg">
              <h4 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">Aumento Entrate</h4>
              <ul className="text-xs sm:text-sm text-brand-peach/80 space-y-0.5 sm:space-y-1">
                <li>• Cerca opportunità di freelance</li>
                <li>• Investi in formazione professionale</li>
                <li>• Considera un lavoro part-time</li>
                <li>• Sfrutta hobby per guadagni extra</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PredictionsPage;
