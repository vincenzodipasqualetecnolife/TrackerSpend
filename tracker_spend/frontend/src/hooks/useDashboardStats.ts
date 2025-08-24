import { useState, useCallback, useEffect } from 'react';
import { ApiService } from '../services/api';
import { DashboardStats, CategoryStats, SpendingTrend } from '../../types';

export const useDashboardStats = (year: number, month: number, isAuthenticated: boolean = false) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    console.log('loadStats called - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('loadStats - user not authenticated, skipping');
      setLoading(false);
      return;
    }
    
    console.log('loadStats - starting to load stats');
    setLoading(true);
    setError(null);
    
    try {
      // Carica le statistiche generali (totali)
      const generalResponse = await ApiService.getGeneralStats();
      
      if (generalResponse.error) {
        setError(generalResponse.error);
        return;
      }
      
      if (generalResponse.data) {
        console.log('loadStats - setting stats:', generalResponse.data);
        setStats(generalResponse.data as any);
      } else {
        console.log('loadStats - no data in response');
      }

      // Carica le statistiche per categoria
      const categoryResponse = await ApiService.getCategoryStats();
      
      if (categoryResponse.error) {
        console.warn('Errore nel caricamento delle statistiche per categoria:', categoryResponse.error);
        // Non blocchiamo il caricamento se falliscono le statistiche per categoria
      } else if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
        setCategoryStats(categoryResponse.data);
      } else if (categoryResponse.data && typeof categoryResponse.data === 'object' && 'data' in categoryResponse.data && Array.isArray((categoryResponse.data as any).data)) {
        // Gestisce il caso in cui l'API restituisce {data: [...], total: number}
        setCategoryStats((categoryResponse.data as any).data);
      } else {
        console.warn('Formato dati statistiche categoria non valido:', categoryResponse.data);
        setCategoryStats([]);
      }
      
      // Carica le tendenze di spesa (per il grafico)
      const trendsResponse = await ApiService.getSpendingTrends(6); // Ultimi 6 mesi
      
      if (trendsResponse.error) {
        console.warn('Errore nel caricamento delle tendenze:', trendsResponse.error);
      } else if (trendsResponse.data && Array.isArray(trendsResponse.data)) {
        setSpendingTrends(trendsResponse.data);
      } else if (trendsResponse.data && typeof trendsResponse.data === 'object' && 'data' in trendsResponse.data && Array.isArray((trendsResponse.data as any).data)) {
        setSpendingTrends((trendsResponse.data as any).data);
      } else {
        console.warn('Formato dati tendenze non valido:', trendsResponse.data);
        setSpendingTrends([]);
      }
      
      // Debug log
      console.log('Category response:', categoryResponse);
      console.log('Category stats state:', categoryStats);
      console.log('Trends response:', trendsResponse);
    } catch (err) {
      console.error('loadStats - error:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche');
    } finally {
      console.log('loadStats - finished loading');
      setLoading(false);
    }
  };

  const refresh = useCallback(() => {
    loadStats();
  }, [loadStats]);

  // Carica le statistiche quando cambiano anno o mese o autenticazione
  useEffect(() => {
    console.log('useDashboardStats useEffect triggered - isAuthenticated:', isAuthenticated);
    
    if (isAuthenticated) {
      // Carica immediatamente le statistiche
      loadStats();
    } else {
      // Reset delle statistiche quando non autenticato
      setStats(null);
      setCategoryStats([]);
      setSpendingTrends([]);
    }
  }, [year, month, isAuthenticated]);

  // Calcola statistiche aggiuntive
  const calculatedStats = stats ? {
    ...stats,
    // Calcola la percentuale di variazione rispetto al mese precedente
    incomeChange: stats.monthly_trend || 0,
    expenseChange: stats.monthly_trend || 0,
    // Calcola il saldo netto
    netBalance: stats.total_income - stats.total_expenses,
    // Calcola la percentuale di spesa rispetto alle entrate
    expenseRatio: stats.total_income > 0 ? (stats.total_expenses / stats.total_income) * 100 : 0,
    // Calcola la media giornaliera
    dailyAverage: stats.total_transactions > 0 ? stats.total_expenses / 30 : 0
  } : null;

  // Filtra le statistiche per categoria per tipo
  const incomeCategories = Array.isArray(categoryStats) ? categoryStats.filter(cat => cat.category_type === 'income') : [];
  const expenseCategories = Array.isArray(categoryStats) ? categoryStats.filter(cat => cat.category_type === 'expense') : [];

  // Top 5 categorie di spesa
  const topExpenseCategories = expenseCategories
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 5);

  // Top 5 categorie di entrata
  const topIncomeCategories = incomeCategories
    .sort((a, b) => b.total_amount - a.total_amount)
    .slice(0, 5);

  return {
    stats: calculatedStats,
    categoryStats,
    spendingTrends,
    incomeCategories,
    expenseCategories,
    topExpenseCategories,
    topIncomeCategories,
    loading,
    error,
    loadStats,
    refresh,
    clearError: () => setError(null)
  };
};
