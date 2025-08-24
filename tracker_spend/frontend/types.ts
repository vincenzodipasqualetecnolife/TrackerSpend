
// ============================================================================
// TIPI BASE
// ============================================================================

export type Page = 'dashboard' | 'transactions' | 'calendar' | 'budget' | 'goals' | 'analytics' | 'linked-accounts' | 'education' | 'review-optimize' | 'risk-guard' | 'settings';

// ============================================================================
// UTENTI
// ============================================================================

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  role: 'user' | 'admin';
}

export interface UserPreferences {
  id: number;
  user_id: number;
  currency: string;
  language: string;
  timezone: string;
  notifications_enabled: boolean;
  theme: 'light' | 'dark';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CATEGORIE
// ============================================================================

export interface Category {
  id: number;
  name: string;
  description?: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  user_id?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TRANSACTIONI
// ============================================================================

export interface Transaction {
  id: number;
  user_id: number;
  category_id?: number;
  amount: number;
  description: string;
  transaction_date: string;
  type: 'income' | 'expense';
  payment_method?: string;
  location?: string;
  tags?: any;
  bank_source?: string;
  original_data?: any;
  created_at: string;
  updated_at: string;
  
  // Campi relazionali (popolati dal backend)
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

// ============================================================================
// BUDGET
// ============================================================================

export interface Budget {
  id: number;
  user_id: number;
  name: string;
  category_id?: number;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Campi relazionali
  category_name?: string;
  category_color?: string;
  spent_amount?: number;
  remaining_amount?: number;
  percentage_used?: number;
}

export interface BudgetCategory {
  name: string;
  spent: number;
  budgeted: number;
  icon?: React.ReactNode;
  color: string;
  percentage_used: number;
}

// ============================================================================
// OBIETTIVI
// ============================================================================

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  
  // Campi calcolati
  percentage_completed?: number;
  remaining_amount?: number;
  days_remaining?: number;
}

// ============================================================================
// CONTI COLLEGATI
// ============================================================================

export interface LinkedAccount {
  id: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
  institution?: string;
  account_number?: string;
  last_sync?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FONDI DI EMERGENZA
// ============================================================================

export interface EmergencyFund {
  id: number;
  user_id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  status: 'active' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  
  // Campi calcolati
  percentage_completed?: number;
  remaining_amount?: number;
  months_to_complete?: number;
}

// ============================================================================
// ASSICURAZIONI
// ============================================================================

export interface Insurance {
  id: number;
  user_id: number;
  type: 'health' | 'auto' | 'home' | 'life' | 'disability';
  provider: string;
  monthly_premium: number;
  coverage_amount?: number;
  expiry_date?: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AVVISI E NOTIFICHE
// ============================================================================

export interface Alert {
  id: number;
  user_id: number;
  type: 'low_balance' | 'high_spending' | 'budget_exceeded' | 'unusual_transaction' | 'goal_reminder';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_required: boolean;
  created_at: string;
}

// ============================================================================
// CONSIGLI
// ============================================================================

export interface Tip {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: 'budget' | 'savings' | 'investment' | 'debt' | 'insurance';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_read: boolean;
  created_at: string;
}

// ============================================================================
// BADGE
// ============================================================================

export interface Badge {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  icon: string;
  category: 'savings' | 'consistency' | 'budget' | 'achievement';
  is_unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  max_progress: number;
  created_at: string;
}

// ============================================================================
// REPORT
// ============================================================================

export interface Report {
  id: number;
  user_id: number;
  title: string;
  period: string;
  summary?: string;
  insights?: any;
  recommendations?: any;
  generated_at: string;
}

// ============================================================================
// SESSIONI
// ============================================================================

export interface UserSession {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  created_at: string;
}

// ============================================================================
// STATISTICHE E ANALISI
// ============================================================================

export interface DashboardStats {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  total_transactions: number;
  avg_expense: number;
  first_transaction?: string;
  last_transaction?: string;
  monthly_trend?: number;
  top_categories?: CategoryStats[];
}

export interface SpendingTrend {
  month: string; // e.g., 'Jan'
  year: number;
  total_expenses: number;
}

export interface CategoryStats {
  category_name: string;
  category_type: 'income' | 'expense';
  category_color: string;
  total_amount: number;
  transaction_count: number;
  avg_amount: number;
  percentage?: number;
}

export interface MonthlyStats {
  user_id: number;
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
}

// ============================================================================
// CALENDARIO
// ============================================================================

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
}

// ============================================================================
// API RESPONSE
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface TransactionForm {
  amount: number;
  description: string;
  category_id?: number;
  transaction_date: string;
  type: 'income' | 'expense';
  payment_method?: string;
  location?: string;
}

export interface BudgetForm {
  name: string;
  category_id?: number;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface GoalForm {
  name: string;
  description?: string;
  target_amount: number;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// LEGACY TYPES (per compatibilità)
// ============================================================================

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Wallet {
  id: string;
  name: string;
  transactions: Transaction[];
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}