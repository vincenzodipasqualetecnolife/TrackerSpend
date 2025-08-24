import React, { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/contexts/ToastContext';

interface RegistrationPageProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

interface RegistrationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptTerms?: string;
  acceptNewsletter?: string;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const { showSuccess, showError } = useToast();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegistrationForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptTerms: false,
    acceptNewsletter: false,
  });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: RegistrationErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username è obbligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username deve essere di almeno 3 caratteri';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username può contenere solo lettere, numeri e underscore';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome è obbligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome è obbligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email è obbligatoria';
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
      newErrors.email = 'Inserisci un\'email valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password è obbligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password deve essere di almeno 8 caratteri';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = 'Password deve contenere maiuscola, minuscola, numero e carattere speciale';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Conferma password è obbligatoria';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Devi accettare i termini e condizioni';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMIT DEBUG START ===');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      console.log('=== FORM SUBMIT DEBUG END ===');
      return;
    }

    console.log('✅ Form validation passed');
    setIsLoading(true);
    
    try {
      console.log('Calling register from context...');
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      console.log('✅ Registration successful, calling onRegisterSuccess');
      showSuccess('Registrazione completata con successo! Il tuo account è stato creato.');
      onRegisterSuccess();
    } catch (error) {
      console.error('❌ Registration error:', error);
      showError('Errore di connessione. Riprova più tardi.');
    } finally {
      setIsLoading(false);
      console.log('=== FORM SUBMIT DEBUG END ===');
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 8) return { strength: 'Debole', color: 'text-red-400' };
    
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score === 4) return { strength: 'Forte', color: 'text-green-400' };
    if (score >= 3) return { strength: 'Media', color: 'text-yellow-400' };
    return { strength: 'Debole', color: 'text-red-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#2D373A] via-[#3A4548] to-[#2D373A]">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D373A] via-[#3A4548] to-[#2D373A] opacity-90"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8">
        {/* Logo Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center bg-[#DB9F75]/20 backdrop-blur-sm border border-[#DB9F75]/30 shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#DB9F75]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#DB9F75] drop-shadow-lg">TrackerSpend</h1>
        </div>

        {/* Glassmorphism Registration Card */}
        <div className="w-full max-w-md">
          <div className="relative">
            {/* Main Glass Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-6 relative overflow-hidden">
              {/* Inner Glass Layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-2xl"></div>
              
              {/* Subtle Border Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#DB9F75]/10 via-transparent to-[#DB9F75]/10"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Handle */}
                <div className="w-10 sm:w-12 h-1 bg-[#DB9F75]/40 rounded-full mx-auto mb-4 sm:mb-6 shadow-lg"></div>
                
                {/* Title */}
                <h2 className="text-lg sm:text-xl font-bold text-[#2D373A] text-center mb-4 sm:mb-6 drop-shadow-sm">REGISTRAZIONE</h2>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {/* Username Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 focus:border-[#DB9F75]/50 shadow-lg transition-all duration-300 text-sm sm:text-base ${
                        errors.username ? 'border-red-400' : ''
                      }`}
                      placeholder="Username"
                    />
                    {errors.username && (
                      <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.username}</p>
                    )}
                  </div>

                  {/* First Name Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 focus:border-[#DB9F75]/50 shadow-lg transition-all duration-300 text-sm sm:text-base ${
                        errors.firstName ? 'border-red-400' : ''
                      }`}
                      placeholder="Nome"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 focus:border-[#DB9F75]/50 shadow-lg transition-all duration-300 text-sm sm:text-base ${
                        errors.lastName ? 'border-red-400' : ''
                      }`}
                      placeholder="Cognome"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 focus:border-[#DB9F75]/50 shadow-lg transition-all duration-300 ${
                        errors.email ? 'border-red-400' : ''
                      }`}
                      placeholder="Email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 focus:border-[#DB9F75]/50 shadow-lg transition-all duration-300 ${
                        errors.password ? 'border-red-400' : ''
                      }`}
                      placeholder="Password"
                    />
                    {formData.password && (
                      <p className={`mt-1 text-sm ${passwordStrength.color}`}>
                        Forza password: {passwordStrength.strength}
                      </p>
                    )}
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 bg-white/95 backdrop-blur-sm border border-white/40 rounded-lg text-black font-semibold placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 focus:border-[#DB9F75]/50 shadow-lg transition-all duration-300 ${
                        errors.confirmPassword ? 'border-red-400' : ''
                      }`}
                      placeholder="Conferma Password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                      className="h-4 w-4 text-[#DB9F75] bg-white/80 border-white/40 rounded focus:ring-[#DB9F75]/50 transition-all duration-200"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-sm text-[#2D373A]/80">
                      Accetto i <a href="#" className="text-[#DB9F75] hover:text-[#DB9F75]/80">termini e condizioni</a>
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-400">{errors.acceptTerms}</p>
                  )}

                  {/* Newsletter */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="acceptNewsletter"
                      checked={formData.acceptNewsletter}
                      onChange={(e) => handleInputChange('acceptNewsletter', e.target.checked)}
                      className="h-4 w-4 text-[#DB9F75] bg-white/80 border-white/40 rounded focus:ring-[#DB9F75]/50 transition-all duration-200"
                    />
                    <label htmlFor="acceptNewsletter" className="ml-2 text-sm text-[#2D373A]/80">
                      Ricevi aggiornamenti e offerte speciali
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#DB9F75] to-[#DB9F75]/90 backdrop-blur-sm border border-[#DB9F75]/30 rounded-lg font-medium text-white hover:from-[#DB9F75]/90 hover:to-[#DB9F75] focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50 disabled:opacity-50 flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Registrazione in corso...
                      </div>
                    ) : (
                      'Registrati'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/30" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-transparent text-[#2D373A]/60">oppure</span>
                    </div>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => alert('Registrazione con Google non ancora implementato')}
                    className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>

                  <button
                    onClick={() => alert('Registrazione con Facebook non ancora implementato')}
                    className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  <button
                    onClick={() => alert('Registrazione con Twitter non ancora implementato')}
                    className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-sm border border-white/40 rounded-lg hover:bg-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#DB9F75]/50"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1DA1F2">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                </div>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-[#2D373A]/80">
                    Hai già un account?{' '}
                    <button
                      onClick={onNavigateToLogin}
                      className="font-medium text-[#DB9F75] hover:text-[#DB9F75]/80 transition-colors duration-200"
                    >
                      Accedi
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
