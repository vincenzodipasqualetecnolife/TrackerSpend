import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'package:hive/hive.dart';

import '../models/transaction.dart';
import '../models/budget.dart';
import '../models/category.dart';

class DatabaseService {
  static const String _transactionsBox = 'transactions';
  static const String _budgetsBox = 'budgets';
  static const String _categoriesBox = 'categories';
  static const String _settingsBox = 'settings';

  static late Box<Transaction> _transactionsBoxInstance;
  static late Box<Budget> _budgetsBoxInstance;
  static late Box<Category> _categoriesBoxInstance;
  static late Box _settingsBoxInstance;

  static Future<void> initialize() async {
    final appDocumentDir = await getApplicationDocumentsDirectory();
    await Hive.initFlutter(appDocumentDir.path);

    Hive.registerAdapter(TransactionAdapter());
    Hive.registerAdapter(TransactionTypeAdapter());
    Hive.registerAdapter(BudgetAdapter());
    Hive.registerAdapter(BudgetCategoryAdapter());
    Hive.registerAdapter(BudgetPeriodAdapter());
    Hive.registerAdapter(CategoryAdapter());
    Hive.registerAdapter(CategoryTypeAdapter());

    _transactionsBoxInstance = await Hive.openBox<Transaction>(_transactionsBox);
    _budgetsBoxInstance = await Hive.openBox<Budget>(_budgetsBox);
    _categoriesBoxInstance = await Hive.openBox<Category>(_categoriesBox);
    _settingsBoxInstance = await Hive.openBox(_settingsBox);

    await _initializeDefaultCategories();
  }

  static Future<void> initializeHeadless(String baseDirectoryPath) async {
    throw UnsupportedError('Use initialize() in Flutter environment');
  }

  static Future<void> close() async {
    await _transactionsBoxInstance.close();
    await _budgetsBoxInstance.close();
    await _categoriesBoxInstance.close();
    await _settingsBoxInstance.close();
  }

  static Future<void> addTransaction(Transaction transaction) async {
    await _transactionsBoxInstance.put(transaction.id, transaction);
  }

  static Future<void> addTransactions(List<Transaction> transactions) async {
    final Map<String, Transaction> transactionMap = {
      for (final transaction in transactions) transaction.id: transaction
    };
    await _transactionsBoxInstance.putAll(transactionMap);
  }

  static Future<void> updateTransaction(Transaction transaction) async {
    await _transactionsBoxInstance.put(transaction.id, transaction);
  }

  static Future<void> deleteTransaction(String id) async {
    await _transactionsBoxInstance.delete(id);
  }

  static Transaction? getTransaction(String id) {
    return _transactionsBoxInstance.get(id);
  }

  static List<Transaction> getAllTransactions() {
    return _transactionsBoxInstance.values.toList();
  }

  static List<Transaction> getTransactionsByDateRange(DateTime start, DateTime end) {
    return _transactionsBoxInstance.values
        .where((transaction) =>
            transaction.date.isAfter(start.subtract(const Duration(days: 1))) &&
            transaction.date.isBefore(end.add(const Duration(days: 1))))
        .toList();
  }

  static List<Transaction> getTransactionsByCategory(String category) {
    return _transactionsBoxInstance.values
        .where((transaction) => transaction.category == category)
        .toList();
  }

  static List<Transaction> getTransactionsByBudget(String budgetId) {
    return _transactionsBoxInstance.values
        .where((transaction) => transaction.budgetId == budgetId)
        .toList();
  }

  static List<Transaction> getTransactionsByType(TransactionType type) {
    return _transactionsBoxInstance.values
        .where((transaction) => transaction.type == type)
        .toList();
  }

  static Future<void> addBudget(Budget budget) async {
    await _budgetsBoxInstance.put(budget.id, budget);
  }

  static Future<void> updateBudget(Budget budget) async {
    await _budgetsBoxInstance.put(budget.id, budget);
  }

  static Future<void> deleteBudget(String id) async {
    await _budgetsBoxInstance.delete(id);
  }

