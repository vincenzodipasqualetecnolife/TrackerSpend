import { useState, useCallback, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Transaction, TransactionForm } from '../../types';

export interface TransactionFilters {
  category_id?: number;
  type?: 'income' | 'expense';
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const useTransactions = (filters?: TransactionFilters, isAuthenticated: boolean = false) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadTransactions = useCallback(async (page?: number) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const targetPage = page || currentPage;
    
    try {
      const response = await ApiService.getTransactions({
        ...filters,
        page: targetPage,
        limit: filters?.limit || 20
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      if (response.data) {
        setTransactions(response.data.data);
        setTotal(response.data.total);
        setTotalPages(response.data.total_pages);
        setCurrentPage(response.data.page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle transazioni');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const createTransaction = useCallback(async (data: TransactionForm) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.createTransaction(data);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setTransactions(prev => [response.data!, ...prev]);
        return response.data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione della transazione');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransaction = useCallback(async (id: number, data: Partial<TransactionForm>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.updateTransaction(id, data);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === id ? response.data! : transaction
          )
        );
        return response.data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della transazione');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.deleteTransaction(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione della transazione');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransaction = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getTransaction(id);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento della transazione');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadTransactions = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.uploadTransactions(formData);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      // Ricarica le transazioni dopo l'upload
      await loadTransactions();
      
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'upload delle transazioni');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    loadTransactions(page);
  }, []);

  const refresh = useCallback(() => {
    loadTransactions();
  }, []);

  // Carica le transazioni quando cambiano i filtri
  useEffect(() => {
    if (filters && isAuthenticated) {
      loadTransactions();
    }
  }, [filters, isAuthenticated]);

  return {
    transactions,
    loading,
    error,
    total,
    currentPage,
    totalPages,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    uploadTransactions,
    goToPage,
    refresh,
    clearError: () => setError(null)
  };
};
