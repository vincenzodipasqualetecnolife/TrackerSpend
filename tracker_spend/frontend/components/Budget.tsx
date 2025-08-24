
import React, { useState, useEffect } from 'react';
import { ApiService, useApiConnection } from '../src/services/api';
import BudgetModal from './BudgetModal';
import PageHeader from './PageHeader';

interface RealBudget {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  categories: BudgetCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  color: string;
}

interface BudgetStatistics {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  budgetUtilization: number;
  remainingBudget: number;
  isOverBudget: boolean;
  transactionCount: number;
}

const Budget: React.FC = () => {
  const { isConnected } = useApiConnection();
  const [budgets, setBudgets] = useState<RealBudget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<RealBudget | null>(null);
  const [budgetStats, setBudgetStats] = useState<BudgetStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedBudgetForEdit, setSelectedBudgetForEdit] = useState<RealBudget | null>(null);

  useEffect(() => {
    const loadBudgets = async () => {
      if (!isConnected) return;

      try {
        setIsLoading(true);
        const response = await ApiService.getBudgets();
        if (response.data) {
          setBudgets(response.data);
          if (response.data.length > 0) {
            setSelectedBudget(response.data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading budgets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgets();
  }, [isConnected]);

  useEffect(() => {
    const loadBudgetStats = async () => {
      if (!isConnected || !selectedBudget) return;

      try {
        const response = await ApiService.getBudgetStatistics(selectedBudget.id);
        if (response.data) {
          setBudgetStats(response.data);
        }
      } catch (error) {
        console.error('Error loading budget statistics:', error);
      }
    };

    loadBudgetStats();
  }, [isConnected, selectedBudget]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPeriodLabel = (period: string) => {
    const periods: { [key: string]: string } = {
      'weekly': 'Settimanale',
      'monthly': 'Mensile',
      'quarterly': 'Trimestrale',
      'yearly': 'Annuale',
    };
    return periods[period] || period;
  };

  const handleAddBudget = () => {
    setSelectedBudgetForEdit(null);
    setIsBudgetModalOpen(true);
  };

  const handleEditBudget = (budget: RealBudget) => {
    setSelectedBudgetForEdit(budget);
    setIsBudgetModalOpen(true);
  };

  const handleBudgetSave = () => {
    loadBudgets();
  };

  const loadBudgets = async () => {
    if (!isConnected) return;

    try {
      setIsLoading(true);
      const response = await ApiService.getBudgets();
      if (response.data) {
        setBudgets(response.data);
        if (response.data.length > 0) {
          setSelectedBudget(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading budgets:', error);
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
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-3 sm:px-4">
      <PageHeader
        title="Budget"
        rightAction={
          <button 
            onClick={handleAddBudget}
            className="bg-buddy-purple text-white p-1.5 sm:p-2 rounded-lg hover:bg-buddy-purple/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        }
      />

      {/* Budget Selector */}
      {budgets.length > 0 && (
        <div className="bg-buddy-card p-3 sm:p-4 rounded-xl">
          <label className="text-xs sm:text-sm text-buddy-text-secondary mb-1 sm:mb-2 block">Seleziona Budget</label>
          <select
            value={selectedBudget?.id || ''}
            onChange={(e) => {
              const budget = budgets.find(b => b.id === e.target.value);
              setSelectedBudget(budget || null);
            }}
            className="w-full bg-buddy-dark text-buddy-text-primary p-2.5 sm:p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple text-sm sm:text-base"
          >
            {budgets.map(budget => (
              <option key={budget.id} value={budget.id}>
                {budget.name} ({getPeriodLabel(budget.period)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Budget Details */}
      {selectedBudget && (
        <>
          <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">{selectedBudget.name}</h2>
                <p className="text-buddy-text-secondary text-sm sm:text-base">{selectedBudget.description}</p>
                <p className="text-xs sm:text-sm text-buddy-text-secondary mt-1">
                  {formatDate(selectedBudget.startDate)} - {formatDate(selectedBudget.endDate)}
                </p>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                selectedBudget.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {selectedBudget.isActive ? 'Attivo' : 'Inattivo'}
              </span>
            </div>

            {/* Budget Progress */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm text-buddy-text-secondary">Progresso Budget</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {selectedBudget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0).toFixed(2)} / {selectedBudget.totalAmount.toFixed(2)} EUR
                  </span>
                </div>
                <div className="w-full bg-buddy-dark rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(
                      (selectedBudget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0) / selectedBudget.totalAmount) * 100
                    )}`}
                    style={{
                      width: `${Math.min(
                        (selectedBudget.categories.reduce((sum, cat) => sum + cat.spentAmount, 0) / selectedBudget.totalAmount) * 100,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Budget Statistics */}
              {budgetStats && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-xs text-buddy-text-secondary">Entrate</p>
                    <p className="text-base sm:text-lg font-bold text-green-400">€{budgetStats.totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-buddy-text-secondary">Uscite</p>
                    <p className="text-base sm:text-lg font-bold text-red-400">€{budgetStats.totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-buddy-text-secondary">Saldo</p>
                    <p className={`text-base sm:text-lg font-bold ${budgetStats.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      €{budgetStats.netAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-buddy-text-secondary">Utilizzo</p>
                    <p className="text-base sm:text-lg font-bold">{budgetStats.budgetUtilization.toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Dettaglio per Categoria</h3>
            <div className="space-y-3 sm:space-y-4">
              {selectedBudget.categories.map(category => {
                const percentage = (category.spentAmount / category.allocatedAmount) * 100;
                const isOverBudget = category.spentAmount > category.allocatedAmount;
                
                return (
                  <div key={category.id} className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm sm:text-base">{category.name}</span>
                      <span className={`text-xs sm:text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-buddy-text-secondary'}`}>
                        €{category.spentAmount.toFixed(2)} / €{category.allocatedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-buddy-dark rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-buddy-text-secondary">
                      <span>{percentage.toFixed(1)}% utilizzato</span>
                      {isOverBudget && (
                        <span className="text-red-400">
                          +€{(category.spentAmount - category.allocatedAmount).toFixed(2)} oltre budget
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* No Budgets Message */}
      {!isLoading && budgets.length === 0 && (
        <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center">
          <div className="mb-3 sm:mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-brand-peach" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/>
            <path d="M6 15l4-4 3 3 5-6"/>
          </svg>
        </div>
          <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Nessun budget configurato</h3>
          <p className="text-buddy-text-secondary mb-3 sm:mb-4 text-sm sm:text-base">
            Crea il tuo primo budget per iniziare a monitorare le spese
          </p>
          <button 
            onClick={handleAddBudget}
            className="bg-buddy-purple text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base"
          >
            Crea Budget
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-buddy-text-secondary">Caricamento budget...</div>
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budget={selectedBudgetForEdit}
        onSave={handleBudgetSave}
      />
    </div>
  );
};

export default Budget;
