import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';

interface LinkedAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  lastSync: string;
  isActive: boolean;
  institution: string;
  accountNumber: string;
}

interface LinkedAccountsProps {
  onNavigateBack: () => void;
}

const LinkedAccounts: React.FC<LinkedAccountsProps> = ({ onNavigateBack }) => {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);

  // Carica dati reali dal backend
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      // Qui dovrebbe caricare i dati reali dal backend
      setAccounts([]);
    } catch (error) {
      console.error('Errore nel caricamento accounts:', error);
    }
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<LinkedAccount | null>(null);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsAddModalOpen(true);
  };

  const handleEditAccount = (account: LinkedAccount) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
  };

  const handleSyncAccount = (id: string) => {
    // Simulate sync
    const updatedAccounts = accounts.map(account => 
      account.id === id 
        ? { ...account, lastSync: new Date().toISOString() }
        : account
    );
    setAccounts(updatedAccounts);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT') + ' ' + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'checking': 'Conto Corrente',
      'savings': 'Conto Risparmio',
      'credit': 'Carta di Credito',
      'investment': 'Investimenti'
    };
    return types[type] || type;
  };

  const getAccountIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'checking': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
      'savings': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 8v8"/>
          <path d="M8 12h8"/>
        </svg>
      ),
      'credit': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      'investment': (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
        </svg>
      )
    };
    return icons[type] || icons['checking'];
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Conti Collegati"
        onBack={onNavigateBack}
        rightAction={
          <button 
            onClick={handleAddAccount}
            className="bg-buddy-purple text-white p-1.5 sm:p-2 rounded-lg hover:bg-buddy-purple/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        }
      />

      {/* Total Balance */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <p className="text-xs sm:text-sm text-buddy-text-secondary">SALDO TOTALE</p>
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">
          €{totalBalance.toFixed(2)}
          <span className="text-lg sm:text-xl md:text-2xl text-buddy-text-secondary">EUR</span>
        </p>
        <p className="text-xs text-buddy-text-secondary mt-1 sm:mt-2">
          Aggiornato: {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Accounts List */}
      <div className="space-y-3 sm:space-y-4">
        {accounts.map(account => (
          <div key={account.id} className="bg-buddy-card p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-buddy-purple/20 flex items-center justify-center text-lg sm:text-xl">
                  {getAccountIcon(account.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <h3 className="font-bold text-buddy-text-primary text-sm sm:text-base">{account.name}</h3>
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                      account.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {account.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-buddy-text-secondary">
                    {account.institution} • {getAccountTypeLabel(account.type)} • {account.accountNumber}
                  </p>
                  <p className="text-xs text-buddy-text-secondary">
                    Ultima sincronizzazione: {formatDate(account.lastSync)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg sm:text-xl font-bold text-buddy-text-primary">
                  €{account.balance.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-buddy-text-secondary">{account.currency}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-buddy-dark">
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleEditAccount(account)}
                  className="text-buddy-text-secondary hover:text-blue-400 p-1.5 sm:p-2 rounded-lg hover:bg-buddy-dark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleSyncAccount(account.id)}
                  className="text-buddy-text-secondary hover:text-green-400 p-1.5 sm:p-2 rounded-lg hover:bg-buddy-dark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="text-buddy-text-secondary hover:text-red-400 p-1.5 sm:p-2 rounded-lg hover:bg-buddy-dark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-buddy-text-secondary">
                ID: {account.id}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Accounts Message */}
      {accounts.length === 0 && (
        <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
          <div className="mb-3 sm:mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-brand-peach" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
          <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Nessun conto collegato</h3>
          <p className="text-buddy-text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
            Collega i tuoi conti bancari per sincronizzare automaticamente i saldi
          </p>
          <button 
            onClick={handleAddAccount}
            className="bg-buddy-purple text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base"
          >
            Collega Conto
          </button>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-buddy-card rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Collega Nuovo Conto</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Nome Conto
                </label>
                <input
                  type="text"
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                  placeholder="Es. Conto Principale"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Tipo Conto
                </label>
                <select className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple">
                  <option value="checking">Conto Corrente</option>
                  <option value="savings">Conto Risparmio</option>
                  <option value="credit">Carta di Credito</option>
                  <option value="investment">Investimenti</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Istituto Bancario
                </label>
                <input
                  type="text"
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                  placeholder="Es. Intesa Sanpaolo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Saldo Iniziale
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                  placeholder="0.00"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-buddy-dark text-buddy-text-secondary py-3 rounded-lg font-semibold"
                >
                  Annulla
                </button>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-buddy-purple text-white py-3 rounded-lg font-semibold"
                >
                  Collega
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-buddy-card rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Modifica Conto</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Nome Conto
                </label>
                <input
                  type="text"
                  defaultValue={selectedAccount.name}
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Saldo Attuale
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={selectedAccount.balance}
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  defaultChecked={selectedAccount.isActive}
                  className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary rounded focus:ring-buddy-purple"
                />
                <label htmlFor="isActive" className="text-sm text-buddy-text-secondary">
                  Conto attivo
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-buddy-dark text-buddy-text-secondary py-3 rounded-lg font-semibold"
                >
                  Annulla
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-buddy-purple text-white py-3 rounded-lg font-semibold"
                >
                  Aggiorna
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedAccounts;