  static Budget? getBudget(String id) {
    return _budgetsBoxInstance.get(id);
  }

  static List<Budget> getAllBudgets() {
    return _budgetsBoxInstance.values.toList();
  }

  static List<Budget> getActiveBudgets() {
    return _budgetsBoxInstance.values
        .where((budget) => budget.isActive)
        .toList();
  }

  static Future<void> addCategory(Category category) async {
    await _categoriesBoxInstance.put(category.id, category);
  }

  static Future<void> updateCategory(Category category) async {
    await _categoriesBoxInstance.put(category.id, category);
  }

  static Future<void> deleteCategory(String id) async {
    await _categoriesBoxInstance.delete(id);
  }

  static Category? getCategory(String id) {
    return _categoriesBoxInstance.get(id);
  }

  static List<Category> getAllCategories() {
    return _categoriesBoxInstance.values.toList();
  }

  static List<Category> getCategoriesByType(CategoryType type) {
    return _categoriesBoxInstance.values
        .where((category) => category.type == type)
        .toList();
  }

  static Category? getCategoryByName(String name) {
    return _categoriesBoxInstance.values
        .firstWhere((category) => category.name == name);
  }

  static Future<void> setSetting(String key, dynamic value) async {
    await _settingsBoxInstance.put(key, value);
  }

  static T? getSetting<T>(String key, {T? defaultValue}) {
    return _settingsBoxInstance.get(key, defaultValue: defaultValue) as T?;
  }

  static Future<void> removeSetting(String key) async {
    await _settingsBoxInstance.delete(key);
  }

  static double getTotalIncome(DateTime? startDate, DateTime? endDate) {
    var transactions = _transactionsBoxInstance.values
        .where((transaction) => transaction.type == TransactionType.income);

    if (startDate != null) {
      transactions = transactions.where((transaction) =>
          transaction.date.isAfter(startDate.subtract(const Duration(days: 1))));
    }

    if (endDate != null) {
      transactions = transactions.where((transaction) =>
          transaction.date.isBefore(endDate.add(const Duration(days: 1))));
    }

    return transactions.fold(0.0, (sum, transaction) => sum + transaction.amount);
  }

  static double getTotalExpenses(DateTime? startDate, DateTime? endDate) {
    var transactions = _transactionsBoxInstance.values
        .where((transaction) => transaction.type == TransactionType.expense);

    if (startDate != null) {
      transactions = transactions.where((transaction) =>
          transaction.date.isAfter(startDate.subtract(const Duration(days: 1))));
    }

    if (endDate != null) {
      transactions = transactions.where((transaction) =>
          transaction.date.isBefore(endDate.add(const Duration(days: 1))));
    }

    return transactions.fold(0.0, (sum, transaction) => sum + transaction.amount);
  }

  static double getNetAmount(DateTime? startDate, DateTime? endDate) {
    return getTotalIncome(startDate, endDate) - getTotalExpenses(startDate, endDate);
  }

