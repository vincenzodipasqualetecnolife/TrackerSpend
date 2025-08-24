import React, { useState, useEffect } from 'react';
import { Budget, BudgetForm } from '../types';
import { useCategories } from '../src/hooks/useCategories';
import { validateBudget } from '../src/utils/validators';
import { formatCurrency } from '../src/utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: BudgetForm) => Promise<void>;
  budget?: Budget | null;
  title?: string;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  budget = null,
  title = 'Nuovo Budget'
}) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState<BudgetForm>({
    name: '',
    amount: 0,
    category_id: undefined,
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popola il form quando viene passato un budget esistente
  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount,
        category_id: budget.category_id || undefined,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date || '',
        description: budget.description || ''
      });
    } else {
      // Reset del form per nuovo budget
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ultimo giorno del mese
      
      setFormData({
        name: '',
        amount: 0,
        category_id: undefined,
        period: 'monthly',
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        description: ''
      });
    }
    setErrors([]);
  }, [budget, isOpen]);

  const handleInputChange = (field: keyof BudgetForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Pulisci gli errori quando l'utente modifica un campo
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Calcola automaticamente la data di fine in base al periodo
  const handlePeriodChange = (period: string) => {
    const startDate = new Date(formData.start_date);
    let endDate = new Date(startDate);

    switch (period) {
      case 'daily':
        endDate = new Date(startDate);
        break;
      case 'weekly':
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      case 'yearly':
        endDate = new Date(startDate.getFullYear(), 11, 31);
        break;
    }

    setFormData(prev => ({
      ...prev,
      period: period as 'daily' | 'weekly' | 'monthly' | 'yearly',
      end_date: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    const validation = validateBudget(formData);
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

  // Calcola il numero di giorni nel periodo
  const calculateDaysInPeriod = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calcola il budget giornaliero
  const calculateDailyBudget = () => {
    const days = calculateDaysInPeriod();
    return days > 0 ? formData.amount / days : 0;
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
              Nome Budget
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
              placeholder="Es. Budget Alimentari, Budget Shopping"
              required
            />
          </div>

          {/* Importo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Importo Budget
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-peach/60">
                €
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg pl-8 pr-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Categoria (opzionale)
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleInputChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors"
            >
              <option value="">Tutte le categorie</option>
              {categories
                .filter(cat => cat.type === 'expense')
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Periodo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Periodo
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'daily', label: 'Giornaliero', icon: '📅' },
                { value: 'weekly', label: 'Settimanale', icon: '📆' },
                { value: 'monthly', label: 'Mensile', icon: '📊' },
                { value: 'yearly', label: 'Annuale', icon: '📈' }
              ].map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => handlePeriodChange(period.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.period === period.value
                      ? 'bg-brand-peach/20 border-brand-peach/50 text-brand-peach'
                      : 'bg-brand-dark/50 border-brand-medium/50 text-brand-peach/60 hover:border-brand-peach/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{period.icon}</span>
                    <span className="text-sm">{period.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Data di inizio */}
            <div>
              <label className="block text-sm font-medium text-brand-peach mb-2">
                Data di Inizio
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors"
                required
              />
            </div>

            {/* Data di fine */}
            <div>
              <label className="block text-sm font-medium text-brand-peach mb-2">
                Data di Fine
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors"
                required
              />
            </div>
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
              placeholder="Descrizione del budget..."
              rows={3}
            />
          </div>

          {/* Riepilogo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Riepilogo
            </label>
            <div className="bg-brand-dark/30 rounded-lg p-4 border border-brand-medium space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Periodo:</span>
                <span className="text-white font-medium">
                  {formData.start_date && formData.end_date ? 
                    `${new Date(formData.start_date).toLocaleDateString('it-IT')} - ${new Date(formData.end_date).toLocaleDateString('it-IT')}` : 
                    'Non definito'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Giorni totali:</span>
                <span className="text-white font-medium">{calculateDaysInPeriod()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Budget giornaliero:</span>
                <span className="text-white font-medium">{formatCurrency(calculateDailyBudget())}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-peach/80">Budget totale:</span>
                <span className="text-white font-medium">{formatCurrency(formData.amount)}</span>
              </div>
            </div>
          </div>

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

export default BudgetModal;
