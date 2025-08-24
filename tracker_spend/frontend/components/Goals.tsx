import React, { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import Card from './Card';
import FlatButton from './FlatButton';
import ActionButton from './ActionButton';
import { ApiService, useApiConnection } from '../src/services/api';
import { useData } from '../src/contexts/DataContext';
import { useToast } from '../src/contexts/ToastContext';
import { Goal } from '../types';

const Goals: React.FC = () => {
  const { isConnected } = useApiConnection();
  const { showSuccess, showError } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null);
  const [newProgressAmount, setNewProgressAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Risparmio',
    priority: 'medium' as const
  });

  useEffect(() => {
    if (isConnected) {
      loadGoals();
    }
  }, [isConnected]);

  const loadGoals = async () => {
    if (!isConnected) return;

    try {
      const response = await ApiService.getGoals();
      
      if (response.data) {
        // Gestisci sia la struttura standard che quella con doppio nesting
        let goalsData = [];
        if (Array.isArray(response.data)) {
          // Struttura standard: {data: [...]}
          goalsData = response.data;
        } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
          // Struttura con doppio nesting: {data: {data: [...]}}
          goalsData = (response.data as any).data;
        }
        
        setGoals(goalsData);
      } else {
        setGoals([]); // Ensure goals is an empty array if no data
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    try {
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.targetAmount),
        deadline: formData.deadline,
        priority: formData.priority
      };

      if (selectedGoal) {
        await ApiService.updateGoal(selectedGoal.id, goalData);
      } else {
        await ApiService.createGoal(goalData);
      }

      setShowAddModal(false);
      setSelectedGoal(null);
      resetForm();
      loadGoals();
      showSuccess('Obiettivo salvato con successo!');
    } catch (error) {
      console.error('Error saving goal:', error);
      showError('Errore nel salvare l\'obiettivo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!isConnected) return;

    try {
      await ApiService.deleteGoal(id);
      loadGoals();
      showSuccess('Obiettivo eliminato con successo!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      showError('Errore nell\'eliminare l\'obiettivo');
    }
  };

  const openDeleteModal = (goal: Goal) => {
    setDeleteGoal(goal);
    setShowDeleteModal(true);
  };

  const openProgressModal = (goal: Goal) => {
    setProgressGoal(goal);
    setNewProgressAmount('0'); // Inizia con 0 per aggiungere fondi
    setShowProgressModal(true);
  };

  const handleAddFunds = async (goal: Goal, amountToAdd: number) => {
    if (!isConnected) return;

    try {
      await ApiService.updateGoalProgress(goal.id, amountToAdd);
      loadGoals();
      showSuccess(`Aggiunti €${amountToAdd.toFixed(2)} al tuo obiettivo!`);
    } catch (error) {
      console.error('Error adding funds:', error);
      showError('Errore nell\'aggiungere i fondi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: 'Risparmio',
      priority: 'medium' as const
    });
  };

  const openEditModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.target_amount.toString(),
      currentAmount: goal.current_amount.toString(),
      deadline: goal.deadline || '',
      category: 'Risparmio', // Campo non presente nel tipo Goal
      priority: goal.priority
    });
    setShowAddModal(true);
  };

  const getProgressPercentage = (goal: Goal) => {
    const current = goal.current_amount || 0;
    const target = goal.target_amount || 1; // Evita divisione per zero
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '📌';
    }
  };

  const filteredGoals = Array.isArray(goals) ? goals.filter(goal => {
    if (filter === 'active') return goal.status === 'active';
    if (filter === 'completed') return goal.status === 'completed';
    return true;
  }) : [];

  if (!isConnected) {
      return (
    <div className="space-y-4 sm:space-y-6">
        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-400 font-medium">Server non connesso</span>
          </div>
          <p className="text-red-300 text-sm mt-2">
            Assicurati che l'app Flutter sia in esecuzione e che il server API sia attivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Obiettivi"
        subtitle="Pianifica e raggiungi i tuoi traguardi"
        rightAction={
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            variant="primary"
            onClick={() => {
              setSelectedGoal(null);
              resetForm();
              setShowAddModal(true);
            }}
          />
        }
        showLogo={true}
      />

      {/* Filtri */}
      <div className="flex flex-wrap gap-2">
        <FlatButton
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Tutti ({Array.isArray(goals) ? goals.length : 0})
        </FlatButton>
        <FlatButton
          variant={filter === 'active' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Attivi ({Array.isArray(goals) ? goals.filter(g => g.status === 'active').length : 0})
        </FlatButton>
        <FlatButton
          variant={filter === 'completed' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completati ({Array.isArray(goals) ? goals.filter(g => g.status === 'completed').length : 0})
        </FlatButton>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              €{Array.isArray(goals) ? (goals.reduce((sum, goal) => sum + (Number(goal.current_amount) || 0), 0) || 0).toFixed(0) : '0'}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Risparmiato</div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4" variant="elevated">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-brand-peach">
              {Array.isArray(goals) ? goals.filter(g => g.status === 'completed').length : 0}
            </div>
            <div className="text-xs sm:text-sm text-brand-peach/80">Obiettivi Raggiunti</div>
          </div>
        </Card>
      </div>

      {/* Lista Obiettivi */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-peach mx-auto"></div>
          <p className="text-brand-peach/80 mt-2">Caricamento obiettivi...</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card className="p-6 text-center" variant="elevated">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-12 w-12 text-brand-peach mx-auto" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Nessun obiettivo configurato</h3>
          <p className="text-brand-peach/80 mb-4">
            Crea il tuo primo obiettivo finanziario per iniziare a risparmiare
          </p>
          <FlatButton
            variant="primary"
            onClick={() => {
              setSelectedGoal(null);
              resetForm();
              setShowAddModal(true);
            }}
          >
            Crea Primo Obiettivo
          </FlatButton>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredGoals.map((goal) => (
            <Card key={goal.id} className="p-3 sm:p-4" variant="elevated">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getPriorityIcon(goal.priority)}</span>
                    <h3 className="font-semibold text-white">{goal.name}</h3>
                    {goal.status === 'completed' && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Completato
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-brand-peach/80">
                    <span>€{(Number(goal.current_amount) || 0).toFixed(0)} / €{(Number(goal.target_amount) || 0).toFixed(0)}</span>
                    <span className={getPriorityColor(goal.priority)}>
                      {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Bassa'} priorità
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(goal)}
                    className="text-brand-peach/80 hover:text-brand-peach"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(goal)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Barra di Progresso */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-brand-peach/80 mb-1">
                  <span>{(getProgressPercentage(goal) || 0).toFixed(1)}% completato</span>
                  <span>{getDaysRemaining(goal.deadline)} giorni rimanenti</span>
                </div>
                <div className="w-full bg-brand-dark rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-peach to-brand-medium h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(goal)}%` }}
                  ></div>
                </div>
              </div>

              {/* Azioni Rapide */}
              {goal.status === 'active' && (
                <div className="flex space-x-2">
                  <FlatButton
                    variant="secondary"
                    size="sm"
                    onClick={() => openProgressModal(goal)}
                  >
                    Aggiungi Fondi
                  </FlatButton>
                  <FlatButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddFunds(goal, goal.target_amount - (goal.current_amount || 0))}
                  >
                    Completare
                  </FlatButton>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Aggiunta/Modifica Obiettivo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-buddy-card rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold">
                {selectedGoal ? 'Modifica Obiettivo' : 'Nuovo Obiettivo'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Nome Obiettivo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                  placeholder="Es. Vacanze in Grecia"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                    Obiettivo (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                    Già Risparmiato (€)
                  </label>
                  <input
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Scadenza *
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                  Priorità
                </label>
                <div className="flex space-x-2">
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: priority as any })}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                        formData.priority === priority 
                          ? 'bg-buddy-purple text-white' 
                          : 'bg-buddy-dark text-buddy-text-secondary'
                      }`}
                    >
                      {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Bassa'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <FlatButton
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Annulla
                </FlatButton>
                <FlatButton
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  {selectedGoal ? 'Aggiorna' : 'Crea'}
                </FlatButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aggiornamento Progresso */}
      {showProgressModal && progressGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-buddy-card rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Aggiungi Fondi
              </h2>
              <button
                onClick={() => setShowProgressModal(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-buddy-text-secondary mb-2">
                Obiettivo: <span className="font-semibold text-white">{progressGoal.name}</span>
              </p>
              <p className="text-buddy-text-secondary text-sm">
                Progresso attuale: €{(Number(progressGoal.current_amount) || 0).toFixed(0)} / €{(Number(progressGoal.target_amount) || 0).toFixed(0)}
              </p>
              <p className="text-buddy-text-secondary text-sm">
                Mancano: €{((Number(progressGoal.target_amount) || 0) - (Number(progressGoal.current_amount) || 0)).toFixed(0)} per completare
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-buddy-text-secondary mb-2">
                Importo da Aggiungere (€)
              </label>
              <input
                type="number"
                value={newProgressAmount}
                onChange={(e) => setNewProgressAmount(e.target.value)}
                className="w-full bg-buddy-dark text-buddy-text-primary p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple"
                placeholder="0"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <FlatButton
                variant="ghost"
                onClick={() => setShowProgressModal(false)}
                className="flex-1"
              >
                Annulla
              </FlatButton>
              <FlatButton
                variant="primary"
                onClick={() => {
                  const amount = parseFloat(newProgressAmount);
                  if (!isNaN(amount) && amount >= 0) {
                    handleAddFunds(progressGoal, amount);
                    setShowProgressModal(false);
                    setNewProgressAmount('');
                    setProgressGoal(null);
                  }
                }}
                className="flex-1"
              >
                Aggiungi
              </FlatButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conferma Eliminazione */}
      {showDeleteModal && deleteGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-buddy-card rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-red-400">
                Conferma Eliminazione
              </h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-buddy-text-secondary hover:text-buddy-text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-buddy-text-secondary">
                    Sei sicuro di voler eliminare l'obiettivo:
                  </p>
                  <p className="font-semibold text-white">{deleteGoal.name}</p>
                </div>
              </div>
              <p className="text-buddy-text-secondary text-sm">
                Questa azione non può essere annullata.
              </p>
            </div>

            <div className="flex space-x-3">
              <FlatButton
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Annulla
              </FlatButton>
              <FlatButton
                variant="primary"
                onClick={() => {
                  handleDelete(deleteGoal.id);
                  setShowDeleteModal(false);
                  setDeleteGoal(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Elimina
              </FlatButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;


