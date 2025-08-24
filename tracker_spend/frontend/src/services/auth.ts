// Servizio di autenticazione per il frontend React
// Si connette al backend Flutter tramite API

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'user' | 'premium' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'deleted';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  profile?: Record<string, any>;
}

export interface LoginData {
  identifier: string; // username o email
  password: string;
  rememberMe: boolean;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  token?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private baseUrl = 'http://localhost:3001/api/auth'; // URL del backend
  private tokenKey = 'authToken';
  private userKey = 'user';

  // Ottieni il token salvato
  getToken(): string | null {
    const localToken = localStorage.getItem(this.tokenKey);
    const sessionToken = sessionStorage.getItem(this.tokenKey);
    const token = localToken || sessionToken;
    
    return token;
  }

  // Ottieni l'utente salvato
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Salva i dati di autenticazione
  saveAuthData(token: string, user: any, rememberMe: boolean = false): void {
    console.log('saveAuthData called with token:', token ? 'present' : 'missing');
    console.log('saveAuthData called with user:', user);
    console.log('saveAuthData called with rememberMe:', rememberMe);
    
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
    storage.setItem(this.userKey, JSON.stringify(user));
    
    console.log('Token saved to storage:', storage.getItem(this.tokenKey) ? 'yes' : 'no');
    console.log('User saved to storage:', storage.getItem(this.userKey) ? 'yes' : 'no');
    
    // Emetti evento di login
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: true, user } 
    }));
  }

  // Rimuovi i dati di autenticazione
  clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    
    // Emetti evento di logout
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: false } 
    }));
  }

  // Controlla se l'utente è autenticato
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
          rememberMe: data.rememberMe,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Debug: log della risposta
        console.log('Login response:', result);
        
        // Salva i dati di autenticazione
        if (result.token && result.user) {
          console.log('Saving token:', result.token);
          this.saveAuthData(result.token, result.user, data.rememberMe);
          console.log('Token saved successfully');
        } else {
          console.error('Token or user missing in response');
        }
        return result;
      } else {
        return {
          success: false,
          error: result.error || 'Errore durante il login',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Errore di connessione. Verifica che il backend sia in esecuzione.',
      };
    }
  }

  // Registrazione
  async register(data: RegistrationData): Promise<AuthResponse> {
    try {
      console.log('=== REGISTRATION DEBUG START ===');
      console.log('Sending registration data:', {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone
      });

      const requestBody = {
        username: data.username,
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || '',
        // Nota: confirmPassword, acceptTerms, acceptNewsletter non vengono inviati al backend
        // perché sono validati solo lato frontend
      };

      console.log('Request body:', requestBody);
      console.log('API URL:', `${this.baseUrl}/register`);

      const response = await fetch(`${this.baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        console.log('✅ Registration successful');
        
        // Salva automaticamente il token e l'utente dopo la registrazione
        if (result.token && result.user) {
          console.log('Saving token and user data after registration');
          this.saveAuthData(result.token, result.user);
        }
        
        console.log('=== REGISTRATION DEBUG END ===');
        return result;
      } else {
        console.error('❌ Registration failed:', result);
        console.log('=== REGISTRATION DEBUG END ===');
        return {
          success: false,
          error: result.error || 'Errore durante la registrazione',
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.log('=== REGISTRATION DEBUG END ===');
      return {
        success: false,
        error: 'Errore di connessione. Verifica che il backend sia in esecuzione.',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Verifica email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Aggiorna i dati dell'utente se necessario
        if (result.user) {
          const currentUser = this.getUser();
          if (currentUser && currentUser.id === result.user.id) {
            this.saveAuthData(this.getToken()!, result.user);
          }
        }
        return result;
      } else {
        return {
          success: false,
          error: result.error || 'Errore durante la verifica email',
        };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'Errore di connessione',
      };
    }
  }

  // Reset password
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return result;
      } else {
        return {
          success: false,
          error: result.error || 'Errore nell\'invio dell\'email di reset',
        };
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: 'Errore di connessione',
      };
    }
  }

  // Cambia password con token
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return result;
      } else {
        return {
          success: false,
          error: result.error || 'Errore durante il reset della password',
        };
      }
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Errore di connessione',
      };
    }
  }

  // Aggiorna profilo utente
  async updateProfile(profileData: Record<string, any>): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Utente non autenticato',
        };
      }

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Aggiorna i dati dell'utente salvati
        if (result.user) {
          this.saveAuthData(token, result.user);
        }
        return result;
      } else {
        return {
          success: false,
          error: result.error || 'Errore durante l\'aggiornamento del profilo',
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'Errore di connessione',
      };
    }
  }

  // Cambia password dell'utente corrente
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Utente non autenticato',
        };
      }

      const response = await fetch(`${this.baseUrl}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return result;
      } else {
        return {
          success: false,
          error: result.error || 'Errore durante il cambio password',
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Errore di connessione',
      };
    }
  }

  // Verifica se il token è ancora valido
  async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Ottieni headers per le richieste autenticate
  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Istanza singleton del servizio
export const authService = new AuthService();
