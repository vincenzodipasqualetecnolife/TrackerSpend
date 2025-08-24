// ============================================================================
// FORMATTERS - Utilità per formattare dati
// ============================================================================

/**
 * Formatta un importo come valuta
 * @param amount - Importo da formattare
 * @param currency - Codice valuta (default: EUR)
 * @param locale - Locale per la formattazione (default: it-IT)
 * @returns Stringa formattata
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'EUR', 
  locale: string = 'it-IT'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback se la formattazione fallisce
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * Formatta una data
 * @param date - Data da formattare (string o Date)
 * @param format - Formato desiderato (default: 'short')
 * @param locale - Locale per la formattazione (default: it-IT)
 * @returns Stringa formattata
 */
export const formatDate = (
  date: string | Date, 
  format: 'short' | 'long' | 'numeric' | 'relative' = 'short',
  locale: string = 'it-IT'
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Data non valida';
    }

    switch (format) {
      case 'long':
        return new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(dateObj);
      
      case 'numeric':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(dateObj);
      
      case 'relative':
        return formatRelativeDate(dateObj);
      
      case 'short':
      default:
        return new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(dateObj);
    }
  } catch (error) {
    return 'Data non valida';
  }
};

/**
 * Formatta una percentuale
 * @param value - Valore da formattare (0-1 o 0-100)
 * @param decimals - Numero di decimali (default: 1)
 * @param locale - Locale per la formattazione (default: it-IT)
 * @returns Stringa formattata
 */
export const formatPercentage = (
  value: number, 
  decimals: number = 1, 
  locale: string = 'it-IT'
): string => {
  try {
    // Se il valore è tra 0 e 1, convertilo in percentuale
    const percentage = value <= 1 ? value * 100 : value;
    
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(percentage / 100);
  } catch (error) {
    return `${value.toFixed(decimals)}%`;
  }
};

/**
 * Formatta un numero
 * @param value - Numero da formattare
 * @param decimals - Numero di decimali (default: 0)
 * @param locale - Locale per la formattazione (default: it-IT)
 * @returns Stringa formattata
 */
export const formatNumber = (
  value: number, 
  decimals: number = 0, 
  locale: string = 'it-IT'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    return value.toFixed(decimals);
  }
};

/**
 * Formatta un importo in modo compatto (es. 1.2K, 1.5M)
 * @param amount - Importo da formattare
 * @param currency - Codice valuta (default: EUR)
 * @returns Stringa formattata
 */
export const formatCompactCurrency = (
  amount: number, 
  currency: string = 'EUR'
): string => {
  const formatter = new Intl.NumberFormat('it-IT', {
    notation: 'compact',
    compactDisplay: 'short',
    style: 'currency',
    currency: currency,
  });
  
  return formatter.format(amount);
};

/**
 * Formatta una data relativa (es. "2 giorni fa", "ieri")
 * @param date - Data da formattare
 * @returns Stringa formattata
 */
const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Oggi';
  } else if (diffInDays === 1) {
    return 'Ieri';
  } else if (diffInDays === -1) {
    return 'Domani';
  } else if (diffInDays > 0 && diffInDays < 7) {
    return `${diffInDays} giorni fa`;
  } else if (diffInDays < 0 && diffInDays > -7) {
    return `Tra ${Math.abs(diffInDays)} giorni`;
  } else {
    return formatDate(date, 'short');
  }
};

/**
 * Formatta un timestamp
 * @param timestamp - Timestamp da formattare
 * @param locale - Locale per la formattazione (default: it-IT)
 * @returns Stringa formattata
 */
export const formatTimestamp = (
  timestamp: string | Date, 
  locale: string = 'it-IT'
): string => {
  try {
    const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    if (isNaN(dateObj.getTime())) {
      return 'Timestamp non valido';
    }

    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    return 'Timestamp non valido';
  }
};

/**
 * Formatta un nome utente (capitalizza la prima lettera)
 * @param name - Nome da formattare
 * @returns Stringa formattata
 */
export const formatName = (name: string): string => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Formatta un nome completo (nome + cognome)
 * @param firstName - Nome
 * @param lastName - Cognome
 * @returns Stringa formattata
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  const first = firstName ? formatName(firstName) : '';
  const last = lastName ? formatName(lastName) : '';
  
  if (first && last) {
    return `${first} ${last}`;
  } else if (first) {
    return first;
  } else if (last) {
    return last;
  }
  
  return '';
};

/**
 * Formatta un numero di telefono
 * @param phone - Numero di telefono da formattare
 * @returns Stringa formattata
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Rimuovi tutti i caratteri non numerici
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatta per numeri italiani
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Formatta un IBAN
 * @param iban - IBAN da formattare
 * @returns Stringa formattata
 */
export const formatIBAN = (iban: string): string => {
  if (!iban) return '';
  
  // Rimuovi spazi e caratteri speciali
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  // Formatta in gruppi di 4 caratteri
  return cleaned.match(/.{1,4}/g)?.join(' ') || iban;
};

/**
 * Formatta un importo per la visualizzazione in tabelle
 * @param amount - Importo da formattare
 * @param type - Tipo di transazione
 * @param currency - Codice valuta
 * @returns Oggetto con valore formattato e classe CSS
 */
export const formatAmountForDisplay = (
  amount: number, 
  type: 'income' | 'expense', 
  currency: string = 'EUR'
) => {
  const formatted = formatCurrency(amount, currency);
  const className = type === 'income' ? 'text-green-600' : 'text-red-600';
  
  return {
    value: formatted,
    className,
    isPositive: type === 'income'
  };
};
