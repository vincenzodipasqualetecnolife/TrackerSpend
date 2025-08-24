import React, { useState } from 'react';
import PageHeader from './PageHeader';

interface AdvancedSettingsProps {
  onNavigateBack: () => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onNavigateBack }) => {
  const [settings, setSettings] = useState({
    currency: 'EUR',
    language: 'it',
    showDecimals: false,
    roundDecimals: true,
    darkMode: true,
    notifications: true,
    autoSync: true,
    backupFrequency: 'weekly'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const currencies = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dollaro USA' },
    { code: 'GBP', symbol: '£', name: 'Sterlina' },
    { code: 'JPY', symbol: '¥', name: 'Yen' }
  ];

  const languages = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const backupFrequencies = [
    { value: 'daily', label: 'Giornaliero' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' },
    { value: 'never', label: 'Mai' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Impostazioni Avanzate"
        onBack={onNavigateBack}
      />

      {/* Currency Settings */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Valuta</h2>
        <div className="space-y-2 sm:space-y-3">
          {currencies.map(currency => (
            <div key={currency.code} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-base sm:text-lg">{currency.symbol}</span>
                <div>
                  <p className="font-medium text-sm sm:text-base">{currency.name}</p>
                  <p className="text-xs sm:text-sm text-buddy-text-secondary">{currency.code}</p>
                </div>
              </div>
              <input
                type="radio"
                name="currency"
                value={currency.code}
                checked={settings.currency === currency.code}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary focus:ring-buddy-purple"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Lingua</h2>
        <div className="space-y-2 sm:space-y-3">
          {languages.map(language => (
            <div key={language.code} className="flex items-center justify-between">
              <span className="font-medium text-sm sm:text-base">{language.name}</span>
              <input
                type="radio"
                name="language"
                value={language.code}
                checked={settings.language === language.code}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary focus:ring-buddy-purple"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Visualizzazione</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm sm:text-base">Mostra due decimali</p>
              <p className="text-xs sm:text-sm text-buddy-text-secondary">Mostra sempre i centesimi negli importi</p>
            </div>
            <input
              type="checkbox"
              checked={settings.showDecimals}
              onChange={(e) => handleSettingChange('showDecimals', e.target.checked)}
              className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary rounded focus:ring-buddy-purple"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm sm:text-base">Arrotonda i decimali nei riepiloghi</p>
              <p className="text-xs sm:text-sm text-buddy-text-secondary">Arrotonda i totali per una migliore leggibilità</p>
            </div>
            <input
              type="checkbox"
              checked={settings.roundDecimals}
              onChange={(e) => handleSettingChange('roundDecimals', e.target.checked)}
              className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary rounded focus:ring-buddy-purple"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm sm:text-base">Modalità scura</p>
              <p className="text-xs sm:text-sm text-buddy-text-secondary">Usa il tema scuro dell'applicazione</p>
            </div>
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary rounded focus:ring-buddy-purple"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Notifiche</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm sm:text-base">Notifiche push</p>
              <p className="text-xs sm:text-sm text-buddy-text-secondary">Ricevi notifiche per promemoria e aggiornamenti</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary rounded focus:ring-buddy-purple"
            />
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Sincronizzazione</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm sm:text-base">Sincronizzazione automatica</p>
              <p className="text-xs sm:text-sm text-buddy-text-secondary">Sincronizza automaticamente i dati con il cloud</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
              className="w-4 h-4 text-buddy-purple bg-buddy-dark border-buddy-text-secondary rounded focus:ring-buddy-purple"
            />
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Backup</h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-buddy-text-secondary mb-1 sm:mb-2">
              Frequenza backup
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full bg-buddy-dark text-buddy-text-primary p-2.5 sm:p-3 rounded-lg border-none focus:ring-2 focus:ring-buddy-purple text-sm sm:text-base"
            >
              {backupFrequencies.map(freq => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
          
          <button className="w-full bg-buddy-purple text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Backup Manuale Ora
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Gestione Dati</h2>
        <div className="space-y-2 sm:space-y-3">
          <button className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Esporta Dati
          </button>
          <button className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Importa Dati
          </button>
          <button className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base">
            Elimina Tutti i Dati
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-buddy-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-bold">Informazioni</h2>
        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-buddy-text-secondary">
          <p>Versione: 1.0.0</p>
          <p>Build: 2024.01.15</p>
          <p>© 2024 TrackerSpend. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;
