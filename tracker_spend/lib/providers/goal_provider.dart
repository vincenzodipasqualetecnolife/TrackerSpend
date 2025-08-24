import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/goal.dart';

class GoalProvider extends ChangeNotifier {
  static const String _boxName = 'goals';
  late Box<Goal> _goalsBox;
  
  List<Goal> _goals = [];
  bool _isLoading = false;
  String? _error;

  List<Goal> get goals => _goals;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Computed properties
  List<Goal> get activeGoals => _goals.where((goal) => goal.status == GoalStatus.active).toList();
  List<Goal> get completedGoals => _goals.where((goal) => goal.status == GoalStatus.completed).toList();
  List<Goal> get overdueGoals => _goals.where((goal) => goal.isOverdue).toList();
  
  double get totalTargetAmount => _goals.fold(0.0, (sum, goal) => sum + goal.targetAmount);
  double get totalCurrentAmount => _goals.fold(0.0, (sum, goal) => sum + goal.currentAmount);
  double get totalProgressPercentage => totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  Future<void> initialize() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _goalsBox = await Hive.openBox<Goal>(_boxName);
      await _loadGoals();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Errore nell\'inizializzazione degli obiettivi: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadGoals() async {
    try {
      _goals = _goalsBox.values.toList();
      _goals.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } catch (e) {
      _error = 'Errore nel caricamento degli obiettivi: $e';
    }
  }

  Future<void> addGoal(Goal goal) async {
    try {
      _error = null;
      
      await _goalsBox.put(goal.id, goal);
      _goals.add(goal);
      _goals.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      notifyListeners();
    } catch (e) {
      _error = 'Errore nell\'aggiunta dell\'obiettivo: $e';
      notifyListeners();
    }
  }

  Future<void> updateGoal(Goal goal) async {
    try {
      _error = null;
      
      await _goalsBox.put(goal.id, goal);
      final index = _goals.indexWhere((g) => g.id == goal.id);
      if (index != -1) {
        _goals[index] = goal;
        _goals.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      }
      
      notifyListeners();
    } catch (e) {
      _error = 'Errore nell\'aggiornamento dell\'obiettivo: $e';
      notifyListeners();
    }
  }

  Future<void> deleteGoal(String goalId) async {
    try {
      _error = null;
      
      await _goalsBox.delete(goalId);
      _goals.removeWhere((goal) => goal.id == goalId);
      
      notifyListeners();
    } catch (e) {
      _error = 'Errore nell\'eliminazione dell\'obiettivo: $e';
      notifyListeners();
    }
  }

  Future<void> updateGoalProgress(String goalId, double newAmount) async {
    try {
      _error = null;
      
      final goal = _goals.firstWhere((g) => g.id == goalId);
      final updatedGoal = goal.copyWith(
        currentAmount: newAmount,
        status: newAmount >= goal.targetAmount ? GoalStatus.completed : GoalStatus.active,
        updatedAt: DateTime.now(),
      );
      
      await updateGoal(updatedGoal);
    } catch (e) {
      _error = 'Errore nell\'aggiornamento del progresso: $e';
      notifyListeners();
    }
  }

  Future<void> completeGoal(String goalId) async {
    try {
      _error = null;
      
      final goal = _goals.firstWhere((g) => g.id == goalId);
      final updatedGoal = goal.copyWith(
        currentAmount: goal.targetAmount,
        status: GoalStatus.completed,
        updatedAt: DateTime.now(),
      );
      
      await updateGoal(updatedGoal);
    } catch (e) {
      _error = 'Errore nel completamento dell\'obiettivo: $e';
      notifyListeners();
    }
  }

  Future<void> pauseGoal(String goalId) async {
    try {
      _error = null;
      
      final goal = _goals.firstWhere((g) => g.id == goalId);
      final updatedGoal = goal.copyWith(
        status: GoalStatus.paused,
        updatedAt: DateTime.now(),
      );
      
      await updateGoal(updatedGoal);
    } catch (e) {
      _error = 'Errore nella pausa dell\'obiettivo: $e';
      notifyListeners();
    }
  }

  Future<void> resumeGoal(String goalId) async {
    try {
      _error = null;
      
      final goal = _goals.firstWhere((g) => g.id == goalId);
      final updatedGoal = goal.copyWith(
        status: GoalStatus.active,
        updatedAt: DateTime.now(),
      );
      
      await updateGoal(updatedGoal);
    } catch (e) {
      _error = 'Errore nella ripresa dell\'obiettivo: $e';
      notifyListeners();
    }
  }

  // Filter methods
  List<Goal> getGoalsByCategory(String category) {
    return _goals.where((goal) => goal.category == category).toList();
  }

  List<Goal> getGoalsByPriority(GoalPriority priority) {
    return _goals.where((goal) => goal.priority == priority).toList();
  }

  List<Goal> getGoalsByStatus(GoalStatus status) {
    return _goals.where((goal) => goal.status == status).toList();
  }

  // Analytics methods
  Map<String, double> getCategoryProgress() {
    final Map<String, double> categoryProgress = {};
    final Map<String, double> categoryTargets = {};
    final Map<String, double> categoryCurrents = {};

    for (final goal in _goals) {
      categoryTargets[goal.category] = (categoryTargets[goal.category] ?? 0) + goal.targetAmount;
      categoryCurrents[goal.category] = (categoryCurrents[goal.category] ?? 0) + goal.currentAmount;
    }

    for (final category in categoryTargets.keys) {
      final target = categoryTargets[category]!;
      final current = categoryCurrents[category]!;
      categoryProgress[category] = target > 0 ? (current / target) * 100 : 0;
    }

    return categoryProgress;
  }

  Map<GoalPriority, int> getGoalsByPriorityCount() {
    final Map<GoalPriority, int> priorityCount = {};
    for (final goal in _goals) {
      priorityCount[goal.priority] = (priorityCount[goal.priority] ?? 0) + 1;
    }
    return priorityCount;
  }

  // Search methods
  List<Goal> searchGoals(String query) {
    if (query.isEmpty) return _goals;
    
    final lowercaseQuery = query.toLowerCase();
    return _goals.where((goal) => 
      goal.name.toLowerCase().contains(lowercaseQuery) ||
      goal.category.toLowerCase().contains(lowercaseQuery)
    ).toList();
  }

  // Export methods
  List<Map<String, dynamic>> exportGoals() {
    return _goals.map((goal) => goal.toMap()).toList();
  }

  Future<void> importGoals(List<Map<String, dynamic>> goalsData) async {
    try {
      _error = null;
      
      for (final goalData in goalsData) {
        final goal = Goal.fromMap(goalData);
        await addGoal(goal);
      }
    } catch (e) {
      _error = 'Errore nell\'importazione degli obiettivi: $e';
      notifyListeners();
    }
  }

  // Clear all data (for testing/reset)
  Future<void> clearAllGoals() async {
    try {
      _error = null;
      
      await _goalsBox.clear();
      _goals.clear();
      
      notifyListeners();
    } catch (e) {
      _error = 'Errore nella cancellazione degli obiettivi: $e';
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _goalsBox.close();
    super.dispose();
  }
}
