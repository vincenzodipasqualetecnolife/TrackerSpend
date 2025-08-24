import React from 'react';
import ActionButton from './ActionButton';

interface LinkedAccount {
  name: string;
  balance: number;
  currency?: string;
  status?: 'connected' | 'disconnected' | 'error';
}

interface LinkedAccountsSectionProps {
  accounts: LinkedAccount[];
  onManageAccounts?: () => void;
  onSettings?: () => void;
  className?: string;
}

const LinkedAccountsSection: React.FC<LinkedAccountsSectionProps> = ({
  accounts,
  onManageAccounts,
  onSettings,
  className = ''
}) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
        return 'text-buddy-lime';
      case 'disconnected':
        return 'text-buddy-warning';
      case 'error':
        return 'text-buddy-error';
      default:
        return 'text-buddy-lime';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'disconnected':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-buddy-text-primary">Conti collegati</h2>
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            }
            variant="secondary"
            onClick={onManageAccounts}
          />
          <ActionButton
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.96.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            }
            variant="secondary"
            onClick={onSettings}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.name} className="flex justify-between items-center p-4 bg-buddy-dark-tertiary rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`${getStatusColor(account.status)}`}>
                {getStatusIcon(account.status)}
              </div>
              <div>
                <span className="font-medium text-buddy-text-primary">{account.name}</span>
                <div className="text-xs text-buddy-text-secondary">
                  {account.status === 'connected' ? 'Connesso' : 
                   account.status === 'disconnected' ? 'Disconnesso' : 
                   account.status === 'error' ? 'Errore' : 'Sconosciuto'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-semibold text-buddy-lime">
                {account.balance.toFixed(2)} {account.currency || 'EUR'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center pt-2">
        <p className="text-xs text-buddy-text-secondary">
          Ultima sincronizzazione: {new Date().toLocaleDateString('it-IT')}
        </p>
      </div>
    </div>
  );
};

export default LinkedAccountsSection;
