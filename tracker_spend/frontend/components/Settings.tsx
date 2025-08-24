
import React, { useState, useEffect } from 'react';
import { ApiService, useApiConnection } from '../src/services/api';
import CategoryModal from './CategoryModal';
import PageHeader from './PageHeader';

const Toggle: React.FC<{ enabled: boolean }> = ({ enabled }) => (
    <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${enabled ? 'bg-buddy-green justify-end' : 'bg-gray-600 justify-start'}`}>
        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
    </div>
);

const SettingsRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string;
    action: 'chevron' | 'toggle' | 'lock';
    enabled?: boolean;
    colorClass?: string;
    onClick?: () => void;
}> = ({ icon, label, value, action, enabled = false, colorClass = '', onClick }) => (
    <div className={`flex items-center py-2 sm:py-3 ${onClick ? 'cursor-pointer hover:bg-buddy-dark/50 rounded-lg px-2 -mx-2' : ''}`} onClick={onClick}>
        <div className={`p-1.5 sm:p-2 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div className="flex-grow ml-3 sm:ml-4">
            <p className="font-semibold text-sm sm:text-base">{label}</p>
            {value && <p className="text-xs sm:text-sm text-buddy-text-secondary">{value}</p>}
        </div>
        {action === 'chevron' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-buddy-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
        {action === 'toggle' && <Toggle enabled={enabled} />}
        {action === 'lock' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-buddy-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
    </div>
);

interface SettingsProps {
  onNavigateToSubPage?: (subPage: string) => void;
  onLogout?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigateToSubPage, onLogout }) => {
    const iconClass = "h-5 w-5 text-white";
    const { isConnected } = useApiConnection();
    const [categories, setCategories] = useState<any[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    useEffect(() => {
      if (isConnected) {
        loadCategories();
      }
    }, [isConnected]);

    const loadCategories = async () => {
      try {
        const response = await ApiService.getCategories();
        if (response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const handleAddCategory = () => {
      setSelectedCategory(null);
      setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category: any) => {
      setSelectedCategory(category);
      setIsCategoryModalOpen(true);
    };

    const handleCategorySave = async () => {
      await loadCategories();
    };

    const handleExportReport = async () => {
      try {
        const response = await ApiService.exportTransactions();
        if (response.data) {
          alert(`Report esportato: ${response.data.filePath}`);
        }
      } catch (error) {
        console.error('Error exporting report:', error);
        alert('Errore nell\'esportazione del report');
      }
    };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-3 sm:px-4">
      <PageHeader 
        title="Impostazioni" 
        subtitle="Configura la tua esperienza"
        showLogo={true}
      />

      <div className="bg-buddy-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
        <h2 className="text-base sm:text-lg font-bold mb-2 px-2">Aspetto</h2>
        <SettingsRow 
            icon={<div className={iconClass}></div>}
            label="Quadro generale"
            action="lock"
            colorClass="bg-buddy-purple"
        />
        <SettingsRow 
            icon={<div className={iconClass}></div>}
            label="Budget"
            action="lock"
            colorClass="bg-buddy-green"
        />
        <SettingsRow 
            icon={<div className={iconClass}></div>}
            label="Portafogli"
            action="lock"
            colorClass="bg-buddy-pink"
        />
        <hr className="border-buddy-dark my-2" />
        <SettingsRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
            label="Usa le impostazioni di sistema"
            action="chevron"
            colorClass="bg-gray-600"
            onClick={() => onNavigateToSubPage?.('advanced-settings')}
        />
        <SettingsRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>}
            label="Seleziona l'icona dell'app"
            action="chevron"
            colorClass="bg-gray-600"
        />
      </div>

      <div className="bg-buddy-card p-3 sm:p-4 rounded-xl sm:rounded-2xl">
        <h2 className="text-base sm:text-lg font-bold mb-2 px-2">Account</h2>
        <SettingsRow 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            label="Profilo Utente"
            action="chevron"
            colorClass="bg-blue-500"
            onClick={() => onNavigateToSubPage?.('profile')}
        />
        <hr className="border-buddy-dark my-2" />
        <SettingsRow 
            icon={<span className="text-lg">🇺🇸</span>}
            label="Dollaro statunitense (USD)"
            action="chevron"
            colorClass="bg-transparent"
        />
        <SettingsRow 
            icon={<span className="text-lg">🇮🇹</span>}
            label="Lingua: Italiano"
            action="chevron"
            colorClass="bg-transparent"
        />
        <hr className="border-buddy-dark my-2" />
        <SettingsRow 
            label="Mostra due decimali"
            icon={<></>}
            action="toggle"
            enabled={false}
        />
        <SettingsRow 
            label="Arrotonda i decimali nei riepiloghi"
            icon={<></>}
            action="toggle"
            enabled={true}
        />
      </div>
      
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold">Report e Backup</h2>
         <button 
           onClick={handleExportReport}
           className="w-full bg-buddy-green text-buddy-dark py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
         >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
             <span>Esporta Report (PDF/Excel)</span>
         </button>
         <p className="text-xs text-center text-buddy-text-secondary">Visualizza un'anteprima grafica prima di esportare.</p>
      </div>

      {/* Categories Management */}
      {isConnected && (
        <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold">Gestione Categorie</h2>
            <button 
              onClick={handleAddCategory}
              className="bg-buddy-purple text-white p-1.5 sm:p-2 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {Array.isArray(categories) ? categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-2 sm:p-3 bg-buddy-dark rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div 
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{category.name}</p>
                    <p className="text-xs sm:text-sm text-buddy-text-secondary">
                      {category.type === 'expense' ? 'Uscita' : 'Entrata'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="text-buddy-text-secondary hover:text-blue-400 p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )) : null}
          </div>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSave={handleCategorySave}
      />

      {/* Logout Section */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-red-400">Account</h2>
        <button 
          onClick={onLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