  static Map<String, double> getCategoryTotals(DateTime? startDate, DateTime? endDate) {
    final Map<String, double> categoryTotals = {};

    var transactions = _transactionsBoxInstance.values;

    if (startDate != null) {
      transactions = transactions.where((transaction) =>
          transaction.date.isAfter(startDate.subtract(const Duration(days: 1))));
    }

    if (endDate != null) {
      transactions = transactions.where((transaction) =>
          transaction.date.isBefore(endDate.add(const Duration(days: 1))));
    }

    for (final transaction in transactions) {
      final category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] ?? 0.0) + transaction.amount;
    }

    return categoryTotals;
  }

  static Map<String, double> getMonthlyTotals(int year) {
    final Map<String, double> monthlyTotals = {};

    for (int month = 1; month <= 12; month++) {
      final startDate = DateTime(year, month, 1);
      final endDate = DateTime(year, month + 1, 0);
      final monthName = _getMonthName(month);

      monthlyTotals[monthName] = getNetAmount(startDate, endDate);
    }

    return monthlyTotals;
  }

  static String _getMonthName(int month) {
    const months = [
      'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
    ];
    return months[month - 1];
  }

  static Future<String> exportData() async {
    final data = {
      'transactions': _transactionsBoxInstance.values.map((t) => t.toMap()).toList(),
      'budgets': _budgetsBoxInstance.values.map((b) => b.toMap()).toList(),
      'categories': _categoriesBoxInstance.values.map((c) => c.toMap()).toList(),
      'settings': _settingsBoxInstance.toMap(),
      'exportDate': DateTime.now().toIso8601String(),
    };

    return data.toString();
  }

  static Future<void> importData(Map<String, dynamic> data) async {
    await _transactionsBoxInstance.clear();
    await _budgetsBoxInstance.clear();
    await _categoriesBoxInstance.clear();
    await _settingsBoxInstance.clear();

    if (data['transactions'] != null) {
      final transactions = (data['transactions'] as List)
          .map((t) => Transaction.fromMap(t))
          .toList();
      await addTransactions(transactions);
    }

    if (data['budgets'] != null) {
      final budgets = (data['budgets'] as List)
          .map((b) => Budget.fromMap(b))
          .toList();
      for (final budget in budgets) {
        await addBudget(budget);
      }
    }

    if (data['categories'] != null) {
      final categories = (data['categories'] as List)
          .map((c) => Category.fromMap(c))
          .toList();
      for (final category in categories) {
        await addCategory(category);
      }
    }

    if (data['settings'] != null) {
      final settings = data['settings'] as Map;
      for (final entry in settings.entries) {
        await setSetting(entry.key, entry.value);
      }
    }
  }

  static Future<void> _initializeDefaultCategories() async {
    if (_categoriesBoxInstance.isEmpty) {
      final defaultCategories = [
        Category(
          name: 'Alimentari',
          icon: '🍽️',
          color: '#FF5722',
          type: CategoryType.expense,
          keywords: ['supermercato', 'alimentari', 'cibo', 'ristorante', 'pizza', 'hamburger'],
          isDefault: true,
        ),
        Category(
          name: 'Trasporti',
          icon: '🚗',
          color: '#2196F3',
          type: CategoryType.expense,
          keywords: ['benzina', 'diesel', 'autobus', 'metro', 'taxi', 'uber', 'treno'],
          isDefault: true,
        ),
        Category(
          name: 'Casa',
          icon: '🏠',
          color: '#4CAF50',
          type: CategoryType.expense,
          keywords: ['affitto', 'mutuo', 'bollette', 'luce', 'gas', 'acqua', 'internet'],
          isDefault: true,
        ),
        Category(
          name: 'Intrattenimento',
          icon: '🎬',
          color: '#9C27B0',
          type: CategoryType.expense,
          keywords: ['cinema', 'teatro', 'concerto', 'disco', 'bar', 'pub'],
          isDefault: true,
        ),
        Category(
          name: 'Salute',
          icon: '💊',
          color: '#F44336',
          type: CategoryType.expense,
          keywords: ['medico', 'farmacia', 'ospedale', 'dentista', 'visita'],
          isDefault: true,
        ),
        Category(
          name: 'Shopping',
          icon: '🛍️',
          color: '#FF9800',
          type: CategoryType.expense,
          keywords: ['vestiti', 'scarpe', 'borsa', 'accessori', 'tecnologia'],
          isDefault: true,
        ),
        Category(
          name: 'Stipendio',
          icon: '💰',
          color: '#4CAF50',
          type: CategoryType.income,
          keywords: ['stipendio', 'paga', 'salario', 'lavoro'],
          isDefault: true,
        ),
        Category(
          name: 'Freelance',
          icon: '💼',
          color: '#2196F3',
          type: CategoryType.income,
          keywords: ['freelance', 'progetto', 'consulenza'],
          isDefault: true,
        ),
        Category(
          name: 'Investimenti',
          icon: '📈',
          color: '#FF9800',
          type: CategoryType.income,
          keywords: ['dividendi', 'interessi', 'investimenti', 'azioni'],
          isDefault: true,
        ),
      ];

      for (final category in defaultCategories) {
        await addCategory(category);
      }
    }
  }
}


