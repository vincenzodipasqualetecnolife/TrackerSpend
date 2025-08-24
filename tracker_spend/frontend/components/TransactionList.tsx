import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../src/utils/formatters';
import { Transaction, Category } from '../types';
import PageHeader from './PageHeader';
import NavigationTabs from './NavigationTabs';
import LogoMark from './LogoMark';
import Card from './Card';
import { useApiConnectionWithAuth, ApiService } from '../src/services/api';

const TransactionList: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, isAuthenticated } = useApiConnectionWithAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentYearMonth, setCurrentYearMonth] = useState<string>('2025-08');
  
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'all'>('all');

  // Stato per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(5);

  // Stato locale per i dati
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memo per le categorie per evitare re-render non necessari
  const memoizedCategories = useMemo(() => categories, [categories]);

  // Carica i dati
  useEffect(() => {
    if (isConnected && isAuthenticated) {
      loadTransactions();
      // Carica le categorie solo se non sono già state caricate
      if (categories.length === 0) {
        loadCategories();
      }
    }
  }, [isConnected, isAuthenticated]);

  const loadTransactions = async () => {
    if (!isConnected || !isAuthenticated) return;
    
    setLoading(true);
    try {
      console.log('Loading transactions...');
      const response = await ApiService.getTransactions({ limit: 50 });
      console.log('Transactions response:', response);
      
      if (response.data) {
        // Gestisci sia la struttura PaginatedResponse che quella custom del backend
        let transactionsData: Transaction[] = [];
        if ('transactions' in response.data) {
          // Struttura custom del backend: {transactions: [...], count: number, success: boolean}
          transactionsData = (response.data as any).transactions || [];
        } else if ('data' in response.data) {
          // Struttura PaginatedResponse standard: {data: [...], total: number, ...}
          transactionsData = (response.data as any).data || [];
        }
        console.log('Setting transactions:', transactionsData.length, 'transactions');
        setTransactions(transactionsData);
      } else {
        console.log('No transactions data in response');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Errore nel caricamento delle transazioni');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!isConnected || !isAuthenticated) return;
    
    try {
      console.log('Loading categories...');
      const response = await ApiService.getCategories();
      console.log('Categories response:', response);
      
      if (response.data) {
        console.log('Setting categories:', response.data.length, 'categories');
        // Usa setTimeout per evitare blocchi del UI durante il caricamento
        setTimeout(() => {
          setCategories(response.data);
        }, 100);
      } else {
        console.log('No categories data in response');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Funzioni per la navigazione del mese
  const navigateMonth = (direction: 'prev' | 'next') => {
    setIsChangingMonth(true);
    
    setTimeout(() => {
      const [year, month] = currentYearMonth.split('-').map(Number);
      let newYear = year;
      let newMonth = month;

      if (direction === 'prev') {
        if (month === 1) {
          newMonth = 12;
          newYear = year - 1;
        } else {
          newMonth = month - 1;
        }
      } else {
        if (month === 12) {
          newMonth = 1;
          newYear = year + 1;
        } else {
          newMonth = month + 1;
        }
      }

      const newYearMonth = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
      setCurrentYearMonth(newYearMonth);
      
      setTimeout(() => {
        setIsChangingMonth(false);
      }, 200);
    }, 150);
  };

  const formatMonthDisplay = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const monthNames = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  // Funzione per ottenere il nome del mese in italiano
  const getMonthName = (date: Date): string => {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[date.getMonth()];
  };

  // Filtra e ordina le transazioni
  const filteredAndSortedTransactions = useMemo(() => {
    console.log('Filtering transactions:', transactions.length, 'total transactions');
    console.log('Sample transaction:', transactions[0]);
    
    // Se non ci sono transazioni, ritorna array vuoto
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }
    
    return Array.isArray(transactions) ? transactions
      .filter(transaction => {
        // Filtro per ricerca
        if (searchTerm && 
            !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(transaction.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filtro per mese
        let transactionYearMonth = '';
        try {
          // Converti la data da "Thu, 14 Aug 2025 00:00:00 GMT" a "2025-08"
          const date = new Date(transaction.transaction_date);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            transactionYearMonth = `${year}-${month}`;
          } else {
            // Fallback: prova a estrarre dalla stringa
            transactionYearMonth = transaction.transaction_date.substring(0, 7);
          }
        } catch (e) {
          // Fallback: prova a estrarre dalla stringa
          transactionYearMonth = transaction.transaction_date.substring(0, 7);
        }
        
        console.log('Transaction date:', transaction.transaction_date, 'YearMonth:', transactionYearMonth, 'Current:', currentYearMonth);
        if (transactionYearMonth !== currentYearMonth) return false;
        
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'date':
            comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
            break;
          case 'amount':
            comparison = a.amount - b.amount;
            break;
          case 'category':
            comparison = (a.category_name || '').localeCompare(b.category_name || '');
            break;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      }) : [];
  }, [transactions, searchTerm, currentYearMonth, sortBy, sortOrder]);

  // Calcola le transazioni paginate
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    return Array.isArray(filteredAndSortedTransactions) ? 
      filteredAndSortedTransactions.slice(startIndex, endIndex) : [];
  }, [filteredAndSortedTransactions, currentPage, transactionsPerPage]);

  // Calcola il numero totale di pagine
  const totalPages = useMemo(() => {
    return Array.isArray(filteredAndSortedTransactions) ? 
      Math.ceil(filteredAndSortedTransactions.length / transactionsPerPage) : 0;
  }, [filteredAndSortedTransactions, transactionsPerPage]);

  // Funzione per esportare in Excel
  const exportToExcel = () => {
    if (!Array.isArray(filteredAndSortedTransactions) || filteredAndSortedTransactions.length === 0) {
      alert('Nessuna transazione da esportare');
      return;
    }

    // Prepara i dati per l'esportazione
    const data = filteredAndSortedTransactions.map(transaction => ({
      'Data': formatDate(transaction.transaction_date),
      'Descrizione': transaction.description,
      'Categoria': transaction.category_name || 'Non categorizzato',
      'Tipo': transaction.type === 'income' ? 'Entrata' : 'Uscita',
      'Importo': Number(transaction.amount || 0).toFixed(2),
      'Importo (€)': `€${Number(transaction.amount || 0).toFixed(2)}`
    }));

    // Crea il CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Crea e scarica il file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transazioni_${currentYearMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcola le statistiche
  const stats = useMemo(() => {
    const totalIncome = Array.isArray(filteredAndSortedTransactions) ? filteredAndSortedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) : 0;
    
    const totalExpenses = Array.isArray(filteredAndSortedTransactions) ? filteredAndSortedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) : 0;
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  }, [filteredAndSortedTransactions]);

  const getCategoryIcon = (categoryName: string) => {
    const category = Array.isArray(categories) ? categories.find(cat => cat.name === categoryName) : null;
    return category?.icon || '💰';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = Array.isArray(categories) ? categories.find(cat => cat.name === categoryName) : null;
    return category?.color || '#6B7280';
  };

  // Gestisce il cambio di categoria
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  // Gestisce il cambio di tipo
  const handleTypeChange = (type: 'income' | 'expense' | 'all') => {
    setSelectedType(type);
  };

  // Ricarica i dati quando cambiano i filtri
  useEffect(() => {
    if (isConnected) {
      loadTransactions();
    }
  }, [selectedCategory, selectedType, isConnected]);

  // Reset della pagina quando cambiano i filtri
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentYearMonth, sortBy, sortOrder]);

  // Mostra errori se presenti
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-3">
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-500 font-medium">Errore nel caricamento delle transazioni</span>
          </div>
          <p className="text-red-500/70 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-3 sm:space-y-4 md:space-y-6 px-2 sm:px-3 md:px-4">
      <PageHeader
        title="Transazioni"
        subtitle="Gestione movimenti"
        showLogo={true}
      />

      <div className="overflow-x-auto scrollbar-hide">
        <NavigationTabs
          activeTab="transactions"
          onTabChange={(tab) => {
            if (tab === 'dashboard') {
              navigate('/dashboard');
            } else if (tab === 'calendar') {
              navigate('/calendar');
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
      </div>

      {/* Statistiche responsive - Grid ottimizzato */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 w-full">
        <div className="bg-brand-dark/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-brand-medium min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80 truncate">Transazioni</span>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-blue-400 break-words">
            {Array.isArray(filteredAndSortedTransactions) ? filteredAndSortedTransactions.length : 0}
          </div>
        </div>
        
        <div className="bg-brand-dark/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-brand-medium min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80 truncate">Categorie</span>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-purple-400 break-words">
            {Array.isArray(filteredAndSortedTransactions) ? 
              new Set(filteredAndSortedTransactions.map(t => t.category_name)).size : 0}
          </div>
        </div>
        
        <div className="bg-brand-dark/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-brand-medium min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80 truncate">Totale</span>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-orange-400 break-words">
            {Array.isArray(filteredAndSortedTransactions) ? 
              formatCurrency(filteredAndSortedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)) : '€0,00'}
          </div>
        </div>
        
        <div className="bg-brand-dark/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-brand-medium min-h-[80px] sm:min-h-[90px] flex flex-col justify-center">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-medium text-brand-peach/80 truncate">Media</span>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-green-400 break-words">
            {Array.isArray(filteredAndSortedTransactions) && filteredAndSortedTransactions.length > 0 ? 
              formatCurrency(filteredAndSortedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0) / filteredAndSortedTransactions.length) : '€0,00'}
          </div>
        </div>
      </div>

      {/* Filtri e controlli - Layout responsive ottimizzato */}
      <div className="bg-brand-secondary border border-brand-medium rounded-lg p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Barra di ricerca - Full width */}
          <div className="w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca transazioni..."
              className="w-full bg-brand-dark border border-brand-medium rounded-lg px-3 py-2.5 sm:py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach text-sm sm:text-base"
            />
          </div>

          {/* Controlli secondari - Layout responsive */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Navigazione mese */}
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={() => navigateMonth('prev')}
                className="bg-brand-dark border border-brand-medium rounded-lg p-2 sm:p-2.5 text-brand-peach hover:bg-brand-dark/80 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white font-medium px-3 py-2 sm:py-2.5 bg-brand-dark/50 rounded-lg text-sm sm:text-base min-w-[120px] text-center">
                {formatMonthDisplay(currentYearMonth)}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="bg-brand-dark border border-brand-medium rounded-lg p-2 sm:p-2.5 text-brand-peach hover:bg-brand-dark/80 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Ordinamento e esportazione */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'category')}
                className="bg-brand-dark border border-brand-medium rounded-lg px-3 py-2 sm:py-2.5 text-white text-sm sm:text-base focus:outline-none focus:border-brand-peach min-h-[40px]"
              >
                <option value="date">Ordina per Data</option>
                <option value="amount">Ordina per Importo</option>
                <option value="category">Ordina per Categoria</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-brand-dark border border-brand-medium rounded-lg p-2 sm:p-2.5 text-brand-peach hover:bg-brand-dark/80 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
              >
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              
              {/* Pulsante esportazione Excel */}
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 border border-green-500 rounded-lg px-3 py-2 sm:py-2.5 text-white text-sm sm:text-base transition-colors flex items-center space-x-2 min-h-[40px]"
                title="Esporta in Excel"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Esporta</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista transazioni - Layout ottimizzato */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center space-x-3 text-brand-peach/70">
              <div className="w-5 h-5 border-2 border-brand-peach/30 border-t-brand-peach rounded-full animate-spin"></div>
              <span className="text-sm sm:text-base">Caricamento transazioni...</span>
            </div>
          </div>
        ) : (Array.isArray(paginatedTransactions) && paginatedTransactions.length === 0) ? (
          <div className="p-6 text-center">
            <div className="text-4xl sm:text-5xl mb-3">📊</div>
            <div className="text-brand-peach/70 text-base sm:text-lg mb-2">Nessuna transazione trovata</div>
            <div className="text-brand-peach/50 text-sm">Prova a modificare i filtri o aggiungi una nuova transazione</div>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.isArray(paginatedTransactions) ? paginatedTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="bg-brand-secondary border border-brand-medium rounded-lg p-3 sm:p-4 hover:border-brand-peach/30 transition-all duration-300 min-h-[80px] sm:min-h-[90px]"
              >
                <div className="flex items-center justify-between gap-2 sm:gap-3 h-full">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {/* Icona */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-brand-peach/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-base sm:text-lg md:text-xl">
                        {transaction.type === 'income' ? '📈' : '📉'}
                      </span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                        <h3 className="font-semibold text-white truncate text-xs sm:text-sm md:text-base">
                          {transaction.description}
                        </h3>
                        <span className={`px-1 sm:px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                          transaction.type === 'income' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.type === 'income' ? 'Entrata' : 'Uscita'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-brand-peach/60">
                        <span className="truncate">{transaction.category_name || 'Non categorizzato'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{formatDate(transaction.transaction_date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Importo */}
                  <div className="text-right flex-shrink-0 min-w-[70px] sm:min-w-[80px] md:min-w-[100px]">
                    <div className={`text-sm sm:text-lg md:text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}€{Number(transaction.amount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )) : null}
          </div>
        )}
      </div>

      {/* Controlli di paginazione - Layout responsive */}
      {Array.isArray(filteredAndSortedTransactions) && filteredAndSortedTransactions.length > transactionsPerPage && (
        <div className="bg-brand-secondary border border-brand-medium rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="text-sm sm:text-base text-brand-peach/80 text-center sm:text-left">
              Pagina {currentPage} di {totalPages} 
              ({filteredAndSortedTransactions.length} transazioni totali)
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-brand-dark border border-brand-medium rounded-lg px-3 py-2 sm:py-2.5 text-brand-peach hover:bg-brand-dark/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-white font-medium px-3 py-2 sm:py-2.5 bg-brand-dark/50 rounded-lg text-sm sm:text-base min-w-[40px] text-center">
                {currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-brand-dark border border-brand-medium rounded-lg px-3 py-2 sm:py-2.5 text-brand-peach hover:bg-brand-dark/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginazione o contatore */}
      {Array.isArray(filteredAndSortedTransactions) && filteredAndSortedTransactions.length > 0 && (
        <div className="text-center text-xs sm:text-sm text-brand-peach/60 pb-4">
          Mostrando {Array.isArray(filteredAndSortedTransactions) ? filteredAndSortedTransactions.length : 0} di {Array.isArray(transactions) ? transactions.length : 0} transazioni
        </div>
      )}
    </div>
  );
};

export default TransactionList;
