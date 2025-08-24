import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '../src/utils/formatters';

interface WhatIfChartProps {
  currentData: {
    income: number;
    expenses: number;
    savings: number;
  };
  className?: string;
}

interface WhatIfData {
  month: string;
  currentSavings: number;
  projectedSavings: number;
  difference: number;
}

const WhatIfChart: React.FC<WhatIfChartProps> = ({ currentData, className = '' }) => {
  const [expenseReduction, setExpenseReduction] = useState(10); // Percentuale di riduzione spese
  const [incomeIncrease, setIncomeIncrease] = useState(5); // Percentuale di aumento entrate

  // Calcola i dati "what if" basati sui parametri dello slider
  const whatIfData = useMemo(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const isCurrentOrPast = index <= currentMonth;
      
      // Calcola le proiezioni
      const projectedExpenses = currentData.expenses * (1 - expenseReduction / 100);
      const projectedIncome = currentData.income * (1 + incomeIncrease / 100);
      const projectedSavings = projectedIncome - projectedExpenses;
      
      // Per i mesi passati, usa i dati reali
      const currentSavings = isCurrentOrPast ? currentData.savings : 0;
      const futureSavings = isCurrentOrPast ? 0 : projectedSavings;
      
      return {
        month,
        currentSavings: isCurrentOrPast ? currentSavings : 0,
        projectedSavings: isCurrentOrPast ? 0 : projectedSavings,
        difference: projectedSavings - currentData.savings,
        isProjected: !isCurrentOrPast
      };
    });
  }, [currentData, expenseReduction, incomeIncrease]);

  // Calcola il risparmio totale proiettato
  const totalProjectedSavings = whatIfData.reduce((sum, data) => sum + data.projectedSavings, 0);
  const totalCurrentSavings = whatIfData.reduce((sum, data) => sum + data.currentSavings, 0);
  const totalDifference = totalProjectedSavings - totalCurrentSavings;

  return (
    <div className={`bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🎯</span>
          Simulatore "What If"
        </h3>
        <div className="text-right">
          <div className="text-xs sm:text-sm text-brand-peach/80">Risparmio Proiettato</div>
          <div className="text-base sm:text-lg font-bold text-white">
            {formatCurrency(totalProjectedSavings)}
          </div>
          <div className={`text-xs ${totalDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference)}
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
        {/* Slider Riduzione Spese */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs sm:text-sm font-medium text-brand-peach">
              Riduzione Spese: {expenseReduction}%
            </label>
            <span className="text-xs text-brand-peach/60">
              Risparmio: {formatCurrency(currentData.expenses * expenseReduction / 100)}/mese
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="50"
              value={expenseReduction}
              onChange={(e) => setExpenseReduction(Number(e.target.value))}
              className="w-full h-2 bg-brand-dark/50 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="absolute inset-0 h-2 bg-gradient-to-r from-red-500/20 to-green-500/20 rounded-lg pointer-events-none" />
          </div>
        </div>

        {/* Slider Aumento Entrate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs sm:text-sm font-medium text-brand-peach">
              Aumento Entrate: {incomeIncrease}%
            </label>
            <span className="text-xs text-brand-peach/60">
              Guadagno: {formatCurrency(currentData.income * incomeIncrease / 100)}/mese
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="30"
              value={incomeIncrease}
              onChange={(e) => setIncomeIncrease(Number(e.target.value))}
              className="w-full h-2 bg-brand-dark/50 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="absolute inset-0 h-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grafico */}
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={whatIfData}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DB9F75" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#DB9F75" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#48BB78" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#DB9F75', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              tick={{ fill: '#DB9F75', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value, { compact: true })}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#2F3A32', 
                border: '1px solid #545748', 
                borderRadius: '12px',
                color: '#FFFFFF',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: '#DB9F75', fontWeight: 'bold' }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'currentSavings' ? 'Risparmio Attuale' : 'Risparmio Proiettato'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="currentSavings" 
              stroke="#DB9F75" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorCurrent)"
              name="Risparmio Attuale"
            />
            <Area 
              type="monotone" 
              dataKey="projectedSavings" 
              stroke="#48BB78" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorProjected)"
              name="Risparmio Proiettato"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="flex justify-center space-x-4 sm:space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-brand-peach rounded-full"></div>
          <span className="text-xs text-brand-peach/80">Risparmio Attuale</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
          <span className="text-xs text-green-400/80">Risparmio Proiettato</span>
        </div>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-xs sm:text-sm text-brand-peach/80">Risparmio Annuo</div>
          <div className="text-base sm:text-lg font-bold text-white">
            {formatCurrency(totalProjectedSavings)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs sm:text-sm text-brand-peach/80">Differenza</div>
          <div className={`text-base sm:text-lg font-bold ${totalDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfChart;
