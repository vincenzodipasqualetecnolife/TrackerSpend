import React, { useState, useEffect } from 'react';
import { Goal, GoalForm } from '../types';
import { validateGoal } from '../src/utils/validators';
import { formatCurrency } from '../src/utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: GoalForm) => Promise<void>;
  goal?: Goal | null;
  title?: string;
}

const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goal = null,
  title = 'Nuovo Obiettivo'
}) => {
  const [formData, setFormData] = useState<GoalForm>({
    name: '',
    description: '',
    target_amount: 0,
    deadline: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popola il form quando viene passato un obiettivo esistente
  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        description: goal.description || '',
        target_amount: goal.target_amount,
        deadline: goal.deadline || '',
        priority: goal.priority
      });
    } else {
      // Reset del form per nuovo obiettivo
      const today = new Date();
      const defaultDeadline = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      
      setFormData({
        name: '',
        description: '',
        target_amount: 0,
        deadline: defaultDeadline.toISOString().split('T')[0],
        priority: 'medium'
      });
    }
    setErrors([]);
  }, [goal, isOpen]);

  const handleInputChange = (field: keyof GoalForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Pulisci gli errori quando l'utente modifica un campo
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    const validation = validateGoal(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Errore durante il salvataggio']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Calcola i giorni rimanenti
  const calculateDaysRemaining = () => {
    if (!formData.deadline) return 0;
    const today = new Date();
    const deadline = new Date(formData.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calcola il contributo mensile necessario
  const calculateMonthlyContribution = () => {
    const daysRemaining = calculateDaysRemaining();
    if (daysRemaining <= 0) return formData.target_amount;
    const monthsRemaining = daysRemaining / 30.44; // Media giorni per mese
    return formData.target_amount / Math.max(monthsRemaining, 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-secondary border border-brand-medium rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-medium">
          <h2 className="text-xl font-bold text-brand-peach">{title}</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-brand-peach/60 hover:text-brand-peach transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Errori */}
          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-500 font-medium">Errori di validazione</span>
              </div>
              <ul className="text-red-500/80 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Nome Obiettivo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
              placeholder="Es. Vacanza in Giappone, Macchina nuova"
              required
            />
          </div>

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Descrizione (opzionale)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors resize-none"
              placeholder="Descrivi il tuo obiettivo..."
              rows={3}
            />
          </div>

          {/* Importo obiettivo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Importo Obiettivo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-peach/60">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', parseFloat(e.target.value) || 0)}
                className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg pl-8 pr-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Priorità */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Priorità
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'low', label: 'Bassa', icon: '🟢', color: 'bg-green-500/20 border-green-500/50 text-green-400' },
                { value: 'medium', label: 'Media', icon: '🟡', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
                { value: 'high', label: 'Alta', icon: '🔴', color: 'bg-red-500/20 border-red-500/50 text-red-400' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => handleInputChange('priority', priority.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.priority === priority.value
                      ? priority.color
                      : 'bg-brand-dark/50 border-brand-medium/50 text-brand-peach/60 hover:border-brand-peach/30'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">{priority.icon}</span>
                    <span className="text-sm">{priority.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Data Obiettivo
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors"
              required
            />
          </div>

          {/* Riepilogo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Riepilogo
            </label>
            <div className="bg-brand-dark/30 rounded-lg p-4 border border-brand-medium space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Giorni rimanenti:</span>
                <span className={`font-medium ${calculateDaysRemaining() < 30 ? 'text-red-400' : calculateDaysRemaining() < 90 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {calculateDaysRemaining()}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Contributo mensile:</span>
                <span className="text-white font-medium">{formatCurrency(calculateMonthlyContribution())}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Obiettivo totale:</span>
                <span className="text-white font-medium">{formatCurrency(formData.target_amount)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Priorità:</span>
                <span className={`font-medium ${
                  formData.priority === 'high' ? 'text-red-400' : 
                  formData.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {formData.priority === 'high' ? 'Alta' : 
                   formData.priority === 'medium' ? 'Media' : 'Bassa'}
                </span>
              </div>
            </div>
          </div>

          {/* Suggerimenti */}
          {calculateDaysRemaining() > 0 && (
            <div className="bg-brand-peach/10 border border-brand-peach/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-5 h-5 text-brand-peach" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-brand-peach font-medium">Suggerimenti</span>
              </div>
              <ul className="text-brand-peach/80 text-sm space-y-1">
                <li>• Risparmia {formatCurrency(calculateMonthlyContribution())} al mese per raggiungere l'obiettivo</li>
                <li>• Considera di aumentare il contributo se possibile</li>
                <li>• Monitora i progressi regolarmente</li>
              </ul>
            </div>
          )}

          {/* Azioni */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-medium">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2 bg-brand-dark/50 border border-brand-medium/50 rounded-lg text-brand-peach hover:bg-brand-dark hover:border-brand-peach transition-all disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-brand-peach to-brand-orange text-white rounded-lg font-medium hover:from-brand-peach/90 hover:to-brand-orange/90 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isSubmitting ? 'Salvando...' : 'Salva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
