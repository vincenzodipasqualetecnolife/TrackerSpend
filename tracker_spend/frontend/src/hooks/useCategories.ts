import { useState, useCallback, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Category } from '../../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getCategories();
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      if (response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle categorie');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: Partial<Category>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.createCategory(data);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setCategories(prev => [...prev, response.data!]);
        return response.data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione della categoria');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: number, data: Partial<Category>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.updateCategory(id, data);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      if (response.data) {
        setCategories(prev => 
          prev.map(category => 
            category.id === id ? response.data! : category
          )
        );
        return response.data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento della categoria');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.deleteCategory(id);
      
      if (response.error) {
        setError(response.error);
        return false;
      }
      
      setCategories(prev => prev.filter(category => category.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione della categoria');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategory = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getCategory(id);
      
      if (response.error) {
        setError(response.error);
        return null;
      }
      
      return response.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento della categoria');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoriesByType = useCallback((type: 'income' | 'expense') => {
    return categories.filter(category => category.type === type);
  }, [categories]);

  const getCategoryById = useCallback((id: number) => {
    return categories.find(category => category.id === id);
  }, [categories]);

  const refresh = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  // Carica le categorie al mount del componente
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getCategoriesByType,
    getCategoryById,
    refresh,
    clearError: () => setError(null)
  };
};
