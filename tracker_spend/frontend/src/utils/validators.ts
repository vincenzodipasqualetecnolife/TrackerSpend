// ============================================================================
// VALIDATORS - Utilità per validare dati e form
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

/**
 * Valida un campo obbligatorio
 * @param value - Valore da validare
 * @param fieldName - Nome del campo per il messaggio di errore
 * @returns ValidationResult
 */
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const isValid = value !== null && value !== undefined && value !== '';
  return {
    isValid,
    errors: isValid ? [] : [`Il campo ${fieldName} è obbligatorio`]
  };
};

/**
 * Valida un indirizzo email
 * @param email - Email da validare
 * @returns ValidationResult
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  return {
    isValid,
    errors: isValid ? [] : ['Inserisci un indirizzo email valido']
  };
};

/**
 * Valida un importo
 * @param amount - Importo da validare
 * @param minAmount - Importo minimo (default: 0)
 * @returns ValidationResult
 */
export const validateAmount = (amount: number, minAmount: number = 0): ValidationResult => {
  const errors: string[] = [];
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    errors.push('L\'importo deve essere un numero valido');
  } else if (amount < minAmount) {
    errors.push(`L'importo deve essere almeno ${minAmount}€`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida una data
 * @param date - Data da validare
 * @param minDate - Data minima consentita
 * @param maxDate - Data massima consentita
 * @returns ValidationResult
 */
export const validateDate = (
  date: string, 
  minDate?: string, 
  maxDate?: string
): ValidationResult => {
  const errors: string[] = [];
  
  if (!date) {
    errors.push('La data è obbligatoria');
  } else {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      errors.push('Inserisci una data valida');
    } else {
      if (minDate && dateObj < new Date(minDate)) {
        errors.push(`La data non può essere precedente al ${formatDate(minDate)}`);
      }
      
      if (maxDate && dateObj > new Date(maxDate)) {
        errors.push(`La data non può essere successiva al ${formatDate(maxDate)}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida una password
 * @param password - Password da validare
 * @param minLength - Lunghezza minima (default: 8)
 * @returns ValidationResult
 */
export const validatePassword = (password: string, minLength: number = 8): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < minLength) {
    errors.push(`La password deve essere di almeno ${minLength} caratteri`);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera maiuscola');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La password deve contenere almeno una lettera minuscola');
  }
  
  if (!/\d/.test(password)) {
    errors.push('La password deve contenere almeno un numero');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un nome utente
 * @param username - Username da validare
 * @param minLength - Lunghezza minima (default: 3)
 * @param maxLength - Lunghezza massima (default: 50)
 * @returns ValidationResult
 */
export const validateUsername = (
  username: string, 
  minLength: number = 3, 
  maxLength: number = 50
): ValidationResult => {
  const errors: string[] = [];
  
  if (username.length < minLength) {
    errors.push(`Il nome utente deve essere di almeno ${minLength} caratteri`);
  }
  
  if (username.length > maxLength) {
    errors.push(`Il nome utente non può superare i ${maxLength} caratteri`);
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Il nome utente può contenere solo lettere, numeri, trattini e underscore');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un numero di telefono
 * @param phone - Numero di telefono da validare
 * @returns ValidationResult
 */
export const validatePhone = (phone: string): ValidationResult => {
  const cleaned = phone.replace(/\D/g, '');
  const isValid = cleaned.length >= 10 && cleaned.length <= 15;
  
  return {
    isValid,
    errors: isValid ? [] : ['Inserisci un numero di telefono valido']
  };
};

/**
 * Valida un IBAN
 * @param iban - IBAN da validare
 * @returns ValidationResult
 */
export const validateIBAN = (iban: string): ValidationResult => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  const isValid = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(cleaned);
  
  return {
    isValid,
    errors: isValid ? [] : ['Inserisci un IBAN valido']
  };
};

/**
 * Valida un colore hex
 * @param color - Colore da validare
 * @returns ValidationResult
 */
export const validateHexColor = (color: string): ValidationResult => {
  const isValid = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  
  return {
    isValid,
    errors: isValid ? [] : ['Inserisci un colore valido (es. #FF0000)']
  };
};

/**
 * Valida un form di transazione
 * @param data - Dati del form
 * @returns ValidationResult
 */
export const validateTransaction = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Validazione importo
  const amountValidation = validateAmount(data.amount);
  errors.push(...amountValidation.errors);
  
  // Validazione descrizione
  const descriptionValidation = validateRequired(data.description, 'descrizione');
  errors.push(...descriptionValidation.errors);
  
  // Validazione data
  const dateValidation = validateDate(data.transaction_date);
  errors.push(...dateValidation.errors);
  
  // Validazione tipo
  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push('Seleziona un tipo di transazione valido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un form di budget
 * @param data - Dati del form
 * @returns ValidationResult
 */
export const validateBudget = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Validazione importo
  const amountValidation = validateAmount(data.amount, 0.01);
  errors.push(...amountValidation.errors);
  
  // Validazione periodo
  if (!data.period || !['daily', 'weekly', 'monthly', 'yearly'].includes(data.period)) {
    errors.push('Seleziona un periodo valido');
  }
  
  // Validazione data di inizio
  const startDateValidation = validateDate(data.start_date);
  errors.push(...startDateValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un form di obiettivo
 * @param data - Dati del form
 * @returns ValidationResult
 */
export const validateGoal = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Validazione nome
  const nameValidation = validateRequired(data.name, 'nome');
  errors.push(...nameValidation.errors);
  
  // Validazione importo target
  const amountValidation = validateAmount(data.target_amount, 0.01);
  errors.push(...amountValidation.errors);
  
  // Validazione priorità
  if (!data.priority || !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Seleziona una priorità valida');
  }
  
  // Validazione deadline (opzionale)
  if (data.deadline) {
    const deadlineValidation = validateDate(data.deadline, new Date().toISOString().split('T')[0]);
    errors.push(...deadlineValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un form di categoria
 * @param data - Dati del form
 * @returns ValidationResult
 */
export const validateCategory = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Validazione nome
  const nameValidation = validateRequired(data.name, 'nome');
  errors.push(...nameValidation.errors);
  
  // Validazione tipo
  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push('Seleziona un tipo di categoria valido');
  }
  
  // Validazione colore
  if (data.color) {
    const colorValidation = validateHexColor(data.color);
    errors.push(...colorValidation.errors);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un form di registrazione
 * @param data - Dati del form
 * @returns ValidationResult
 */
export const validateRegistration = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Validazione username
  const usernameValidation = validateUsername(data.username);
  errors.push(...usernameValidation.errors);
  
  // Validazione email
  const emailValidation = validateEmail(data.email);
  errors.push(...emailValidation.errors);
  
  // Validazione password
  const passwordValidation = validatePassword(data.password);
  errors.push(...passwordValidation.errors);
  
  // Validazione conferma password
  if (data.password !== data.confirmPassword) {
    errors.push('Le password non coincidono');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un form di login
 * @param data - Dati del form
 * @returns ValidationResult
 */
export const validateLogin = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // Validazione email
  const emailValidation = validateEmail(data.email);
  errors.push(...emailValidation.errors);
  
  // Validazione password
  const passwordValidation = validateRequired(data.password, 'password');
  errors.push(...passwordValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Combina più risultati di validazione
 * @param validations - Array di ValidationResult
 * @returns ValidationResult combinato
 */
export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors);
  const allValid = validations.every(v => v.isValid);
  
  return {
    isValid: allValid,
    errors: allErrors
  };
};

// Funzione helper per formattare le date nei messaggi di errore
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('it-IT');
};
