import 'package:flutter/foundation.dart';
import '../models/transaction.dart';
import '../models/category.dart';
import '../services/database_service.dart';
import '../services/file_parser_service.dart';

class TransactionProvider with ChangeNotifier {
  List<Transaction> _transactions = [];
  List<Transaction> _filteredTransactions = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Transaction> get transactions => _transactions;
  List<Transaction> get filteredTransactions => _filteredTransactions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Statistics
  double get totalIncome => _transactions
      .where((t) => t.type == TransactionType.income)
      .fold(0.0, (sum, t) => sum + t.amount);

  double get totalExpenses => _transactions
      .where((t) => t.type == TransactionType.expense)
      .fold(0.0, (sum, t) => sum + t.amount);

  double get netAmount => totalIncome - totalExpenses;

  // Initialize provider
  Future<void> initialize() async {
    await loadTransactions();
  }

  // Load all transactions from database
  Future<void> loadTransactions() async {
    try {
      _setLoading(true);
      _transactions = DatabaseService.getAllTransactions();
      _filteredTransactions = _transactions;
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nel caricamento delle transazioni: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Add a new transaction
  Future<void> addTransaction(Transaction transaction) async {
    try {
      _setLoading(true);
      await DatabaseService.addTransaction(transaction);
      _transactions.add(transaction);
      _updateFilteredTransactions();
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nell\'aggiunta della transazione: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Update an existing transaction
  Future<void> updateTransaction(Transaction transaction) async {
    try {
      _setLoading(true);
      await DatabaseService.updateTransaction(transaction);
      final index = _transactions.indexWhere((t) => t.id == transaction.id);
      if (index != -1) {
        _transactions[index] = transaction;
        _updateFilteredTransactions();
      }
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nell\'aggiornamento della transazione: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Delete a transaction
  Future<void> deleteTransaction(String id) async {
    try {
      _setLoading(true);
      await DatabaseService.deleteTransaction(id);
      _transactions.removeWhere((t) => t.id == id);
      _updateFilteredTransactions();
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nella cancellazione della transazione: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Import transactions from file
  Future<void> importTransactionsFromFile() async {
    try {
      _setLoading(true);
      final transactions = await FileParserService.pickAndParseFile();
      
      // Validate transactions
      final errors = FileParserService.validateTransactions(transactions);
      if (errors.isNotEmpty) {
        _setError('Errori di validazione:\n${errors.join('\n')}');
        return;
      }

      // Auto-categorize transactions
      final categories = DatabaseService.getAllCategories();
      final categorizedTransactions = FileParserService.autoCategorizeTransactions(
        transactions,
        categories,
      );

      // Add transactions to database
      await DatabaseService.addTransactions(categorizedTransactions);
      
      // Reload transactions
      await loadTransactions();
      
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Errore nell\'importazione del file: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Filter transactions
  void filterTransactions({
    DateTime? startDate,
    DateTime? endDate,
    String? category,
    TransactionType? type,
    String? budgetId,
    String? searchQuery,
  }) {
    _filteredTransactions = _transactions.where((transaction) {
      // Date filter
      if (startDate != null && transaction.date.isBefore(startDate)) {
        return false;
      }
      if (endDate != null && transaction.date.isAfter(endDate)) {
        return false;
      }

      // Category filter
      if (category != null && transaction.category != category) {
        return false;
      }

      // Type filter
      if (type != null && transaction.type != type) {
        return false;
      }

      // Budget filter
      if (budgetId != null && transaction.budgetId != budgetId) {
        return false;
      }

      // Search query filter
      if (searchQuery != null && searchQuery.isNotEmpty) {
        final query = searchQuery.toLowerCase();
        if (!transaction.description.toLowerCase().contains(query) &&
            !transaction.category.toLowerCase().contains(query)) {
          return false;
        }
      }

      return true;
    }).toList();

    notifyListeners();
  }

  // Clear filters
  void clearFilters() {
    _filteredTransactions = _transactions;
    notifyListeners();
  }

  // Get transactions by date range
  List<Transaction> getTransactionsByDateRange(DateTime start, DateTime end) {
    return _transactions.where((transaction) =>
        transaction.date.isAfter(start.subtract(const Duration(days: 1))) &&
        transaction.date.isBefore(end.add(const Duration(days: 1)))).toList();
  }

  // Get transactions by category
  List<Transaction> getTransactionsByCategory(String category) {
    return _transactions.where((transaction) => transaction.category == category).toList();
  }

  // Get transactions by budget
  List<Transaction> getTransactionsByBudget(String budgetId) {
    return _transactions.where((transaction) => transaction.budgetId == budgetId).toList();
  }

  // Get category totals
  Map<String, double> getCategoryTotals({DateTime? startDate, DateTime? endDate}) {
    final Map<String, double> categoryTotals = {};
    
    var transactions = _transactions;
    
    if (startDate != null) {
      transactions = transactions.where((t) => 
          t.date.isAfter(startDate.subtract(const Duration(days: 1)))).toList();
    }
    
    if (endDate != null) {
      transactions = transactions.where((t) => 
          t.date.isBefore(endDate.add(const Duration(days: 1)))).toList();
    }

    for (final transaction in transactions) {
      final category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] ?? 0.0) + transaction.amount;
    }

    return categoryTotals;
  }

  // Get monthly totals for a year
  Map<String, double> getMonthlyTotals(int year) {
    final Map<String, double> monthlyTotals = {};

    for (int month = 1; month <= 12; month++) {
      final startDate = DateTime(year, month, 1);
      final endDate = DateTime(year, month + 1, 0);
      final monthName = _getMonthName(month);
      
      final monthTransactions = getTransactionsByDateRange(startDate, endDate);
      final monthIncome = monthTransactions
          .where((t) => t.type == TransactionType.income)
          .fold(0.0, (sum, t) => sum + t.amount);
      final monthExpenses = monthTransactions
          .where((t) => t.type == TransactionType.expense)
          .fold(0.0, (sum, t) => sum + t.amount);
      
      monthlyTotals[monthName] = monthIncome - monthExpenses;
    }

    return monthlyTotals;
  }

  // Get recent transactions
  List<Transaction> getRecentTransactions({int limit = 10}) {
    final sortedTransactions = List<Transaction>.from(_transactions);
    sortedTransactions.sort((a, b) => b.date.compareTo(a.date));
    return sortedTransactions.take(limit).toList();
  }

  // Get transactions for current month
  List<Transaction> getCurrentMonthTransactions() {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    final endOfMonth = DateTime(now.year, now.month + 1, 0);
    return getTransactionsByDateRange(startOfMonth, endOfMonth);
  }

  // Get transactions for current year
  List<Transaction> getCurrentYearTransactions() {
    final now = DateTime.now();
    final startOfYear = DateTime(now.year, 1, 1);
    final endOfYear = DateTime(now.year, 12, 31);
    return getTransactionsByDateRange(startOfYear, endOfYear);
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

  void _updateFilteredTransactions() {
    _filteredTransactions = _transactions;
  }

  String _getMonthName(int month) {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[month - 1];
  }

  @override
  void dispose() {
    super.dispose();
  }
}
