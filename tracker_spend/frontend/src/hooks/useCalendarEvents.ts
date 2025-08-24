import { useState, useCallback, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Transaction } from '../../types';

export interface CalendarEvent {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  transaction_id?: number;
}

export const useCalendarEvents = (year: number, month: number) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calcola le date di inizio e fine del mese
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      console.log(`Loading calendar events for ${startDate} to ${endDate}`);
      
      // Carica le transazioni per il mese specificato
      const response = await ApiService.getTransactions({
        start_date: startDate,
        end_date: endDate,
        limit: 1000 // Carica tutte le transazioni del mese
      });
      
      if (response.error) {
        setError(response.error);
        return;
      }
      
      console.log('Full API response:', response);
      
      // Gestisci sia la struttura PaginatedResponse che quella custom del backend
      let transactions: Transaction[] = [];
      
      if (response.data) {
        if ('transactions' in response.data) {
          // Struttura custom del backend: {transactions: [...], count: number, success: boolean}
          transactions = (response.data as any).transactions || [];
        } else if ('data' in response.data) {
          // Struttura PaginatedResponse standard: {data: [...], total: number, ...}
          transactions = (response.data as any).data || [];
        }
      }
      
      console.log(`Loaded ${transactions.length} transactions for calendar`);
      if (transactions.length > 0) {
        console.log('Sample transaction:', transactions[0]);
      }
      
             // Converti le transazioni in eventi del calendario
       const calendarEvents: CalendarEvent[] = transactions.map((transaction: Transaction) => {
         // Converti la data da "Thu, 14 Aug 2025 00:00:00 GMT" a "2025-08-14"
         let dateString = transaction.transaction_date;
         if (dateString && typeof dateString === 'string') {
           try {
             const date = new Date(dateString);
             if (!isNaN(date.getTime())) {
               dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
             }
           } catch (e) {
             console.warn('Errore nella conversione della data:', dateString, e);
           }
         }
         
         return {
           date: dateString,
           amount: Math.abs(transaction.amount),
           type: transaction.type,
           description: transaction.description,
           transaction_id: transaction.id
         };
       });
      
      setEvents(calendarEvents);
      console.log(`Converted to ${calendarEvents.length} calendar events`);
      
    } catch (err) {
      console.error('Error loading calendar events:', err);
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli eventi');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const refresh = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  // Carica gli eventi quando cambiano anno o mese
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Funzione per ottenere eventi per una data specifica
  const getEventsForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  }, [events]);

  // Funzione per aggiungere un nuovo evento (transazione)
  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'transaction_id'>) => {
    try {
      // Crea una nuova transazione nel database
      const transactionData = {
        amount: event.type === 'expense' ? -event.amount : event.amount,
        description: event.description,
        transaction_date: event.date,
        type: event.type,
        category: 'Altro' // Categoria di default
      };
      
      // TODO: Implementare endpoint per creare transazioni
      // Per ora aggiungiamo solo in memoria
      const newEvent: CalendarEvent = {
        ...event,
        transaction_id: Date.now() // ID temporaneo
      };
      
      setEvents(prev => [...prev, newEvent]);
      return true;
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta dell\'evento');
      return false;
    }
  }, []);

  return {
    events,
    loading,
    error,
    loadEvents,
    refresh,
    getEventsForDate,
    addEvent,
    clearError: () => setError(null)
  };
};
