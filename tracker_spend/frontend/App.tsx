
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Budget from './components/Budget';
import Settings from './components/Settings';
import Wallets from './components/Wallets';
import TransactionList from './components/TransactionList';
import LinkedAccounts from './components/LinkedAccounts';
import AdvancedSettings from './components/AdvancedSettings';
import AnalyticsPage from './components/AnalyticsPage';
import CalendarPage from './components/CalendarPage';
import PredictionsPage from './components/PredictionsPage';
import ProfilePage from './components/ProfilePage';
import Goals from './components/Goals';
import Education from './components/Education';
import ReviewOptimize from './components/ReviewOptimize';
import RiskGuard from './components/RiskGuard';
import LoginPage from './components/auth/LoginPage';
import RegistrationPage from './components/auth/RegistrationPage';
import SplashScreen from './components/SplashScreen';
import ParticleEffect from './components/ParticleEffect';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import { useApiConnection } from './src/services/api';
import { authService } from './src/services/auth';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import { ToastProvider } from './src/contexts/ToastContext';

// Layout principale per le pagine autenticate
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, isLoading } = useApiConnection();
  const [splashReady, setSplashReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const minMs = 3500;
    const t = setTimeout(() => setSplashReady(true), minMs);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
  };

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'dashboard';
    if (path === '/budget') return 'budget';
    if (path === '/wallets') return 'wallets';
    if (path === '/goals') return 'goals';
    if (path === '/education') return 'education';
    if (path === '/review-optimize') return 'review-optimize';
    if (path === '/risk-guard') return 'risk-guard';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  const showSplash = !splashReady || isLoading;

  // Lock scroll when splash is visible
  useEffect(() => {
    if (showSplash) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showSplash]);

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-auto bg-brand-dark">
      {/* Effetto particelle interattive */}
      <ParticleEffect />
      
      {/* Layout con sidebar */}
      <div className="flex">
        {/* Contenuto principale */}
        <div className="flex-1 relative z-20 pb-12 overflow-x-hidden">
          <div className="w-full max-w-full mx-auto px-2 sm:px-3 md:px-4 lg:px-6">
            {children}
          </div>
        </div>
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          currentPage={getCurrentTab()}
        />
      </div>
      
      {/* Pulsante toggle sidebar */}
      <SidebarToggle 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* BottomNav sticky */}
      <div className="sticky bottom-2 z-30">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto flex justify-center">
          <BottomNav activeTab={getCurrentTab()} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Splash overlay full-screen */}
      {showSplash && (
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>
          <SplashScreen message="" />
        </div>
      )}
    </div>
  );
};

// Componente per le pagine che richiedono autenticazione
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  
  // Listener per i cambiamenti di autenticazione
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      
      if (!authStatus) {
        navigate('/login', { replace: true });
      }
    };
    
    // Controlla l'autenticazione ogni volta che la pagina cambia
    checkAuth();
    
    // Listener per i cambiamenti di storage (logout)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' || e.key === 'authUser') {
        checkAuth();
      }
    };
    
    // Listener per eventi di autenticazione personalizzati
    const handleAuthStateChange = (e: CustomEvent) => {
      setIsAuthenticated(e.detail.isAuthenticated);
      if (!e.detail.isAuthenticated) {
        navigate('/login', { replace: true });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
    };
  }, [navigate]);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <MainLayout>{children}</MainLayout>;
};

// Componente per le pagine di autenticazione
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper per LoginPage con navigazione
const LoginPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <LoginPage 
      onNavigateToRegister={() => navigate('/register')}
      onLoginSuccess={() => navigate('/dashboard')}
    />
  );
};

// Wrapper per RegistrationPage con navigazione
const RegistrationPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <RegistrationPage 
      onNavigateToLogin={() => navigate('/login')}
      onRegisterSuccess={() => navigate('/dashboard')}
    />
  );
};

// Wrapper per Dashboard con navigazione
const DashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Dashboard onNavigateToSubPage={(subPage) => {
      if (subPage === 'transaction-list') {
        navigate('/transactions');
      } else if (subPage === 'linked-accounts') {
        navigate('/linked-accounts');
      } else if (subPage === 'analytics') {
        navigate('/analytics');
      } else if (subPage === 'calendar') {
        navigate('/calendar');
      } else if (subPage === 'predictions') {
        navigate('/predictions');
      }
    }} />
  );
};

// Wrapper per Settings con navigazione
const SettingsWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Settings 
      onNavigateToSubPage={(subPage) => {
        if (subPage === 'advanced-settings') {
          navigate('/advanced-settings');
        } else if (subPage === 'linked-accounts') {
          navigate('/linked-accounts');
        } else if (subPage === 'profile') {
          navigate('/profile');
        }
      }}
      onLogout={() => {
        authService.logout();
        navigate('/login');
      }}
    />
  );
};

// Wrapper per LinkedAccounts con navigazione
const LinkedAccountsWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <LinkedAccounts onNavigateBack={() => navigate(-1)} />
  );
};

// Wrapper per AdvancedSettings con navigazione
const AdvancedSettingsWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <AdvancedSettings onNavigateBack={() => navigate(-1)} />
  );
};

// Wrapper per AnalyticsPage con navigazione
const AnalyticsPageWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <AnalyticsPage onBack={() => navigate(-1)} />
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <Router>
        <Routes>
        {/* Pagine di autenticazione */}
        <Route path="/login" element={
          <AuthLayout>
            <LoginPageWrapper />
          </AuthLayout>
        } />
        
        <Route path="/register" element={
          <AuthLayout>
            <RegistrationPageWrapper />
          </AuthLayout>
        } />

        {/* Pagine principali protette */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardWrapper />
          </ProtectedRoute>
        } />

        <Route path="/budget" element={
          <ProtectedRoute>
            <Budget />
          </ProtectedRoute>
        } />

        <Route path="/wallets" element={
          <ProtectedRoute>
            <Wallets />
          </ProtectedRoute>
        } />

        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />

        <Route path="/education" element={
          <ProtectedRoute>
            <Education />
          </ProtectedRoute>
        } />

        <Route path="/review-optimize" element={
          <ProtectedRoute>
            <PredictionsPage />
          </ProtectedRoute>
        } />

        <Route path="/risk-guard" element={
          <ProtectedRoute>
            <RiskGuard />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsWrapper />
          </ProtectedRoute>
        } />

        {/* Sub-pages protette */}
        <Route path="/transactions" element={
          <ProtectedRoute>
            <TransactionList />
          </ProtectedRoute>
        } />

        <Route path="/linked-accounts" element={
          <ProtectedRoute>
            <LinkedAccountsWrapper />
          </ProtectedRoute>
        } />

        <Route path="/advanced-settings" element={
          <ProtectedRoute>
            <AdvancedSettingsWrapper />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <AnalyticsPageWrapper />
          </ProtectedRoute>
        } />

        <Route path="/predictions" element={
          <ProtectedRoute>
            <PredictionsPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        } />

        {/* Redirect di default */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
        </Router>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
