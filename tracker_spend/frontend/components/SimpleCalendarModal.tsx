import React, { useState } from 'react';

interface SimpleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onAddEvent: (event: {
    date: string;
    amount: number;
    type: 'income' | 'expense';
    description: string;
  }) => void;
}

const SimpleCalendarModal: React.FC<SimpleCalendarModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onAddEvent
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    description: ''
  });

  console.log('SimpleModal - isOpen:', isOpen, 'selectedDate:', selectedDate);

  if (!isOpen) {
    console.log('SimpleModal - not open');
    return null;
  }

  if (!selectedDate) {
    console.log('SimpleModal - no selected date');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SimpleModal - form submitted:', formData);
    
    if (!formData.amount || !formData.description) {
      alert('Compila tutti i campi!');
      return;
    }

    const newEvent = {
      date: selectedDate.toISOString().split('T')[0],
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description
    };

    console.log('SimpleModal - creating event:', newEvent);
    onAddEvent(newEvent);

    // Reset form
    setFormData({
      amount: '',
      type: 'expense',
      description: ''
    });
    
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: '#2C2C3A',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
            Aggiungi Transazione
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#A0A0B0',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          padding: '0.75rem', 
          borderRadius: '8px', 
          marginBottom: '1rem' 
        }}>
          <p style={{ color: '#A0A0B0', fontSize: '0.875rem', margin: '0 0 0.25rem 0' }}>
            Data selezionata:
          </p>
          <p style={{ color: '#FFFFFF', fontWeight: '600', margin: 0 }}>
            {selectedDate.toLocaleDateString('it-IT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Tipo di Transazione
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'expense')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: formData.type === 'expense' ? '2px solid #FF6B6B' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: formData.type === 'expense' ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: formData.type === 'expense' ? '#FF6B6B' : '#A0A0B0',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Uscita
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('type', 'income')}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: formData.type === 'income' ? '2px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: formData.type === 'income' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: formData.type === 'income' ? '#4CAF50' : '#A0A0B0',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Entrata
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Importo (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.875rem'
              }}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#FFFFFF', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
              Descrizione
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.875rem'
              }}
              placeholder="Es. Spesa supermercato"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#A0A0B0',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#8A2BE2',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Aggiungi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleCalendarModal;
