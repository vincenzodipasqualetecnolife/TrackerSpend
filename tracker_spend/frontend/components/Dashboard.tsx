
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart } from 'recharts';
import { useApiConnectionWithAuth } from '../src/services/api';
import { useDashboardStats } from '../src/hooks/useDashboardStats';
import { useUserProfile } from '../src/hooks/useUserProfile';
import { authService } from '../src/services/auth';
import { ApiService } from '../src/services/api';
import { formatCurrency, formatPercentage } from '../src/utils/formatters';
import { Transaction } from '../types';
import PageHeader from './PageHeader';
import LogoMark from './LogoMark';
import Card from './Card';
import FlatButton from './FlatButton';
import ActionButton from './ActionButton';
import Calendar from './Calendar';
import StatsCard from './StatsCard';
import NavigationTabs from './NavigationTabs';
import CategoryList from './CategoryList';
import LinkedAccountsSection from './LinkedAccountsSection';


interface DashboardProps {
  onNavigateToSubPage?: (subPage: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToSubPage }) => {
  const { isConnected, isAuthenticated, isLoading } = useApiConnectionWithAuth();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  
  // Hooks per caricare i dati
  const { 
    stats, 
    categoryStats, 
    spendingTrends,
    topExpenseCategories, 
    topIncomeCategories,
    loading: statsLoading, 
    error: statsError, 
    refresh: refreshStats 
  } = useDashboardStats(currentYear, currentMonth, isAuthenticated);

  // Hook per il profilo utente
  const { profile: userProfile, loading: profileLoading } = useUserProfile();
  
  // Debug log per vedere i dati
  console.log('Dashboard stats loading:', statsLoading);
  console.log('Dashboard stats:', stats);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    const saved = localStorage.getItem('balanceHidden');
    return saved ? JSON.parse(saved) : false;
  });

  // Carica le transazioni
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      loadTransactions();
    }
  }, [isConnected, isAuthenticated]);

  const loadTransactions = async () => {
    if (!isConnected || !isAuthenticated) return;
    
    setTransactionsLoading(true);
    try {
      const response = await ApiService.getTransactions({ limit: 10 });
      if (response.data) {
        // API client already unwraps top-level {data: ...}
        const items = Array.isArray((response.data as any).data) ? (response.data as any).data : response.data;
        setTransactions(items || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactionsError('Errore nel caricamento delle transazioni');
    } finally {
      setTransactionsLoading(false);
    }
  };



  // Prepara i dati per i grafici
  const monthlyData = React.useMemo(() => {
    if (!spendingTrends || spendingTrends.length === 0) {
      return [];
    }
    
    // Usa i dati reali dal backend
    return spendingTrends.map(trend => ({
      name: trend.month,
      spesa: trend.total_expenses,
      media: spendingTrends.reduce((sum, t) => sum + t.total_expenses, 0) / spendingTrends.length
    }));
  }, [spendingTrends]);

  const pieChartData = React.useMemo(() => {
    return topExpenseCategories.map(cat => ({
      name: cat.category_name,
      value: cat.total_amount
    }));
  }, [topExpenseCategories]);

  // Gestisce l'oscuramento del saldo
  const toggleBalanceVisibility = () => {
    const newValue = !isBalanceHidden;
    setIsBalanceHidden(newValue);
    localStorage.setItem('balanceHidden', JSON.stringify(newValue));
  };

  // Formatta il saldo in base alla visibilità
  const formatBalance = (amount: number) => {
    if (isBalanceHidden) {
      return '••••••••';
    }
    return formatCurrency(amount);
  };



  // Connection status component
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-brand-peach/70">Connessione al server...</div>
      </div>
    );
  }

  // Loading skeleton per le statistiche
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-brand-secondary border border-brand-medium rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-brand-dark/30 rounded mb-2"></div>
              <div className="h-8 bg-brand-dark/30 rounded"></div>
            </div>
          ))}
        </div>
        <div className="bg-brand-secondary border border-brand-medium rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-brand-dark/30 rounded mb-4"></div>
          <div className="h-32 bg-brand-dark/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="bg-brand-orange/10 border border-brand-orange/30 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-brand-orange font-medium">Server non connesso</span>
          </div>
          <p className="text-brand-peach/70 text-sm mt-2">
            Assicurati che l'app Flutter sia in esecuzione e che il server API sia attivo sulla porta 3001.
          </p>
        </div>
      </div>
    );
  }

  // Mostra errori se presenti
  if (statsError || transactionsError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-500 font-medium">Errore nel caricamento dei dati</span>
          </div>
          <p className="text-red-500/70 text-sm mt-2">
            {statsError || transactionsError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto space-y-4 sm:space-y-6 px-2 sm:px-3">
      <PageHeader
        title="Dashboard"
        subtitle="Panoramica finanziaria"
        showLogo={true}
      />

      <NavigationTabs
        activeTab="dashboard"
        onTabChange={(tab) => {
          if (tab === 'transactions') {
            onNavigateToSubPage?.('transaction-list');
          } else if (tab === 'calendar') {
            onNavigateToSubPage?.('calendar');
          }
        }}
        tabs={[
          {
            id: 'dashboard',
            label: 'Panoramica',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )
          },
          {
            id: 'transactions',
            label: 'Transazioni',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )
          },
          {
            id: 'calendar',
            label: 'Calendario',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )
          },

        ]}
      />

      {/* Messaggio di benvenuto */}
      {userProfile && (
        <div className="bg-brand-secondary border border-brand-medium rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-peach/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-brand-peach" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-brand-peach truncate">
                Benvenuto, {userProfile.first_name && userProfile.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}` 
                  : userProfile.first_name 
                  ? userProfile.first_name 
                  : userProfile.username}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-brand-peach/80 truncate">
                {new Date().toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary: mostra solo il Saldo come primo elemento */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
        {/* Box del Saldo Completo */}
        <div className="bg-brand-secondary border border-brand-medium rounded-xl p-3 sm:p-4 md:p-6 shadow-lg relative overflow-hidden">
          {/* Effetto di sfondo decorativo sottile */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-peach/3 via-transparent to-brand-orange/3"></div>
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-brand-peach/5 rounded-full -translate-y-8 sm:-translate-y-12 md:-translate-y-16 translate-x-8 sm:translate-x-12 md:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-brand-orange/5 rounded-full translate-y-8 sm:translate-y-10 md:translate-y-12 -translate-x-8 sm:-translate-x-10 md:-translate-x-12"></div>
          
          <div className="relative z-10">
            {/* Header con icona e titolo */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-brand-peach/20 border border-brand-peach/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-brand-peach truncate">Saldo Totale</h3>
                  <p className="text-xs sm:text-sm text-brand-peach/80 truncate">Aggiornato oggi</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                {/* Toggle per oscurare il saldo */}
                <button
                  onClick={toggleBalanceVisibility}
                  className="p-1.5 sm:p-2 rounded-lg bg-brand-dark/30 border border-brand-medium hover:bg-brand-medium/30 transition-colors"
                  title={isBalanceHidden ? "Mostra saldo" : "Nascondi saldo"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-brand-peach" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isBalanceHidden ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    )}
                  </svg>
                </button>
                
                {/* Indicatore di trend */}
                <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  (stats?.net_amount || 0) >= 0 
                    ? 'bg-brand-peach/20 text-brand-peach border border-brand-peach/30' 
                    : 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
                }`}>
                  <span>{(stats?.net_amount || 0) >= 0 ? '↗' : '↘'}</span>
                  <span className="hidden sm:inline">{(stats?.net_amount || 0) >= 0 ? '+0%' : '-0%'}</span>
                </div>
              </div>
            </div>

            {/* Saldo principale */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 break-words">
                {formatBalance(stats?.net_amount || 0)}
              </div>
              <p className={`text-xs sm:text-sm font-medium ${
                (stats?.net_amount || 0) >= 0 ? 'text-brand-peach' : 'text-brand-orange'
              }`}>
                {(stats?.net_amount || 0) >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
              </p>
            </div>

            {/* Dettagli entrate e uscite */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              {/* Entrate */}
              <div className="bg-brand-dark/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-brand-medium">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-green-500/20 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-brand-peach/80 truncate">Entrate</span>
                </div>
                <div className="text-sm sm:text-lg md:text-xl font-bold text-green-400 break-words">
                  {isBalanceHidden ? '••••••' : formatCurrency(stats?.total_income || 0)}
                </div>
                <div className="text-xs text-green-400/70 mt-1 hidden sm:block">
                  {stats?.total_income && stats?.total_expenses ? 
                    `+${formatPercentage((stats.total_income / (stats.total_income + Math.abs(stats.total_expenses))) * 100)} del totale` : 
                    '0% del totale'
                  }
                </div>
              </div>

              {/* Uscite */}
              <div className="bg-brand-dark/30 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 border border-brand-medium">
                <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-red-500/20 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-brand-peach/80 truncate">Uscite</span>
                </div>
                <div className="text-sm sm:text-lg md:text-xl font-bold text-red-400 break-words">
                  {isBalanceHidden ? '••••••' : formatCurrency(Math.abs(stats?.total_expenses || 0))}
                </div>
                <div className="text-xs text-red-400/70 mt-1 hidden sm:block">
                  {stats?.total_income && stats?.total_expenses ? 
                    `${formatPercentage((Math.abs(stats.total_expenses) / (stats.total_income + Math.abs(stats.total_expenses))) * 100)} del totale` : 
                    '0% del totale'
                  }
                </div>
              </div>
            </div>

            {/* Statistiche aggiuntive */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-brand-medium/30">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-peach rounded-full flex-shrink-0"></div>
                  <span className="text-brand-peach/80 truncate">Transazioni questo mese</span>
                </div>
                <span className="font-semibold text-white ml-2">{stats?.total_transactions || 0}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs sm:text-sm mt-1.5 sm:mt-2">
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-orange rounded-full flex-shrink-0"></div>
                  <span className="text-brand-peach/80 truncate">Media giornaliera</span>
                </div>
                <span className="font-semibold text-white ml-2 break-words">
                  {isBalanceHidden ? '••••••' : formatCurrency(stats?.avg_expense || 0)}
                </span>
              </div>
            </div>

            {/* Pulsanti per navigazione */}
            <div className="mt-3 sm:mt-4 space-y-2">
              <button 
                onClick={() => onNavigateToSubPage?.('analytics')}
                className="w-full bg-gradient-to-r from-brand-peach to-brand-orange text-white py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-brand-peach/90 hover:to-brand-orange/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-xs sm:text-sm md:text-base"
              >
                Vedi Dettagli Completi
              </button>
              
              <button 
                onClick={() => onNavigateToSubPage?.('predictions')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-500/90 hover:to-purple-600/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-xs sm:text-sm md:text-base"
              >
                🎯 Simulazioni e Predizioni
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Main Chart */}
      <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
        <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-brand-peach flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
            {/* Line chart fineline icon (monochrome) */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M6 15l4-4 3 3 5-6"/>
            </svg>
            <span className="truncate">Panoramica Finanziaria</span>
          </h2>
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            variant="primary"
            onClick={() => onNavigateToSubPage?.('analytics')}
          />
        </div>
        
        {statsLoading ? (
          <div className="h-40 sm:h-48 md:h-64 flex items-center justify-center">
            <div className="text-brand-peach/70 animate-pulse text-xs sm:text-sm md:text-base">Caricamento grafico...</div>
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="h-40 sm:h-48 md:h-64 flex items-center justify-center">
            <div className="text-brand-peach/70 text-xs sm:text-sm md:text-base text-center px-4">
              <div className="mb-2 text-lg sm:text-xl">📊</div>
              <div>Nessun dato disponibile</div>
              <div className="text-xs mt-1">Carica le tue transazioni per vedere il grafico</div>
            </div>
          </div>
        ) : (
          <div className="h-56 sm:h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorSpesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DB9F75" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#DB9F75" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2F3A32', 
                    border: '1px solid #545748', 
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#DB9F75', fontWeight: 'bold' }}
                />
                <XAxis dataKey="name" tick={{ fill: '#DB9F75', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#DB9F75', fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 100', 'dataMax + 100']}/>
                <Area type="monotone" dataKey="spesa" stroke="#DB9F75" strokeWidth={3} fillOpacity={1} fill="url(#colorSpesa)" />
                <Line type="monotone" dataKey="media" stroke="#545748" strokeDasharray="5 5" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-brand-peach/80">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-brand-peach"></div>
              <span>Spese</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-brand-medium"></div>
              <span>Media</span>
            </div>
          </div>
          <FlatButton 
            variant="secondary" 
            size="sm"
            onClick={() => onNavigateToSubPage?.('analytics')}
          >
            Vedi Tutte le Analisi
          </FlatButton>
        </div>
      </Card>

      {/* Category Breakdown */}
      {topExpenseCategories.length > 0 && (
        <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
          <CategoryList
            categories={topExpenseCategories.map(cat => ({
              name: cat.category_name,
              amount: cat.total_amount
            }))}
            maxItems={5}
          />
        </Card>
      )}
      
      <Card className="p-3 sm:p-4 md:p-6" variant="elevated">
        <LinkedAccountsSection
          accounts={[]} // Per ora vuoto, verrà popolato quando implementeremo i conti collegati
          onManageAccounts={() => onNavigateToSubPage?.('linked-accounts')}
          onSettings={() => onNavigateToSubPage?.('advanced-settings')}
        />
      </Card>



    </div>
  );
};

export default Dashboard;
