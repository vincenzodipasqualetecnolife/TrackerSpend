import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, RadialLinearScale, Filler, Title } from 'chart.js';
import { Pie, Bar, Line, Radar, Doughnut } from 'react-chartjs-2';
import { ApiService } from '../src/services/api';
import type { Transaction } from '../types';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, 
  BarElement, LineElement, PointElement, RadialLinearScale, Filler, Title
);

// Simple inline icons to avoid external deps in this component
const Icon = {
  Calendar: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  TrendingUp: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  BarChart3: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="3" x2="3" y2="21"/><line x1="21" y1="3" x2="21" y2="21"/><rect x="7" y="9" width="3" height="7"/><rect x="14" y="5" width="3" height="11"/></svg>
  ),
  PieChart: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>
  ),
  Target: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  Activity: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  ),
  Map: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 8 1 16 6 23 1 23 17 16 22 8 17 1 22"/></svg>
  ),
  ArrowRightLeft: (props: any) => (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 11 21 7 17 3"/><line x1="21" y1="7" x2="9" y2="7"/><polyline points="7 13 3 17 7 21"/><line x1="15" y1="17" x2="3" y2="17"/></svg>
  )
};

interface AnalyticsPageProps {
  transactions?: Transaction[];
  onBack?: () => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ transactions, onBack }) => {
  const [serverTransactions, setServerTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await ApiService.getTransactions();
        if (resp.data) {
          let tx: any[] = [];
          if ('transactions' in (resp.data as any)) {
            tx = (resp.data as any).transactions || [];
          } else if ('data' in (resp.data as any)) {
            tx = (resp.data as any).data || [];
          } else if (Array.isArray(resp.data)) {
            tx = resp.data as any[];
          }
          setServerTransactions(tx as Transaction[]);
        }
      } catch (e) {
        // silent
      }
    };
    load();
  }, []);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedChart, setSelectedChart] = useState<'overview' | 'distribution' | 'trends' | 'radar' | 'heatmap' | 'treemap' | 'sankey' | 'gauge'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [budgetLimit, setBudgetLimit] = useState(5000);

  const safeTransactions = (transactions && transactions.length > 0) ? transactions : serverTransactions;
  useEffect(() => {
    console.log('Analytics loaded transactions:', { fromProps: transactions?.length || 0, fromServer: serverTransactions.length });
  }, [transactions, serverTransactions]);

  // Calcola i dati per tutti i grafici
  const getChartData = () => {
    const categories = safeTransactions.reduce((acc: Record<string, number>, t: Transaction) => {
      const amount = Number(t.amount || 0);
      if (t.type === 'expense') {
        const key = t.category_name || 'Altro';
        acc[key] = (acc[key] || 0) + amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalExpenses = Object.values(categories).reduce((sum: number, val: number) => sum + val, 0);
    const totalIncome = safeTransactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount || 0), 0);

    return { categories, totalExpenses, totalIncome };
  };

  const { categories, totalExpenses, totalIncome } = getChartData();

  // 1. GRAFICO A TORTA DINAMICO (DONUT)
  const getDonutData = () => {
    const categoryEntries = Object.entries(categories).sort(([,a], [,b]) => b - a);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    
    return {
      labels: categoryEntries.map(([cat]) => cat),
      datasets: [{
        data: categoryEntries.map(([,amount]) => amount),
        backgroundColor: colors.slice(0, categoryEntries.length),
        borderColor: '#2D373A',
        borderWidth: 3,
        hoverBorderWidth: 5,
        cutout: '65%',
      }]
    };
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12, weight: 'bold' as const },
          color: '#C89B7B',
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(45, 55, 58, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#C89B7B',
        borderWidth: 2,
        cornerRadius: 16,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 20,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: €${context.parsed.toFixed(0)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // 2. GRAFICO A BARRE INTERATTIVO
  const getBarData = () => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const monthlyData = months.map((_, index) => {
      const monthTransactions = safeTransactions.filter((t: Transaction) => {
        const d = new Date(t.transaction_date);
        return d.getMonth() === index && t.type === 'expense';
      });
      return monthTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount || 0), 0);
    });

    return {
      labels: months,
      datasets: [{
        label: 'Spese Mensili',
        data: monthlyData,
        backgroundColor: 'rgba(200, 155, 123, 0.8)',
        borderColor: '#C89B7B',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(219, 159, 117, 0.9)',
        hoverBorderColor: '#DB9F75',
        hoverBorderWidth: 3,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      }]
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(45, 55, 58, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#C89B7B',
        borderWidth: 2,
        cornerRadius: 16,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 20,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 155, 123, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#C89B7B',
          font: { size: 12, weight: 'bold' as const },
          callback: (value: any) => '€' + value.toFixed(0),
        }
      },
      x: {
        grid: {
          display: false,
        },
        offset: true,
        ticks: {
          color: '#C89B7B',
          font: { size: 12, weight: 'bold' as const },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        }
      }
    }
  };

  // 3. GRAFICO A LINEE CON ZOOM
  const getLineData = () => {
    const last30Days = Array.from({ length: 30 }, (_: any, i: number) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const dailyData = last30Days.map(date => {
      const dayTransactions = safeTransactions.filter((t: Transaction) => 
        String(t.transaction_date).slice(0,10) === date && t.type === 'expense'
      );
      return dayTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount || 0), 0);
    });

    return {
      labels: last30Days.map(date => new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })),
      datasets: [{
        label: 'Spese Giornaliere',
        data: dailyData,
        borderColor: '#C89B7B',
        backgroundColor: 'rgba(200, 155, 123, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#C89B7B',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }]
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(45, 55, 58, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#C89B7B',
        borderWidth: 2,
        cornerRadius: 16,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 20,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 155, 123, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#C89B7B',
          font: { size: 12, weight: 'bold' as const },
          callback: (value: any) => '€' + value.toFixed(0),
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#C89B7B',
          font: { size: 11, weight: 'bold' as const },
          maxTicksLimit: 10,
        }
      }
    }
  };

  // 4. GRAFICO RADAR MIGLIORATO
  const getRadarData = () => {
    const chartData = getChartData();
    const displayCategories = Object.entries(chartData.categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      labels: displayCategories.map(cat => cat.name),
      datasets: [{
        label: 'Pattern di Spesa',
        data: displayCategories.map(cat => cat.value),
        backgroundColor: 'rgba(200, 155, 123, 0.2)',
        borderColor: '#C89B7B',
        borderWidth: 3,
        pointBackgroundColor: '#C89B7B',
        pointBorderColor: '#2D373A',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: '#DB9F75',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        fill: true,
        tension: 0.2,
      }]
    };
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          font: { size: 12, weight: 'bold' as const },
          color: '#C89B7B',
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(45, 55, 58, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#C89B7B',
        borderWidth: 2,
        cornerRadius: 16,
        displayColors: false,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 20,
        callbacks: {
          label: (context: any) => `${context.label}: €${context.parsed.r.toFixed(0)}`
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 3000,
        grid: {
          color: 'rgba(200, 155, 123, 0.15)',
          lineWidth: 1,
        },
        pointLabels: {
          font: { size: 13, weight: 'bold' as const },
          color: '#C89B7B',
          padding: 30,
        },
        ticks: {
          font: { size: 11, weight: 'bold' as const },
          color: '#C89B7B',
          stepSize: 1000,
          callback: (value: any) => '€' + value.toFixed(0)
        },
        border: { display: false },
        angleLines: {
          color: 'rgba(200, 155, 123, 0.2)',
          lineWidth: 1,
        },
      },
    },
  };

  // 5. HEATMAP CALENDARIO
  const CalendarHeatmap = () => {
    const today = new Date();
    const days: Array<{ date: string; amount: number; day: number; dayName: string }> = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = safeTransactions.filter((t: Transaction) => 
        String(t.transaction_date).slice(0,10) === dateStr && t.type === 'expense'
      );
      const total = dayTransactions.reduce((sum: number, t: Transaction) => sum + Number(t.amount || 0), 0);
      
      days.push({
        date: dateStr,
        amount: total,
        day: date.getDate(),
        dayName: date.toLocaleDateString('it-IT', { weekday: 'short' })
      });
    }

    const maxAmount = Math.max(0, ...days.map(d => d.amount));
    
    const getColor = (amount: number) => {
      if (amount === 0) return 'rgba(200, 155, 123, 0.1)';
      const intensity = maxAmount > 0 ? Math.min(amount / maxAmount, 1) : 0;
      return `rgba(200, 155, 123, ${0.2 + intensity * 0.6})`;
    };

    return (
      <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icon.Calendar className="w-5 h-5" />
          Heatmap Spese Giornaliere
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-brand-orange/80 p-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={day.date}
              className="relative group cursor-pointer"
              style={{ gridColumn: index === 0 ? (new Date(day.date).getDay() || 7) : 'auto' }}
            >
              <div
                className="w-8 h-8 rounded-md border border-white/10 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                style={{ backgroundColor: getColor(day.amount) }}
                title={`${day.dayName} ${day.day}: €${day.amount.toFixed(0)}`}
              />
              {day.amount > 0 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand-orange rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 text-xs text-brand-orange/80">
          <span>€0</span>
          <span>€{maxAmount.toFixed(0)}</span>
        </div>
      </div>
    );
  };

  // 6. TREEMAP
  const TreemapChart = () => {
    const categoryEntries = Object.entries(categories).sort(([,a], [,b]) => b - a);
    const total = categoryEntries.reduce((sum, [,amount]) => sum + amount, 0);
    
    return (
      <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icon.Map className="w-5 h-5" />
          Distribuzione Categorie (Treemap)
        </h3>
        <div className="grid grid-cols-2 gap-2 h-64">
          {categoryEntries.map(([category, amount], index) => {
            const percentage = (amount / total) * 100;
            const height = Math.max(20, percentage * 2);
            
            return (
              <div
                key={category}
                className="relative bg-gradient-to-br from-brand-orange/20 to-brand-orange/10 border border-brand-orange/30 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-brand-orange/30 hover:to-brand-orange/20"
                style={{ height: `${height}%` }}
                onClick={() => setSelectedCategory(category)}
              >
                <div className="text-sm font-bold text-white mb-1">{category}</div>
                <div className="text-lg font-bold text-brand-orange">€{amount.toFixed(0)}</div>
                <div className="text-xs text-brand-orange/80">{percentage.toFixed(1)}%</div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-brand-orange rounded-full" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 7. SANKEY DIAGRAM (Semplificato)
  const SankeyDiagram = () => {
    return (
      <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icon.ArrowRightLeft className="w-5 h-5" />
          Flusso di Denaro
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="bg-brand-orange/20 border border-brand-orange/30 rounded-lg px-4 py-2">
              <div className="text-sm text-brand-orange/80">Entrate</div>
              <div className="text-lg font-bold text-white">€{totalIncome.toFixed(0)}</div>
            </div>
            <div className="flex-1 h-1 bg-gradient-to-r from-brand-orange/50 to-brand-orange/20 mx-4" />
            <div className="bg-brand-orange/20 border border-brand-orange/30 rounded-lg px-4 py-2">
              <div className="text-sm text-brand-orange/80">Spese</div>
              <div className="text-lg font-bold text-white">€{totalExpenses.toFixed(0)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {Object.entries(categories).slice(0, 6).map(([category, amount]) => (
              <div key={category} className="text-center">
                <div className="w-full h-2 bg-gradient-to-r from-brand-orange/30 to-brand-orange/10 rounded-full mb-2" />
                <div className="text-xs font-bold text-brand-orange">{category}</div>
                <div className="text-sm text-white">€{amount.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 8. GAUGE/SPEEDOMETER
  const GaugeChart = () => {
    const percentage = (totalExpenses / budgetLimit) * 100;
    const angle = Math.min(percentage * 1.8, 180); // 180 gradi = 100%
    
    const getColor = () => {
      if (percentage <= 60) return '#4ECDC4'; // Verde
      if (percentage <= 80) return '#FFE66D'; // Giallo
      return '#FF6B6B'; // Rosso
    };

    return (
      <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Icon.Target className="w-5 h-5" />
          Budget Monitor
        </h3>
        <div className="relative flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(200, 155, 123, 0.2)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={getColor()}
                strokeWidth="8"
                strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</div>
              <div className="text-xs text-brand-orange/80">utilizzato</div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-brand-orange/80">Speso:</span>
            <span className="text-white font-bold">€{totalExpenses.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-orange/80">Budget:</span>
            <span className="text-white font-bold">€{budgetLimit.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-orange/80">Rimanente:</span>
            <span className="text-white font-bold">€{(budgetLimit - totalExpenses).toFixed(0)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Navigazione grafici
  const chartNavItems = [
    { id: 'overview', label: 'Panoramica', icon: Icon.PieChart },
    { id: 'distribution', label: 'Distribuzione', icon: Icon.BarChart3 },
    { id: 'trends', label: 'Trend', icon: Icon.TrendingUp },
    { id: 'radar', label: 'Radar', icon: Icon.Activity },
    { id: 'heatmap', label: 'Heatmap', icon: Icon.Calendar },
    { id: 'treemap', label: 'Treemap', icon: Icon.Map },
    { id: 'sankey', label: 'Flusso', icon: Icon.ArrowRightLeft },
    { id: 'gauge', label: 'Budget', icon: Icon.Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark via-brand-dark to-brand-secondary/20 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2" style={{textShadow: '0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.2)'}}>
            Analytics Dashboard
          </h1>
          <p className="text-brand-orange/80 text-sm sm:text-base">Analisi completa delle tue finanze</p>
        </div>

        {/* Statistiche principali */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-orange/80 text-xs sm:text-sm font-medium">Spese Totali</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">€{totalExpenses.toFixed(0)}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Icon.TrendingUp className="w-4 h-4 sm:w-5 sm:w-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-orange/80 text-xs sm:text-sm font-medium">Entrate Totali</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">€{totalIncome.toFixed(0)}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Icon.TrendingUp className="w-4 h-4 sm:w-5 sm:w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-brand-orange/80 text-xs sm:text-sm font-medium">Saldo</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">€{(totalIncome - totalExpenses).toFixed(0)}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Icon.Target className="w-4 h-4 sm:w-5 sm:w-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigazione grafici */}
        <div className="bg-gradient-to-br from-brand-secondary/80 to-brand-secondary/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/5 p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {chartNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedChart(item.id as any)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-xs sm:text-sm ${
                    selectedChart === item.id
                      ? 'bg-brand-orange/30 text-white shadow-lg transform scale-105'
                      : 'bg-brand-secondary/50 text-brand-orange/80 hover:bg-brand-secondary/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenuto grafici */}
        <div className="space-y-6 sm:space-y-8">
          {selectedChart === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
                  <Icon.PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Distribuzione Spese
                </h3>
                <div className="h-60 sm:h-80">
                  <Doughnut data={getDonutData()} options={donutOptions} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icon.Target className="w-5 h-5" />
                  Budget Monitor
                </h3>
                <GaugeChart />
              </div>
            </div>
          )}

          {selectedChart === 'distribution' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icon.BarChart3 className="w-5 h-5" />
                  Spese Mensili
                </h3>
                <div className="h-80">
                  <Bar data={getBarData()} options={barOptions} />
                </div>
              </div>
              
              <TreemapChart />
            </div>
          )}

          {selectedChart === 'trends' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Icon.TrendingUp className="w-5 h-5" />
                  Trend Spese (30 giorni)
                </h3>
                <div className="h-80">
                  <Line data={getLineData()} options={lineOptions} />
                </div>
              </div>
              
              <CalendarHeatmap />
            </div>
          )}

          {selectedChart === 'radar' && (
            <div className="bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Icon.Activity className="w-5 h-5" />
                Pattern di Spesa
              </h3>
              <div className="h-96">
                <Radar data={getRadarData()} options={radarOptions} />
              </div>
            </div>
          )}

          {selectedChart === 'heatmap' && (
            <CalendarHeatmap />
          )}

          {selectedChart === 'treemap' && (
            <TreemapChart />
          )}

          {selectedChart === 'sankey' && (
            <SankeyDiagram />
          )}

          {selectedChart === 'gauge' && (
            <GaugeChart />
          )}
        </div>

        {/* Dettagli categoria selezionata */}
        {selectedCategory && (
          <div className="mt-8 bg-gradient-to-br from-brand-secondary/90 to-brand-secondary/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Dettagli: {selectedCategory}</h3>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-brand-orange/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-brand-orange/80 text-sm">Spesa totale:</p>
                <p className="text-xl font-bold text-white">€{categories[selectedCategory]?.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-brand-orange/80 text-sm">Percentuale del totale:</p>
                <p className="text-xl font-bold text-white">
                  {((categories[selectedCategory] / totalExpenses) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
