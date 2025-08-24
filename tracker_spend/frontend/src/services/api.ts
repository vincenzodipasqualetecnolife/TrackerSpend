import React from 'react';
import { 
  Transaction, 
  Category, 
  Budget, 
  Goal, 
  LinkedAccount, 
  EmergencyFund, 
  Insurance, 
  Alert, 
  Tip, 
  Badge, 
  Report, 
  DashboardStats, 
  MonthlyStats, 
  CategoryStats,
  SpendingTrend,
  TransactionForm,
  BudgetForm,
  GoalForm,
  User,
  UserPreferences,
  UserSession,
  ApiResponse,
  PaginatedResponse
} from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      // Aggiungi il token di autorizzazione se disponibile
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error data:', errorData);
        
        // Se riceviamo 401 (Unauthorized), rimuovi il token non valido
        if (response.status === 401) {
          console.log('Token non valido, rimuovo i dati di autenticazione');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('user');
          
          // Emetti evento di logout
          window.dispatchEvent(new CustomEvent('authStateChanged', { 
            detail: { isAuthenticated: false, user: null } 
          }));
        }
        
        // Se ci sono dettagli dell'errore, mostrali
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessage = `${errorData.error}\n\nDettagli:\n${errorData.details.join('\n')}`;
          return { error: errorMessage };
        }
        
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const raw = await response.json();
      const payload = raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw;
      return { data: payload };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const url = `${API_BASE_URL}/health`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // USER MANAGEMENT (non-authentication)
  // ============================================================================
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  static async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.request('/auth/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  static async updateProfile(profileData: { first_name?: string; last_name?: string; phone?: string; email?: string }): Promise<ApiResponse<User>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================
  static async getTransactions(filters?: {
    category_id?: number;
    type?: 'income' | 'expense';
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/transactions${query}`);
  }

  static async getTransaction(id: number): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}`);
  }

  static async createTransaction(transaction: TransactionForm): Promise<ApiResponse<Transaction>> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  static async updateTransaction(id: number, transaction: Partial<TransactionForm>): Promise<ApiResponse<Transaction>> {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  static async deleteTransaction(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload CSV/Excel transactions
  static async uploadTransactions(formData: FormData): Promise<ApiResponse<{ message: string; count: number }>> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const url = `${API_BASE_URL}/transactions/upload`;
      
      console.log('=== DEBUG API SERVICE ===');
      console.log('Upload token:', token);
      console.log('URL:', url);
      console.log('FormData:', formData);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error data:', errorData);
        return { error: errorData.error || `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('Success data:', data);
      return { data };
    } catch (error) {
      console.error('API Service error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request('/categories');
  }

  static async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.request(`/categories/${id}`);
  }

  static async createCategory(category: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  static async updateCategory(id: number, category: Partial<Category>): Promise<ApiResponse<Category>> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  static async deleteCategory(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // BUDGETS
  // ============================================================================
  static async getBudgets(): Promise<ApiResponse<Budget[]>> {
    return this.request('/budgets');
  }

  static async getBudget(id: number): Promise<ApiResponse<Budget>> {
    return this.request(`/budgets/${id}`);
  }

  static async createBudget(budget: BudgetForm): Promise<ApiResponse<Budget>> {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  static async updateBudget(id: number, budget: Partial<BudgetForm>): Promise<ApiResponse<Budget>> {
    return this.request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  }

  static async deleteBudget(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // GOALS
  // ============================================================================
  static async getGoals(): Promise<ApiResponse<Goal[]>> {
    return this.request('/goals');
  }

  static async getGoal(id: number): Promise<ApiResponse<Goal>> {
    return this.request(`/goals/${id}`);
  }

  static async createGoal(goal: GoalForm): Promise<ApiResponse<Goal>> {
    return this.request('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  }

  static async updateGoal(id: number, goal: Partial<GoalForm>): Promise<ApiResponse<Goal>> {
    return this.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    });
  }

  static async deleteGoal(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  static async updateGoalProgress(id: number, amount: number): Promise<ApiResponse<Goal>> {
    return this.request(`/goals/${id}/update-progress`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // ============================================================================
  // LINKED ACCOUNTS
  // ============================================================================
  static async getLinkedAccounts(): Promise<ApiResponse<LinkedAccount[]>> {
    return this.request('/linked-accounts');
  }

  static async getLinkedAccount(id: number): Promise<ApiResponse<LinkedAccount>> {
    return this.request(`/linked-accounts/${id}`);
  }

  static async createLinkedAccount(account: Partial<LinkedAccount>): Promise<ApiResponse<LinkedAccount>> {
    return this.request('/linked-accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
  }

  static async updateLinkedAccount(id: number, account: Partial<LinkedAccount>): Promise<ApiResponse<LinkedAccount>> {
    return this.request(`/linked-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(account),
    });
  }

  static async deleteLinkedAccount(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/linked-accounts/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // EMERGENCY FUNDS
  // ============================================================================
  static async getEmergencyFunds(): Promise<ApiResponse<EmergencyFund[]>> {
    return this.request('/emergency-funds');
  }

  static async getEmergencyFund(id: number): Promise<ApiResponse<EmergencyFund>> {
    return this.request(`/emergency-funds/${id}`);
  }

  static async createEmergencyFund(fund: Partial<EmergencyFund>): Promise<ApiResponse<EmergencyFund>> {
    return this.request('/emergency-funds', {
      method: 'POST',
      body: JSON.stringify(fund),
    });
  }

  static async updateEmergencyFund(id: number, fund: Partial<EmergencyFund>): Promise<ApiResponse<EmergencyFund>> {
    return this.request(`/emergency-funds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fund),
    });
  }

  static async deleteEmergencyFund(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/emergency-funds/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // INSURANCE
  // ============================================================================
  static async getInsurance(): Promise<ApiResponse<Insurance[]>> {
    return this.request('/insurance');
  }

  static async getInsurancePolicy(id: number): Promise<ApiResponse<Insurance>> {
    return this.request(`/insurance/${id}`);
  }

  static async createInsurance(insurance: Partial<Insurance>): Promise<ApiResponse<Insurance>> {
    return this.request('/insurance', {
      method: 'POST',
      body: JSON.stringify(insurance),
    });
  }

  static async updateInsurance(id: number, insurance: Partial<Insurance>): Promise<ApiResponse<Insurance>> {
    return this.request(`/insurance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(insurance),
    });
  }

  static async deleteInsurance(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/insurance/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // ALERTS
  // ============================================================================
  static async getAlerts(): Promise<ApiResponse<Alert[]>> {
    return this.request('/alerts');
  }

  static async markAlertAsRead(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/alerts/${id}/read`, {
      method: 'PUT',
    });
  }

  static async deleteAlert(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/alerts/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // TIPS
  // ============================================================================
  static async getTips(): Promise<ApiResponse<Tip[]>> {
    return this.request('/tips');
  }

  static async markTipAsRead(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/tips/${id}/read`, {
      method: 'PUT',
    });
  }

  static async deleteTip(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/tips/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // BADGES
  // ============================================================================
  static async getBadges(): Promise<ApiResponse<Badge[]>> {
    return this.request('/badges');
  }

  // ============================================================================
  // REPORTS
  // ============================================================================
  static async getReports(): Promise<ApiResponse<Report[]>> {
    return this.request('/reports');
  }

  static async generateReport(period: string): Promise<ApiResponse<Report>> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  }

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================
  static async getDashboardStats(year: number, month: number): Promise<ApiResponse<DashboardStats>> {
    return this.request(`/analytics/dashboard-stats?year=${year}&month=${month}`);
  }

  static async getGeneralStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/analytics/general-stats');
  }

  static async getSpendingTrends(months: number = 6): Promise<ApiResponse<SpendingTrend[]>> {
    return this.request(`/dashboard/trends?months=${months}`);
  }

  static async getMonthlyStats(year: number, month: number): Promise<ApiResponse<MonthlyStats>> {
    return this.request(`/analytics/monthly-stats?year=${year}&month=${month}`);
  }

  static async getCategoryStats(): Promise<ApiResponse<CategoryStats[]>> {
    return this.request('/analytics/category-stats');
  }

  static async getAnalyticsSummary(): Promise<ApiResponse<any>> {
    return this.request('/analytics/summary');
  }

  static async getCategoryTotals(): Promise<ApiResponse<Record<string, number>>> {
    return this.request('/analytics/category-totals');
  }

  static async getMonthlyTotals(year?: number): Promise<ApiResponse<Record<string, number>>> {
    const params = year ? `?year=${year}` : '';
    return this.request(`/analytics/monthly-totals${params}`);
  }

  // ============================================================================
  // LEGACY METHODS (per compatibilità)
  // ============================================================================
  static async importTransactions(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/transactions/import', {
      method: 'POST',
    });
  }

  static async exportTransactions(): Promise<ApiResponse<{ filePath: string }>> {
    return this.request('/transactions/export');
  }

  static async getBudgetStatistics(id: string): Promise<ApiResponse<any>> {
    return this.request(`/budgets/${id}/statistics`);
  }

  static async getBudgetRecommendations(id: string): Promise<ApiResponse<any>> {
    return this.request(`/budgets/${id}/recommendations`);
  }
}

// Hook per gestire lo stato di connessione
export const useApiConnection = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await ApiService.healthCheck();
        setIsConnected(!response.error);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isLoading };
};

// Hook per gestire lo stato di connessione e autenticazione
export const useApiConnectionWithAuth = () => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkConnectionAndAuth = async () => {
      try {
        // Check API connection
        const healthResponse = await ApiService.healthCheck();
        const apiConnected = !healthResponse.error;
        setIsConnected(apiConnected);
        
        // Check authentication if API is connected
        if (apiConnected) {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (token) {
            try {
              const authResponse = await ApiService.getCurrentUser();
              setIsAuthenticated(!authResponse.error);
            } catch (error) {
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsConnected(false);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnectionAndAuth();
    const interval = setInterval(checkConnectionAndAuth, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isAuthenticated, isLoading };
};
