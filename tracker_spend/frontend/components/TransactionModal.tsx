import React, { useState, useEffect } from 'react';
import { Transaction, TransactionForm } from '../types';
import { useCategories } from '../src/hooks/useCategories';
import { validateTransaction } from '../src/utils/validators';
import { formatCurrency } from '../src/utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: TransactionForm) => Promise<void>;
  transaction?: Transaction | null;
  title?: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transaction = null,
  title = 'Nuova Transazione'
}) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState<TransactionForm>({
    amount: 0,
    description: '',
    category_id: undefined,
    transaction_date: new Date().toISOString().split('T')[0],
    type: 'expense',
    payment_method: '',
    location: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popola il form quando viene passata una transazione esistente
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category_id || undefined,
        transaction_date: transaction.transaction_date,
        type: transaction.type,
        payment_method: transaction.payment_method || '',
        location: transaction.location || ''
      });
    } else {
      // Reset del form per nuova transazione
      setFormData({
        amount: 0,
        description: '',
        category_id: undefined,
        transaction_date: new Date().toISOString().split('T')[0],
        type: 'expense',
        payment_method: '',
        location: ''
      });
    }
    setErrors([]);
  }, [transaction, isOpen]);

  const handleInputChange = (field: keyof TransactionForm, value: any) => {
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
    const validation = validateTransaction(formData);
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

          {/* Tipo di transazione */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Tipo di Transazione
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`p-3 rounded-lg border transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                    : 'bg-brand-dark/50 border-brand-medium/50 text-brand-peach/60 hover:border-brand-peach/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                  <span>Uscita</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`p-3 rounded-lg border transition-all ${
                  formData.type === 'income'
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-brand-dark/50 border-brand-medium/50 text-brand-peach/60 hover:border-brand-peach/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                  <span>Entrata</span>
                </div>
              </button>
            </div>
          </div>

          {/* Importo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Importo
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

          {/* Descrizione */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Descrizione
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
              placeholder="Descrizione della transazione"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Categoria
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) => handleInputChange('category_id', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors"
            >
              <option value="">Seleziona una categoria</option>
              {categories
                .filter(cat => cat.type === formData.type)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Data
            </label>
            <input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => handleInputChange('transaction_date', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors"
              required
            />
          </div>

          {/* Metodo di pagamento */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Metodo di Pagamento (opzionale)
            </label>
            <input
              type="text"
              value={formData.payment_method}
              onChange={(e) => handleInputChange('payment_method', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
              placeholder="Es. Carta di credito, Contanti, Bonifico"
            />
          </div>

          {/* Località */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Località (opzionale)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
              placeholder="Es. Milano, Centro Commerciale"
            />
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

export default TransactionModal;
