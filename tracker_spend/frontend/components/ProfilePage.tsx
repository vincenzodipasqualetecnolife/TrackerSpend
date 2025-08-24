import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiConnectionWithAuth } from '../src/services/api';
import { ApiService } from '../src/services/api';
import PageHeader from './PageHeader';
import Card from './Card';
import FlatButton from './FlatButton';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, isAuthenticated, isLoading } = useApiConnectionWithAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Carica il profilo utente
  const loadProfile = async () => {
    if (!isConnected || !isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getCurrentUser();
      if (response.data) {
        setProfile(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  // Carica il profilo quando il componente si monta
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Gestisce il cambio dei campi del form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Salva le modifiche del profilo
  const handleSave = async () => {
    if (!isConnected || !isAuthenticated) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await ApiService.updateProfile(formData);
      if (response.data) {
        setProfile(response.data);
        setSuccess('Profilo aggiornato con successo!');
        // Nasconde il messaggio di successo dopo 3 secondi
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Errore nell\'aggiornamento del profilo');
    } finally {
      setSaving(false);
    }
  };

  // Connection status component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-peach mx-auto mb-4"></div>
          <p className="text-brand-peach/70">Connessione in corso...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Connessione Persa</h2>
          <p className="text-brand-peach/70 mb-4">Impossibile connettersi al server</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-peach text-white px-4 py-2 rounded-lg hover:bg-brand-peach/90 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <PageHeader
        title="Profilo Utente"
        subtitle="Gestisci le tue informazioni personali"
        onBack={() => navigate('/settings')}
        showLogo={true}
      />

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Messaggi di errore e successo */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-500 font-medium text-sm sm:text-base">Errore</span>
            </div>
            <p className="text-red-500/70 text-xs sm:text-sm mt-1 sm:mt-2">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500 font-medium text-sm sm:text-base">Successo</span>
            </div>
            <p className="text-green-500/70 text-xs sm:text-sm mt-1 sm:mt-2">{success}</p>
          </div>
        )}

        {/* Informazioni del profilo */}
        <Card className="p-4 sm:p-6" variant="elevated">
          <h3 className="text-base sm:text-lg font-bold text-brand-peach mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl">👤</span>
            Informazioni Personali
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-brand-medium/30 rounded animate-pulse w-24"></div>
                  <div className="h-10 bg-brand-medium/30 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="first_name" className="block text-xs sm:text-sm font-medium text-brand-peach/80 mb-1 sm:mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-dark border border-brand-medium rounded-lg text-white placeholder-brand-peach/50 focus:outline-none focus:border-brand-peach transition-colors text-sm sm:text-base"
                  placeholder="Inserisci il tuo nome"
                />
              </div>

              {/* Cognome */}
              <div>
                <label htmlFor="last_name" className="block text-xs sm:text-sm font-medium text-brand-peach/80 mb-1 sm:mb-2">
                  Cognome *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-dark border border-brand-medium rounded-lg text-white placeholder-brand-peach/50 focus:outline-none focus:border-brand-peach transition-colors text-sm sm:text-base"
                  placeholder="Inserisci il tuo cognome"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-brand-peach/80 mb-1 sm:mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-dark border border-brand-medium rounded-lg text-white placeholder-brand-peach/50 focus:outline-none focus:border-brand-peach transition-colors text-sm sm:text-base"
                  placeholder="Inserisci la tua email"
                />
              </div>

              {/* Telefono */}
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-brand-peach/80 mb-1 sm:mb-2">
                  Telefono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-dark border border-brand-medium rounded-lg text-white placeholder-brand-peach/50 focus:outline-none focus:border-brand-peach transition-colors text-sm sm:text-base"
                  placeholder="Inserisci il tuo numero di telefono"
                />
              </div>

              {/* Pulsanti */}
              <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
                <FlatButton
                  variant="secondary"
                  onClick={() => navigate('/settings')}
                  className="flex-1"
                >
                  Annulla
                </FlatButton>
                <FlatButton
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Salvando...' : 'Salva Modifiche'}
                </FlatButton>
              </div>
            </div>
          )}
        </Card>

        {/* Informazioni aggiuntive */}
        {profile && (
          <Card className="p-4 sm:p-6" variant="elevated">
            <h3 className="text-base sm:text-lg font-bold text-brand-peach mb-4 sm:mb-6 flex items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-xl">ℹ️</span>
              Informazioni Account
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-peach/80">Username</span>
                <span className="text-sm font-medium text-white">{profile.username}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-peach/80">Stato Account</span>
                <span className={`text-sm font-medium ${profile.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {profile.is_active ? 'Attivo' : 'Inattivo'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-brand-peach/80">Data Registrazione</span>
                <span className="text-sm font-medium text-white">
                  {new Date(profile.created_at).toLocaleDateString('it-IT')}
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
