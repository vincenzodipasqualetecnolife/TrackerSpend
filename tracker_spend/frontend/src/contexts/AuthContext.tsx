import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPreferences, LoginForm, RegisterForm } from '../../types';
import { ApiService } from '../services/api';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  preferences: UserPreferences | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper per dispatchare eventi di autenticazione
  const dispatchAuthEvent = (isAuthenticated: boolean, userData: User | null) => {
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { isAuthenticated, user: userData }
    } as CustomEventInit));
  };

  // Verifica se l'utente è già autenticato al caricamento
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const response = await ApiService.getCurrentUser();
          if (response.data) {
            setUser(response.data);
            // Carica le preferenze dell'utente
            await loadUserPreferences();
          } else {
            // Token non valido, rimuovi
            authService.clearAuthData();
          }
        }
      } catch (error) {
        console.error('Errore nel controllo autenticazione:', error);
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Carica le preferenze dell'utente
  const loadUserPreferences = async () => {
    try {
      // Per ora usiamo preferenze di default
      // In futuro implementeremo un endpoint per le preferenze
      const defaultPreferences: UserPreferences = {
        id: 0,
        user_id: 0,
        currency: 'EUR',
        language: 'it',
        timezone: 'Europe/Rome',
        notifications_enabled: true,
        theme: 'dark',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Errore nel caricamento preferenze:', error);
    }
  };

  // Login
  const login = async (credentials: LoginForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login({
        identifier: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });
      
      if (result.success && result.user && result.token) {
        // Converti il tipo User da auth.ts al tipo User di types.ts
        const convertedUser: User = {
          id: parseInt(result.user.id),
          username: result.user.username,
          email: result.user.email,
          first_name: result.user.firstName,
          last_name: result.user.lastName,
          phone: result.user.phone,
          created_at: result.user.createdAt,
          updated_at: result.user.createdAt, // Usa createdAt come fallback
          is_active: result.user.status === 'active',
          role: result.user.role === 'admin' ? 'admin' : 'user'
        };
        
        setUser(convertedUser);
        await loadUserPreferences();
        
        // Notifica il cambio di stato
        dispatchAuthEvent(true, convertedUser);
      } else {
        throw new Error(result.error || 'Errore durante il login');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il login';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Chiama l'endpoint di logout tramite authService
      await authService.logout();
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      // Pulisci sempre i dati locali
      authService.clearAuthData();
      setUser(null);
      setPreferences(null);
      setError(null);
      
      // Notifica il cambio di stato
      dispatchAuthEvent(false, null);
      
      setIsLoading(false);
    }
  };

  // Registrazione
  const register = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.password, // Usa la stessa password come conferma
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        phone: undefined,
        acceptTerms: true,
        acceptNewsletter: false
      });
      
      if (result.success && result.user && result.token) {
        // Converti il tipo User da auth.ts al tipo User di types.ts
        const convertedUser: User = {
          id: parseInt(result.user.id),
          username: result.user.username,
          email: result.user.email,
          first_name: result.user.firstName,
          last_name: result.user.lastName,
          phone: result.user.phone,
          created_at: result.user.createdAt,
          updated_at: result.user.createdAt, // Usa createdAt come fallback
          is_active: result.user.status === 'active',
          role: result.user.role === 'admin' ? 'admin' : 'user'
        };
        
        setUser(convertedUser);
        await loadUserPreferences();
        
        // Notifica il cambio di stato
        dispatchAuthEvent(true, convertedUser);
      } else {
        throw new Error(result.error || 'Errore durante la registrazione');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante la registrazione';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Aggiorna preferenze
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const response = await ApiService.updateUserPreferences(newPreferences);
      if (response.data) {
        setPreferences(response.data);
      } else {
        throw new Error(response.error || 'Errore durante l\'aggiornamento delle preferenze');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'aggiornamento delle preferenze';
      setError(errorMessage);
      throw error;
    }
  };

  // Ricarica dati utente
  const refreshUser = async () => {
    try {
      const response = await ApiService.getCurrentUser();
      if (response.data) {
        setUser(response.data);
        await loadUserPreferences();
      }
    } catch (error) {
      console.error('Errore nel refresh utente:', error);
      // Se il refresh fallisce, potrebbe essere scaduto il token
      await logout();
    }
  };

  // Pulisci errori
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    preferences,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    updatePreferences,
    clearError,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook per usare il context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};

export default AuthContext;
