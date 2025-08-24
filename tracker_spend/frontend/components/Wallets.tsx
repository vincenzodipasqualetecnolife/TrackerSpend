import React, { useState, useEffect } from 'react';
import { ApiService, useApiConnection } from '../src/services/api';
import type { Transaction, TransactionType } from '../types';
import TransactionModal from './TransactionModal';
import PageHeader from './PageHeader';

interface RealTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  budgetId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

const Wallets: React.FC = () => {
  const { isConnected } = useApiConnection();
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RealTransaction | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!isConnected) return;

      try {
        setIsLoading(true);
        const response = await ApiService.getTransactions();
        if (response.data) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [isConnected]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || 
      (filter === 'income' && transaction.type === 'income') ||
      (filter === 'expense' && transaction.type === 'expense');
    
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Alimentari': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/>
          <line x1="10" y1="1" x2="10" y2="4"/>
          <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      ),
      'Trasporti': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.6-.4-1-1-1h-1l-1.5-4.5c-.3-.9-1.2-1.5-2.1-1.5H8.6c-.9 0-1.8.6-2.1 1.5L5 12H4c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      ),
      'Casa': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      ),
      'Intrattenimento': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5,3 19,12 5,21 5,3"/>
        </svg>
      ),
      'Salute': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      ),
      'Shopping': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
      'Stipendio': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
        </svg>
      ),
      'Freelance': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      'Investimenti': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      ),
      'Altro': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      ),
    };
    return icons[category] || icons['Altro'];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!isConnected) return;

    try {
      const response = await ApiService.deleteTransaction(id);
      if (!response.error) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEditTransaction = (transaction: RealTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSave = () => {
    loadTransactions();
  };

  const loadTransactions = async () => {
    if (!isConnected) return;

    try {
      setIsLoading(true);
      const response = await ApiService.getTransactions();
      if (response.data) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
      return (
    <div className="space-y-4 sm:space-y-6">
        <div className="bg-red-500/20 border border-red-500/50 p-3 sm:p-4 rounded-xl">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-400 font-medium text-sm sm:text-base">Server non connesso</span>
          </div>
          <p className="text-red-300 text-xs sm:text-sm mt-1 sm:mt-2">
            Assicurati che l'app Flutter sia in esecuzione e che il server API sia attivo sulla porta 3001.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Portafogli"
        rightAction={
          <button 
            onClick={handleAddTransaction}
            className="bg-buddy-purple text-white p-1.5 sm:p-2 rounded-lg hover:bg-buddy-purple/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-buddy-card p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-buddy-text-secondary">ENTRATE</p>
          <p className="text-lg sm:text-xl font-bold text-green-400">
            €{totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-buddy-card p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-buddy-text-secondary">USCITE</p>
          <p className="text-lg sm:text-xl font-bold text-red-400">
            €{totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-buddy-card p-3 sm:p-4 rounded-xl">
          <p className="text-xs text-buddy-text-secondary">SALDO</p>
          <p className={`text-lg sm:text-xl font-bold ${netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            €{netAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`py-2 px-4 rounded-lg font-semibold w-full ${
            filter === 'all' ? 'bg-buddy-purple text-white' : 'bg-buddy-card text-buddy-text-secondary'
          }`}
        >
          Tutte
        </button>
        <button
          onClick={() => setFilter('income')}
          className={`py-2 px-4 rounded-lg font-semibold w-full ${
            filter === 'income' ? 'bg-green-600 text-white' : 'bg-buddy-card text-buddy-text-secondary'
          }`}
        >
          Entrate
        </button>
        <button
          onClick={() => setFilter('expense')}
          className={`py-2 px-4 rounded-lg font-semibold w-full ${
            filter === 'expense' ? 'bg-red-600 text-white' : 'bg-buddy-card text-buddy-text-secondary'
          }`}
        >
          Uscite
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cerca transazioni..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-buddy-card text-buddy-text-primary p-3 rounded-xl pl-10"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute left-3 top-3.5 text-buddy-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-buddy-text-secondary">Caricamento transazioni...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-buddy-card p-6 rounded-xl text-center">
            <p className="text-buddy-text-secondary">
              {searchTerm ? 'Nessuna transazione trovata' : 'Nessuna transazione presente'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-buddy-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <p className="font-medium text-buddy-text-primary">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-buddy-text-secondary">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditTransaction(transaction)}
                      className="text-buddy-text-secondary hover:text-blue-400 p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-buddy-text-secondary hover:text-red-400 p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Transaction Button */}
      <div className="fixed bottom-20 right-4">
        <button 
          onClick={handleAddTransaction}
          className="bg-buddy-purple text-white p-4 rounded-full shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transaction={selectedTransaction}
        onSave={handleTransactionSave}
      />
    </div>
  );
};

export default Wallets;