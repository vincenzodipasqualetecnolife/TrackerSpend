// ============================================================================
// CALCULATORS - Utilità per calcoli automatici
// ============================================================================

import { Budget, Goal, Transaction, MonthlyStats, CategoryStats } from '../../types';

/**
 * Calcola il progresso di un budget
 * @param budget - Budget da analizzare
 * @param spent - Importo speso
 * @returns Percentuale di utilizzo (0-100)
 */
export const calculateBudgetProgress = (budget: Budget, spent: number): number => {
  if (budget.amount <= 0) return 0;
  return Math.min((spent / budget.amount) * 100, 100);
};

/**
 * Calcola il progresso di un obiettivo
 * @param goal - Obiettivo da analizzare
 * @returns Percentuale di completamento (0-100)
 */
export const calculateGoalProgress = (goal: Goal): number => {
  if (goal.target_amount <= 0) return 0;
  return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
};

/**
 * Calcola i giorni rimanenti per un obiettivo
 * @param goal - Obiettivo da analizzare
 * @returns Numero di giorni rimanenti (null se non c'è deadline)
 */
export const calculateGoalDaysRemaining = (goal: Goal): number | null => {
  if (!goal.deadline) return null;
  
  const deadline = new Date(goal.deadline);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Calcola le statistiche mensili dalle transazioni
 * @param transactions - Array di transazioni
 * @param year - Anno
 * @param month - Mese (1-12)
 * @returns Statistiche mensili
 */
export const calculateMonthlyStats = (
  transactions: Transaction[], 
  year: number, 
  month: number
): MonthlyStats => {
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.transaction_date);
    return transactionDate.getFullYear() === year && transactionDate.getMonth() + 1 === month;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    user_id: 0, // Sarà popolato dal backend
    year,
    month,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    net_amount: totalIncome - totalExpenses,
    transaction_count: filteredTransactions.length
  };
};

/**
 * Calcola le statistiche per categoria dalle transazioni
 * @param transactions - Array di transazioni
 * @returns Statistiche per categoria
 */
export const calculateCategoryStats = (transactions: Transaction[]): CategoryStats[] => {
  const categoryMap = new Map<string, CategoryStats>();

  transactions.forEach(transaction => {
    const categoryName = transaction.category_name || 'Non categorizzato';
    const categoryColor = transaction.category_color || '#6B7280';
    const categoryType = transaction.category_name ? 
      (transaction.type as 'income' | 'expense') : 'expense';

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        category_name: categoryName,
        category_type: categoryType,
        category_color: categoryColor,
        total_amount: 0,
        transaction_count: 0,
        avg_amount: 0
      });
    }

    const stats = categoryMap.get(categoryName)!;
    stats.total_amount += transaction.amount;
    stats.transaction_count += 1;
  });

  // Calcola la media per ogni categoria
  categoryMap.forEach(stats => {
    stats.avg_amount = stats.transaction_count > 0 ? 
      stats.total_amount / stats.transaction_count : 0;
  });

  return Array.from(categoryMap.values());
};

/**
 * Calcola il saldo netto dalle transazioni
 * @param transactions - Array di transazioni
 * @returns Saldo netto
 */
export const calculateNetBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((balance, transaction) => {
    return balance + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);
};

/**
 * Calcola la media giornaliera delle spese
 * @param transactions - Array di transazioni
 * @param days - Numero di giorni (default: 30)
 * @returns Media giornaliera
 */
export const calculateDailyAverage = (
  transactions: Transaction[], 
  days: number = 30
): number => {
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return expenses / days;
};

/**
 * Calcola la media mensile delle spese
 * @param transactions - Array di transazioni
 * @param months - Numero di mesi (default: 1)
 * @returns Media mensile
 */
export const calculateMonthlyAverage = (
  transactions: Transaction[], 
  months: number = 1
): number => {
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return expenses / months;
};

/**
 * Calcola la percentuale di variazione tra due valori
 * @param current - Valore corrente
 * @param previous - Valore precedente
 * @returns Percentuale di variazione
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calcola il trend delle spese (aumento/diminuzione)
 * @param currentMonth - Spese del mese corrente
 * @param previousMonth - Spese del mese precedente
 * @returns Trend in percentuale
 */
export const calculateSpendingTrend = (currentMonth: number, previousMonth: number): number => {
  return calculatePercentageChange(currentMonth, previousMonth);
};

