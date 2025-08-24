import 'package:flutter/foundation.dart';
import '../models/budget.dart';
import '../models/transaction.dart';
import '../models/category.dart';
import '../services/database_service.dart';

class BudgetProvider with ChangeNotifier {
  List<Budget> _budgets = [];
  List<Budget> _activeBudgets = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Budget> get budgets => _budgets;
  List<Budget> get activeBudgets => _activeBudgets;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Initialize provider
  Future<void> initialize() async {
    await loadBudgets();
  }

  // Load all budgets from database
  Future<void> loadBudgets() async {
    try {
      _setLoading(true);
      _budgets = DatabaseService.getAllBudgets();
      _activeBudgets = DatabaseService.getActiveBudgets();
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nel caricamento dei budget: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Add a new budget
  Future<void> addBudget(Budget budget) async {
    try {
      _setLoading(true);
      await DatabaseService.addBudget(budget);
      _budgets.add(budget);
      if (budget.isActive) {
        _activeBudgets.add(budget);
      }
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nell\'aggiunta del budget: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Update an existing budget
  Future<void> updateBudget(Budget budget) async {
    try {
      _setLoading(true);
      await DatabaseService.updateBudget(budget);
      
      final index = _budgets.indexWhere((b) => b.id == budget.id);
      if (index != -1) {
        _budgets[index] = budget;
      }

      // Update active budgets list
      _activeBudgets = _budgets.where((b) => b.isActive).toList();
      
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nell\'aggiornamento del budget: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Delete a budget
  Future<void> deleteBudget(String id) async {
    try {
      _setLoading(true);
      await DatabaseService.deleteBudget(id);
      _budgets.removeWhere((b) => b.id == id);
      _activeBudgets.removeWhere((b) => b.id == id);
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nella cancellazione del budget: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Get budget by ID
  Budget? getBudgetById(String id) {
    return _budgets.firstWhere((b) => b.id == id);
  }

  // Get active budget for current period
  Budget? getCurrentBudget() {
    final now = DateTime.now();
    return _activeBudgets.firstWhere(
      (budget) => budget.startDate.isBefore(now) && budget.endDate.isAfter(now),
      orElse: () => _activeBudgets.isNotEmpty ? _activeBudgets.first : Budget.empty(),
    );
  }

  // Update budget spending based on transactions
  Future<void> updateBudgetSpending(String budgetId) async {
    try {
      final budget = getBudgetById(budgetId);
      if (budget == null) return;

      final transactions = DatabaseService.getTransactionsByBudget(budgetId);
      
      // Group transactions by category
      final Map<String, double> categorySpending = {};
      for (final transaction in transactions) {
        if (transaction.type == TransactionType.expense) {
          categorySpending[transaction.category] = 
              (categorySpending[transaction.category] ?? 0.0) + transaction.amount;
        }
      }

      // Update budget categories
      final updatedCategories = budget.categories.map((category) {
        final spentAmount = categorySpending[category.name] ?? 0.0;
        return category.copyWith(spentAmount: spentAmount);
      }).toList();

      final updatedBudget = budget.copyWith(categories: updatedCategories);
      await updateBudget(updatedBudget);
    } catch (e) {
      _setError('Errore nell\'aggiornamento della spesa del budget: $e');
    }
  }

  // Create a new budget with default categories
  Future<Budget> createDefaultBudget({
    required String name,
    required String description,
    required double totalAmount,
    required BudgetPeriod period,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    // Get default expense categories
    final categories = DatabaseService.getCategoriesByType(CategoryType.expense);
    
    // Create budget categories with proportional allocation
    final budgetCategories = categories.take(6).map((category) {
      final allocatedAmount = totalAmount * 0.15; // 15% each for first 6 categories
      return BudgetCategory(
        name: category.name,
        allocatedAmount: allocatedAmount,
        color: category.color,
      );
    }).toList();

    // Add "Altro" category for remaining amount
    final totalAllocated = budgetCategories.fold(0.0, (sum, c) => sum + c.allocatedAmount);
    final remainingAmount = totalAmount - totalAllocated;
    
    if (remainingAmount > 0) {
      budgetCategories.add(BudgetCategory(
        name: 'Altro',
        allocatedAmount: remainingAmount,
        color: '#9E9E9E',
      ));
    }

    return Budget(
      name: name,
      description: description,
      totalAmount: totalAmount,
      period: period,
      startDate: startDate,
      endDate: endDate,
      categories: budgetCategories,
    );
  }

  // Get budget statistics
  Map<String, dynamic> getBudgetStatistics(String budgetId) {
    final budget = getBudgetById(budgetId);
    if (budget == null) return {};

    final transactions = DatabaseService.getTransactionsByBudget(budgetId);
    final incomeTransactions = transactions.where((t) => t.type == TransactionType.income);
    final expenseTransactions = transactions.where((t) => t.type == TransactionType.expense);

    final totalIncome = incomeTransactions.fold(0.0, (sum, t) => sum + t.amount);
    final totalExpenses = expenseTransactions.fold(0.0, (sum, t) => sum + t.amount);

    return {
      'totalIncome': totalIncome,
      'totalExpenses': totalExpenses,
      'netAmount': totalIncome - totalExpenses,
      'budgetUtilization': budget.spentPercentage,
      'remainingBudget': budget.remainingAmount,
      'isOverBudget': budget.isOverBudget,
      'transactionCount': transactions.length,
    };
  }

  // Get budget progress for all active budgets
  List<Map<String, dynamic>> getActiveBudgetsProgress() {
    return _activeBudgets.map((budget) {
      final stats = getBudgetStatistics(budget.id);
      return {
        'budget': budget,
        'progress': budget.spentPercentage,
        'remaining': budget.remainingAmount,
        'isOverBudget': budget.isOverBudget,
        'stats': stats,
      };
    }).toList();
  }

  // Get budget recommendations based on spending patterns
  Map<String, dynamic> getBudgetRecommendations(String budgetId) {
    final budget = getBudgetById(budgetId);
    if (budget == null) return {};

    final recommendations = <String, dynamic>{};
    
    // Check if budget is over
    if (budget.isOverBudget) {
      recommendations['overBudget'] = {
        'message': 'Il budget è stato superato',
        'suggestion': 'Considera di ridurre le spese o aumentare il budget',
        'severity': 'high',
      };
    }

    // Check category spending
    for (final category in budget.categories) {
      if (category.isOverBudget) {
        recommendations['category_${category.name}'] = {
          'message': 'Categoria ${category.name} superata',
          'suggestion': 'Riduci le spese in questa categoria',
          'severity': 'medium',
          'category': category.name,
          'overAmount': category.spentAmount - category.allocatedAmount,
        };
      } else if (category.spentPercentage > 80) {
        recommendations['category_${category.name}_warning'] = {
          'message': 'Categoria ${category.name} quasi esaurita',
          'suggestion': 'Attenzione: stai per superare il budget per questa categoria',
          'severity': 'low',
          'category': category.name,
          'remaining': category.remainingAmount,
        };
      }
    }

    // Check spending trends
    final transactions = DatabaseService.getTransactionsByBudget(budgetId);
    if (transactions.isNotEmpty) {
      final recentTransactions = transactions
          .where((t) => t.date.isAfter(DateTime.now().subtract(const Duration(days: 7))))
          .toList();
      
      if (recentTransactions.isNotEmpty) {
        final recentSpending = recentTransactions
            .where((t) => t.type == TransactionType.expense)
            .fold(0.0, (sum, t) => sum + t.amount);
        
        final weeklyAverage = recentSpending;
        final remainingWeeks = budget.endDate.difference(DateTime.now()).inDays / 7;
        
        if (remainingWeeks > 0) {
          final projectedSpending = weeklyAverage * remainingWeeks;
          final projectedTotal = budget.spentAmount + projectedSpending;
          
          if (projectedTotal > budget.totalAmount) {
            recommendations['projection'] = {
              'message': 'Proiezione di spesa superiore al budget',
              'suggestion': 'Riduci le spese settimanali per rispettare il budget',
              'severity': 'medium',
              'projectedTotal': projectedTotal,
              'weeklyAverage': weeklyAverage,
            };
          }
        }
      }
    }

    return recommendations;
  }

  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  @override
  void dispose() {
    super.dispose();
  }
}
