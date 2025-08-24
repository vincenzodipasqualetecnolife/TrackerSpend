import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { validateCategory } from '../src/utils/validators';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<Category>) => Promise<void>;
  category?: Category | null;
  title?: string;
}

// Icone disponibili per le categorie
const AVAILABLE_ICONS = [
  '💰', '🛒', '🍽️', '🚗', '🏠', '💊', '🎬', '🎮', '📚', '🏋️', 
  '✈️', '🏖️', '🎨', '🎵', '📱', '💻', '👕', '👟', '💄', '🎁',
  '💡', '🔧', '📦', '🏦', '💳', '📊', '📈', '📉', '🎯', '⭐'
];

// Colori disponibili per le categorie
const AVAILABLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#A9CCE3', '#F9E79F', '#D5A6BD', '#A2D9CE', '#FAD7A0'
];

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category = null,
  title = 'Nuova Categoria'
}) => {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    type: 'expense',
    color: AVAILABLE_COLORS[0],
    icon: AVAILABLE_ICONS[0],
    description: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Popola il form quando viene passata una categoria esistente
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        description: category.description || ''
      });
    } else {
      // Reset del form per nuova categoria
      setFormData({
        name: '',
        type: 'expense',
        color: AVAILABLE_COLORS[0],
        icon: AVAILABLE_ICONS[0],
        description: ''
      });
    }
    setErrors([]);
  }, [category, isOpen]);

  const handleInputChange = (field: keyof Category, value: any) => {
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
    const validation = validateCategory(formData);
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

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Nome Categoria
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white placeholder-brand-peach/60 focus:outline-none focus:border-brand-peach transition-colors"
              placeholder="Es. Alimentari, Trasporti, Shopping"
              required
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Tipo
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
                  <span>Uscite</span>
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
                  <span>Entrate</span>
                </div>
              </button>
            </div>
          </div>

          {/* Icona e Colore */}
          <div className="grid grid-cols-2 gap-4">
            {/* Icona */}
            <div>
              <label className="block text-sm font-medium text-brand-peach mb-2">
                Icona
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors flex items-center justify-between"
                >
                  <span className="text-2xl">{formData.icon}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showIconPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-brand-dark border border-brand-medium rounded-lg p-3 z-10 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-6 gap-2">
                      {AVAILABLE_ICONS.map((icon, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleInputChange('icon', icon);
                            setShowIconPicker(false);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-xl hover:bg-brand-medium/50 rounded-lg transition-colors"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colore */}
            <div>
              <label className="block text-sm font-medium text-brand-peach mb-2">
                Colore
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full bg-brand-dark/50 border border-brand-medium/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: formData.color }}
                    ></div>
                    <span className="text-sm">{formData.color}</span>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-brand-dark border border-brand-medium rounded-lg p-3 z-10">
                    <div className="grid grid-cols-5 gap-2">
                      {AVAILABLE_COLORS.map((color, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleInputChange('color', color);
                            setShowColorPicker(false);
                          }}
                          className="w-8 h-8 rounded-full border-2 border-white hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                        ></button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              placeholder="Descrizione della categoria..."
              rows={3}
            />
          </div>

          {/* Anteprima */}
          <div>
            <label className="block text-sm font-medium text-brand-peach mb-2">
              Anteprima
            </label>
            <div className="bg-brand-dark/30 rounded-lg p-4 border border-brand-medium">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  {formData.icon}
                </div>
                <div>
                  <div className="font-semibold text-white">{formData.name || 'Nome categoria'}</div>
                  <div className="text-sm text-brand-peach/60">
                    {formData.type === 'expense' ? 'Uscita' : 'Entrata'}
                  </div>
                </div>
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

      {/* Overlay per chiudere i picker quando si clicca fuori */}
      {(showColorPicker || showIconPicker) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowColorPicker(false);
            setShowIconPicker(false);
          }}
        />
      )}
    </div>
  );
};

export default CategoryModal;
