import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, Category, Budget, Goal, Alert } from '../../types';
// import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { ApiService } from '../services/api';

interface DataContextType {
  // Dati principali
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  alerts: Alert[];
  
  // Stati di caricamento
  isLoading: boolean;
  error: string | null;
  
  // Funzioni per aggiornare i dati
  refreshData: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshBudgets: () => Promise<void>;
  refreshGoals: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  
  // Funzioni per aggiungere/aggiornare dati
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: number) => void;
  
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (id: number) => void;
  
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  removeBudget: (id: number) => void;
  
  addGoal: (goal: Goal) => void;
  updateGoal: (goal: Goal) => void;
  removeGoal: (id: number) => void;
  
  // Funzioni per gli alert
  markAlertAsRead: (id: number) => Promise<void>;
  removeAlert: (id: number) => Promise<void>;
  
  // Pulisci errori
  clearError: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Stati per i dati
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Stati di caricamento
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks per transazioni e categorie
  // Temporaneamente disabilitato per evitare loop infiniti
  // const { 
  //   transactions, 
  //   loading: transactionsLoading, 
  //   error: transactionsError,
  //   refresh: refreshTransactionsHook 
  // } = useTransactions({ limit: 100 });
  
  // Stati temporanei per transazioni
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  
  const refreshTransactionsHook = useCallback(() => {
    // Temporaneamente disabilitato
  }, []);

  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    refresh: refreshCategoriesHook 
  } = useCategories();

  // Carica tutti i dati al mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Aggiorna stati di caricamento e errori
  useEffect(() => {
    setIsLoading(transactionsLoading || categoriesLoading);
    setError(transactionsError || categoriesError);
  }, [transactionsLoading, categoriesLoading, transactionsError, categoriesError]);

  // Carica tutti i dati
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadBudgets(),
        loadGoals(),
        loadAlerts()
      ]);
    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
      setError('Errore nel caricamento dei dati');
    } finally {
      setIsLoading(false);
    }
  };

  // Carica budget
  const loadBudgets = async () => {
    try {
      const response = await ApiService.getBudgets();
      if (response.data) {
        setBudgets(response.data);
      }
    } catch (error) {
      console.error('Errore nel caricamento budget:', error);
    }
  };

  // Carica obiettivi
  const loadGoals = async () => {
    try {
      const response = await ApiService.getGoals();
      if (response.data) {
        setGoals(response.data);
      }
    } catch (error) {
      console.error('Errore nel caricamento obiettivi:', error);
    }
  };

  // Carica alert
  const loadAlerts = async () => {
    try {
      // Temporaneamente disabilitato - endpoint non implementato
      // const response = await ApiService.getAlerts();
      // if (response.data) {
      //   setAlerts(response.data);
      // }
      setAlerts([]); // Per ora usa array vuoto
    } catch (error) {
      console.error('Errore nel caricamento alert:', error);
    }
  };

  // Refresh generale
  const refreshData = async () => {
    await Promise.all([
      refreshTransactionsHook(),
      refreshCategoriesHook(),
      loadBudgets(),
      loadGoals(),
      loadAlerts()
    ]);
  };

  // Refresh specifici
  const refreshTransactions = async () => {
    await refreshTransactionsHook();
  };

  const refreshCategories = async () => {
    await refreshCategoriesHook();
  };

  const refreshBudgets = async () => {
    await loadBudgets();
  };

  const refreshGoals = async () => {
    await loadGoals();
  };

  const refreshAlerts = async () => {
    // Temporaneamente disabilitato - endpoint non implementato
    setAlerts([]);
  };

  // Funzioni per transazioni
  const addTransaction = (transaction: Transaction) => {
    // Aggiorna le transazioni usando il hook
    refreshTransactionsHook();
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    // Aggiorna le transazioni usando il hook
    refreshTransactionsHook();
  };

  const removeTransaction = (id: number) => {
    // Aggiorna le transazioni usando il hook
    refreshTransactionsHook();
  };

  // Funzioni per categorie
  const addCategory = (category: Category) => {
    // Aggiorna le categorie usando il hook
    refreshCategoriesHook();
  };

  const updateCategory = (updatedCategory: Category) => {
    // Aggiorna le categorie usando il hook
    refreshCategoriesHook();
  };

  const removeCategory = (id: number) => {
    // Aggiorna le categorie usando il hook
    refreshCategoriesHook();
  };

  // Funzioni per budget
  const addBudget = (budget: Budget) => {
    setBudgets(prev => [...prev, budget]);
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => 
      prev.map(b => b.id === updatedBudget.id ? updatedBudget : b)
    );
  };

  const removeBudget = (id: number) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Funzioni per obiettivi
  const addGoal = (goal: Goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(prev => 
      prev.map(g => g.id === updatedGoal.id ? updatedGoal : g)
    );
  };

  const removeGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Funzioni per alert
  const markAlertAsRead = async (id: number) => {
    try {
      // Temporaneamente disabilitato - endpoint non implementato
      // await ApiService.markAlertAsRead(id);
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === id ? { ...alert, is_read: true } : alert
        )
      );
    } catch (error) {
      console.error('Errore nel marcare alert come letto:', error);
    }
  };

  const removeAlert = async (id: number) => {
    try {
      // Temporaneamente disabilitato - endpoint non implementato
      // await ApiService.deleteAlert(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error) {
      console.error('Errore nella rimozione alert:', error);
    }
  };

  // Pulisci errori
  const clearError = () => {
    setError(null);
  };

  const value: DataContextType = {
    // Dati
    transactions,
    categories,
    budgets,
    goals,
    alerts,
    
    // Stati
    isLoading,
    error,
    
    // Funzioni refresh
    refreshData,
    refreshTransactions,
    refreshCategories,
    refreshBudgets,
    refreshGoals,
    refreshAlerts,
    
    // Funzioni transazioni
    addTransaction,
    updateTransaction,
    removeTransaction,
    
    // Funzioni categorie
    addCategory,
    updateCategory,
    removeCategory,
    
    // Funzioni budget
    addBudget,
    updateBudget,
    removeBudget,
    
    // Funzioni obiettivi
    addGoal,
    updateGoal,
    removeGoal,
    
    // Funzioni alert
    markAlertAsRead,
    removeAlert,
    
    // Utility
    clearError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook per usare il context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData deve essere usato all\'interno di un DataProvider');
  }
  return context;
};

export default DataContext;
