import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from './PageHeader';
import NavigationTabs from './NavigationTabs';
import LogoMark from './LogoMark';
import Calendar from './Calendar';
import Card from './Card';
import { useApiConnection } from '../src/services/api';
import { useCalendarEvents } from '../src/hooks/useCalendarEvents';

// Usa il tipo CalendarEvent dal hook
import { CalendarEvent } from '../src/hooks/useCalendarEvents';

interface CalendarStats {
  totalEvents: number;
  totalIncome: number;
  totalExpenses: number;
  averagePerDay: number;
  mostActiveDay: string;
  mostExpensiveDay: string;
}

const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useApiConnection();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [stats, setStats] = useState<CalendarStats | null>(null);

  // Usa il hook personalizzato per caricare gli eventi reali
  const { 
    events, 
    loading: isLoading, 
    error, 
    refresh 
  } = useCalendarEvents(selectedDate.getFullYear(), selectedDate.getMonth() + 1);

  const calculateStats = (eventList: CalendarEvent[]) => {
    const totalEvents = eventList.length;
    const totalIncome = eventList.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = eventList.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const averagePerDay = totalExpenses / 30; // Media mensile

    // Trova il giorno più attivo (più eventi)
    const dayCounts: { [key: string]: number } = {};
    eventList.forEach(event => {
      const day = event.date;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Trova il giorno più costoso
    const dayExpenses: { [key: string]: number } = {};
    eventList.filter(e => e.type === 'expense').forEach(event => {
      const day = event.date;
      dayExpenses[day] = (dayExpenses[day] || 0) + event.amount;
    });
    const mostExpensiveDay = Object.entries(dayExpenses).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    setStats({
      totalEvents,
      totalIncome,
      totalExpenses,
      averagePerDay,
      mostActiveDay,
      mostExpensiveDay
    });
  };

  const filteredEvents = events.filter(event => {
    if (filterType !== 'all' && event.type !== filterType) return false;
    // Per ora rimuoviamo il filtro per categoria dato che non è disponibile
    return true;
  });

  // Ricalcola le statistiche quando cambiano gli eventi o i filtri
  useEffect(() => {
    if (events.length > 0) {
      calculateStats(filteredEvents);
    } else {
      // Reset delle statistiche se non ci sono eventi
      setStats({
        totalEvents: 0,
        totalIncome: 0,
        totalExpenses: 0,
        averagePerDay: 0,
        mostActiveDay: 'N/A',
        mostExpensiveDay: 'N/A'
      });
    }
  }, [filterType, filterCategory, events]);

  const getEventsForDate = (date: string) => {
    return filteredEvents.filter(event => event.date === date);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-3 sm:px-4">
      <PageHeader
        title="Calendario"
        subtitle="Visualizza eventi e transazioni"
        showLogo={true}
      />

      <NavigationTabs
        activeTab="calendar"
        onTabChange={(tab) => {
          if (tab === 'dashboard') {
            navigate('/dashboard');
          } else if (tab === 'transactions') {
            navigate('/transactions');
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
          }
        ]}
      />

      {/* Statistiche rapide - Versione dinamica e centrata */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Card className="p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-brand-peach/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-brand-peach" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-brand-peach text-center w-full">{stats.totalEvents}</div>
              <div className="text-xs text-brand-peach/80 uppercase tracking-wide text-center w-full">Eventi Totali</div>
            </div>
          </Card>
          
          <Card className="p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-brand-peach/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-brand-peach" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-lg sm:text-2xl font-bold text-brand-peach text-center w-full">€{stats.averagePerDay.toFixed(2)}</div>
              <div className="text-xs text-brand-peach/80 uppercase tracking-wide text-center w-full">Media/Giorno</div>
            </div>
          </Card>
        </div>
      )}

      {/* Filtri e controlli */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
          {/* Modalità visualizzazione */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80">Visualizza:</span>
            <div className="flex bg-brand-dark rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-brand-peach text-white'
                      : 'text-brand-peach/80 hover:text-brand-peach'
                  }`}
                >
                  {mode === 'month' ? 'Mese' : mode === 'week' ? 'Settimana' : 'Giorno'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro tipo */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80">Tipo:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="bg-brand-dark border border-brand-medium rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-peach"
            >
              <option value="all">Tutti</option>
              <option value="income">Entrate</option>
              <option value="expense">Uscite</option>
            </select>
          </div>

          {/* Filtro categoria */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80">Categoria:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-brand-dark border border-brand-medium rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm text-white focus:outline-none focus:border-brand-peach"
            >
              {['Tutte', 'Lavoro', 'Alimentari', 'Trasporti', 'Ristoranti', 'Shopping', 'Bollette', 'Intrattenimento'].map(category => (
                <option key={category} value={category === 'Tutte' ? 'all' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Calendario principale */}
      <Card className="p-3 sm:p-4 md:p-6">
        <Calendar />
      </Card>

      {/* Eventi del giorno selezionato - Versione compatta */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-brand-peach">
            Eventi del {formatDate(selectedDate.toISOString().split('T')[0])}
          </h3>
          <span className="text-xs text-brand-peach/60 bg-brand-dark/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            {getEventsForDate(selectedDate.toISOString().split('T')[0]).length} eventi
          </span>
        </div>
        
        {isLoading ? (
          <div className="text-center py-3 sm:py-4">
            <div className="text-brand-peach/70 text-xs sm:text-sm">Caricamento...</div>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
            {getEventsForDate(selectedDate.toISOString().split('T')[0]).length === 0 ? (
              <div className="text-center py-3 sm:py-4 text-brand-peach/70 text-xs sm:text-sm">
                Nessun evento
              </div>
            ) : (
              getEventsForDate(selectedDate.toISOString().split('T')[0]).map((event, index) => (
                <div key={event.transaction_id || index} className="flex items-center justify-between p-1.5 sm:p-2 bg-brand-dark/20 rounded-lg border border-brand-medium/50 hover:bg-brand-dark/30 transition-colors">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
                      event.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white text-xs sm:text-sm truncate">{event.description}</div>
                      <div className="text-xs text-brand-peach/60">{event.type === 'income' ? 'Entrata' : 'Uscita'}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-xs sm:text-sm flex-shrink-0 ml-1 sm:ml-2 ${
                    event.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {event.type === 'income' ? '+' : '-'}€{event.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Insights e suggerimenti */}
      {stats && (
        <Card className="p-3 sm:p-4 md:p-6">
          <h3 className="text-base sm:text-lg font-bold text-brand-peach mb-3 sm:mb-4">Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-brand-dark/30 p-3 sm:p-4 rounded-lg border border-brand-medium">
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-peach" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium text-white text-sm sm:text-base">Giorno più attivo</span>
              </div>
              <p className="text-brand-peach/80 text-sm">{formatDate(stats.mostActiveDay)}</p>
            </div>
            
            <div className="bg-brand-dark/30 p-3 sm:p-4 rounded-lg border border-brand-medium">
              <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium text-white text-sm sm:text-base">Giorno più costoso</span>
              </div>
              <p className="text-brand-peach/80 text-sm">{formatDate(stats.mostExpensiveDay)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CalendarPage;