/**
 * Calcola il numero di mesi per completare un obiettivo
 * @param goal - Obiettivo da analizzare
 * @param monthlyContribution - Contributo mensile
 * @returns Numero di mesi (null se non è possibile calcolare)
 */
export const calculateMonthsToGoal = (
  goal: Goal, 
  monthlyContribution: number
): number | null => {
  if (monthlyContribution <= 0) return null;
  
  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return 0;
  
  return Math.ceil(remaining / monthlyContribution);
};

/**
 * Calcola il contributo mensile necessario per raggiungere un obiettivo
 * @param goal - Obiettivo da analizzare
 * @param months - Numero di mesi disponibili
 * @returns Contributo mensile necessario
 */
export const calculateRequiredMonthlyContribution = (
  goal: Goal, 
  months: number
): number => {
  if (months <= 0) return 0;
  
  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return 0;
  
  return remaining / months;
};

/**
 * Calcola il rischio di superare il budget
 * @param budget - Budget da analizzare
 * @param spent - Importo speso
 * @param daysInPeriod - Giorni nel periodo
 * @param daysElapsed - Giorni trascorsi
 * @returns Livello di rischio (low, medium, high)
 */
export const calculateBudgetRisk = (
  budget: Budget, 
  spent: number, 
  daysInPeriod: number, 
  daysElapsed: number
): 'low' | 'medium' | 'high' => {
  if (daysElapsed <= 0) return 'low';
  
  const progress = (daysElapsed / daysInPeriod) * 100;
  const spendingProgress = (spent / budget.amount) * 100;
  
  const ratio = spendingProgress / progress;
  
  if (ratio < 0.8) return 'low';
  if (ratio < 1.2) return 'medium';
  return 'high';
};

/**
 * Calcola la distribuzione delle spese per categoria
 * @param transactions - Array di transazioni
 * @returns Distribuzione in percentuale
 */
export const calculateSpendingDistribution = (transactions: Transaction[]): Record<string, number> => {
  const categoryStats = calculateCategoryStats(transactions);
  const totalExpenses = categoryStats
    .filter(cat => cat.category_type === 'expense')
    .reduce((sum, cat) => sum + cat.total_amount, 0);
  
  if (totalExpenses === 0) return {};
  
  const distribution: Record<string, number> = {};
  categoryStats
    .filter(cat => cat.category_type === 'expense')
    .forEach(cat => {
      distribution[cat.category_name] = (cat.total_amount / totalExpenses) * 100;
    });
  
  return distribution;
};

/**
 * Calcola il periodo migliore per le spese
 * @param transactions - Array di transazioni
 * @returns Periodo con spese più alte
 */
export const calculatePeakSpendingPeriod = (transactions: Transaction[]): {
  dayOfWeek: string;
  amount: number;
} => {
  const dailySpending = new Map<string, number>();
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const dayOfWeek = date.toLocaleDateString('it-IT', { weekday: 'long' });
      
      dailySpending.set(dayOfWeek, (dailySpending.get(dayOfWeek) || 0) + transaction.amount);
    });
  
  let peakDay = '';
  let peakAmount = 0;
  
  dailySpending.forEach((amount, day) => {
    if (amount > peakAmount) {
      peakAmount = amount;
      peakDay = day;
    }
  });
  
  return { dayOfWeek: peakDay, amount: peakAmount };
};

/**
 * Calcola la frequenza delle transazioni
 * @param transactions - Array di transazioni
 * @returns Frequenza media (transazioni per giorno)
 */
export const calculateTransactionFrequency = (transactions: Transaction[]): number => {
  if (transactions.length === 0) return 0;
  
  const dates = [...new Set(transactions.map(t => t.transaction_date))];
  const uniqueDays = dates.length;
  
  return transactions.length / uniqueDays;
};

/**
 * Calcola il valore medio delle transazioni
 * @param transactions - Array di transazioni
 * @param type - Tipo di transazione (opzionale)
 * @returns Valore medio
 */
export const calculateAverageTransactionValue = (
  transactions: Transaction[], 
  type?: 'income' | 'expense'
): number => {
  const filteredTransactions = type ? 
    transactions.filter(t => t.type === type) : 
    transactions;
  
  if (filteredTransactions.length === 0) return 0;
  
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  return total / filteredTransactions.length;
};
