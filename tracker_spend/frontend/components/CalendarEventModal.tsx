import React, { useState } from 'react';
import Card from './Card';
import FlatButton from './FlatButton';
import ActionButton from './ActionButton';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onAddEvent: (event: {
    date: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
  }) => void;
  existingEvents?: Array<{
    date: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
  }>;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onAddEvent,
  existingEvents = []
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: ''
  });

  if (!isOpen) return null;
  if (!selectedDate) {
    console.log('Modal: selectedDate is null');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    if (!formData.amount || !formData.description) {
      console.log('Form validation failed');
      return;
    }

    const newEvent = {
      date: selectedDate.toISOString().split('T')[0],
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description
    };

    console.log('Creating new event:', newEvent);
    onAddEvent(newEvent);

    // Reset form
    setFormData({
      amount: '',
      type: 'expense',
      description: ''
    });
    
    console.log('Closing modal after submit');
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  console.log('Modal rendering - isOpen:', isOpen, 'selectedDate:', selectedDate);
  
  return (
    <div className="fixed inset-0 bg-brand-brown/90 flex items-center justify-center z-[9999] p-4">
      <div className="w-full max-w-md sm:max-w-lg bg-brand-secondary border border-brand-medium rounded-2xl p-6 sm:p-7 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold gradient-text">Aggiungi Transazione</h2>
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            variant="secondary"
            onClick={onClose}
          />
        </div>

        <div className="mb-4 p-3 bg-buddy-card/30 rounded-lg">
          <p className="text-sm text-buddy-text-secondary">Data selezionata:</p>
          <p className="font-semibold text-buddy-text-primary">
            {selectedDate.toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Riepilogo transazioni esistenti */}
        {existingEvents.length > 0 && (
          <div className="mb-4 p-3 bg-brand-medium/20 rounded-lg border border-brand-medium">
            <h4 className="text-sm font-medium text-white mb-2">Transazioni esistenti:</h4>
            <div className="space-y-1">
              {existingEvents.map((event, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-brand-peach">{event.description}</span>
                  <span className={`font-semibold ${event.type === 'income' ? 'text-brand-peach' : 'text-brand-orange'}`}>
                    {event.type === 'income' ? '+' : '-'}€{event.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-buddy-text-primary mb-2">
              Tipo di Transazione
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.type === 'expense'
                    ? 'bg-brand-orange/20 text-brand-orange border-2 border-brand-orange/50'
                    : 'bg-brand-medium text-brand-peach/70 hover:bg-brand-secondary'
                }`}
              >
                Uscita
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  formData.type === 'income'
                    ? 'bg-brand-peach/20 text-brand-peach border-2 border-brand-peach/50'
                    : 'bg-brand-medium text-brand-peach/70 hover:bg-brand-secondary'
                }`}
              >
                Entrata
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-buddy-text-primary mb-2">
              Importo (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-3 py-2 bg-brand-medium border border-brand-medium rounded-lg text-white font-medium placeholder-brand-peach/70 focus:outline-none focus:ring-2 focus:ring-brand-peach/50 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-buddy-text-primary mb-2">
              Descrizione
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-brand-medium border border-brand-medium rounded-lg text-white font-medium placeholder-brand-peach/70 focus:outline-none focus:ring-2 focus:ring-brand-peach/50 focus:border-transparent"
              placeholder="Es. Spesa supermercato"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <FlatButton
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Annulla
            </FlatButton>
            <FlatButton
              variant="primary"
              fullWidth
            >
              Aggiungi
            </FlatButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarEventModal;
