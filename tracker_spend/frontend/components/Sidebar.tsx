import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiConnectionWithAuth } from '../src/services/api';
import { formatCurrency } from '../src/utils/formatters';
import { authService } from '../src/services/auth';
import Card from './Card';
import FlatButton from './FlatButton';
import FileUploadModal from './FileUploadModal';
import { ApiService } from '../src/services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage = 'dashboard' }) => {
  const navigate = useNavigate();
  const { isConnected, isAuthenticated } = useApiConnectionWithAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [quickStats, setQuickStats] = useState({
    balance: 0,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    transactionsCount: 0
  });
  const [loading, setLoading] = useState(false);

  // Carica statistiche rapide
  const loadQuickStats = async () => {
    if (!isConnected || !isAuthenticated) return;
    
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      const response = await ApiService.getDashboardStats(currentYear, currentMonth);
      if (response.data) {
        setQuickStats({
          balance: response.data.net_amount || 0,
          monthlyExpenses: Math.abs(response.data.total_expenses || 0),
          monthlyIncome: response.data.total_income || 0,
          transactionsCount: response.data.total_transactions || 0
        });
      }
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carica le statistiche quando la sidebar si apre
  React.useEffect(() => {
    if (isOpen) {
      loadQuickStats();
    }
  }, [isOpen, isConnected, isAuthenticated]);

  const quickActions = [
    {
      id: 'upload',
      label: 'Carica Estratto',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      action: () => setIsUploadModalOpen(true),
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'add-transaction',
      label: 'Aggiungi Transazione',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: () => navigate('/transactions'),
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      id: 'analytics',
      label: 'Analisi Dettagliate',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      action: () => navigate('/analytics'),
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
      id: 'predictions',
      label: 'Simulazioni',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      action: () => navigate('/review-optimize'),
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
      id: 'profile',
      label: 'Profilo Utente',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      action: () => navigate('/profile'),
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'Nuove funzionalità disponibili',
      time: '2 ore fa',
      icon: '🔔'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Spese elevate questo mese',
      time: '1 giorno fa',
      icon: '⚠️'
    },
    {
      id: 3,
      type: 'success',
      message: 'Obiettivo risparmio raggiunto!',
      time: '3 giorni fa',
      icon: '🎉'
    }
  ];

  return (
    <>
      {/* Overlay per chiudere la sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-brand-secondary border-l border-brand-medium shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header della sidebar */}
          <div className="p-4 border-b border-brand-medium">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-peach">Pannello Rapido</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-brand-medium/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-peach" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenuto della sidebar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Statistiche Rapide */}
            <Card className="p-4" variant="elevated">
              <h3 className="text-sm font-semibold text-brand-peach mb-3 flex items-center gap-2">
                <span>📊</span>
                Statistiche Rapide
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-brand-medium/30 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-peach/80">Saldo</span>
                    <span className={`text-sm font-semibold ${quickStats.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(quickStats.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-peach/80">Entrate Mensili</span>
                    <span className="text-sm font-semibold text-green-400">
                      {formatCurrency(quickStats.monthlyIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-peach/80">Uscite Mensili</span>
                    <span className="text-sm font-semibold text-red-400">
                      {formatCurrency(quickStats.monthlyExpenses)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand-peach/80">Transazioni</span>
                    <span className="text-sm font-semibold text-white">
                      {quickStats.transactionsCount}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Azioni Rapide */}
            <Card className="p-4" variant="elevated">
              <h3 className="text-sm font-semibold text-brand-peach mb-3 flex items-center gap-2">
                <span>⚡</span>
                Azioni Rapide
              </h3>
              
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`w-full p-3 rounded-lg border ${action.color} hover:opacity-80 transition-all duration-200 flex items-center gap-3 text-left`}
                  >
                    {action.icon}
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Notifiche */}
            <Card className="p-4" variant="elevated">
              <h3 className="text-sm font-semibold text-brand-peach mb-3 flex items-center gap-2">
                <span>🔔</span>
                Notifiche
              </h3>
              
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-2 rounded-lg bg-brand-dark/30 border border-brand-medium/30">
                    <span className="text-lg">{notification.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-brand-peach/60 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Suggerimenti */}
            <Card className="p-4" variant="elevated">
              <h3 className="text-sm font-semibold text-brand-peach mb-3 flex items-center gap-2">
                <span>💡</span>
                Suggerimenti
              </h3>
              
              <div className="space-y-2">
                <div className="text-xs text-brand-peach/80 leading-relaxed">
                  <p>• Carica regolarmente i tuoi estratti conto</p>
                  <p>• Imposta obiettivi di risparmio realistici</p>
                  <p>• Monitora le tue spese ricorrenti</p>
                  <p>• Usa le simulazioni per pianificare</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Footer della sidebar */}
          <div className="p-4 border-t border-brand-medium">
            <div className="space-y-3">
              <button
                onClick={() => {
                  authService.logout();
                  navigate('/login');
                }}
                className="w-full p-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all duration-200 flex items-center gap-3 justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
              
              <div className="text-center">
                <p className="text-xs text-brand-peach/60">
                  TrackerSpend v1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(result) => {
          console.log('Upload completato:', result);
          loadQuickStats(); // Ricarica le statistiche
          setIsUploadModalOpen(false);
        }}
      />
    </>
  );
};

export default Sidebar;
