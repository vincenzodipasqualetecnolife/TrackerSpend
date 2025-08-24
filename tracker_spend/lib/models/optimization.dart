import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'optimization.g.dart';

@HiveType(typeId: 50)
class OptimizationSuggestion extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String description;

  @HiveField(3)
  final double potentialSavings;

  @HiveField(4)
  final SuggestionDifficulty difficulty;

  @HiveField(5)
  final String category;

  @HiveField(6)
  final bool implemented;

  @HiveField(7)
  final DateTime? implementedAt;

  @HiveField(8)
  final DateTime createdAt;

  @HiveField(9)
  final Map<String, dynamic>? metadata;

  OptimizationSuggestion({
    String? id,
    required this.title,
    required this.description,
    required this.potentialSavings,
    required this.difficulty,
    required this.category,
    this.implemented = false,
    this.implementedAt,
    DateTime? createdAt,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  OptimizationSuggestion copyWith({
    String? id,
    String? title,
    String? description,
    double? potentialSavings,
    SuggestionDifficulty? difficulty,
    String? category,
    bool? implemented,
    DateTime? implementedAt,
    DateTime? createdAt,
    Map<String, dynamic>? metadata,
  }) {
    return OptimizationSuggestion(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      potentialSavings: potentialSavings ?? this.potentialSavings,
      difficulty: difficulty ?? this.difficulty,
      category: category ?? this.category,
      implemented: implemented ?? this.implemented,
      implementedAt: implementedAt ?? this.implementedAt,
      createdAt: createdAt ?? this.createdAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'potentialSavings': potentialSavings,
      'difficulty': difficulty.name,
      'category': category,
      'implemented': implemented,
      'implementedAt': implementedAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory OptimizationSuggestion.fromMap(Map<String, dynamic> map) {
    return OptimizationSuggestion(
      id: map['id'],
      title: map['title'],
      description: map['description'],
      potentialSavings: map['potentialSavings'].toDouble(),
      difficulty: SuggestionDifficulty.values.firstWhere(
        (e) => e.name == map['difficulty'],
        orElse: () => SuggestionDifficulty.medium,
      ),
      category: map['category'],
      implemented: map['implemented'] ?? false,
      implementedAt: map['implementedAt'] != null ? DateTime.parse(map['implementedAt']) : null,
      createdAt: DateTime.parse(map['createdAt']),
      metadata: map['metadata'],
    );
  }
}

@HiveType(typeId: 51)
enum SuggestionDifficulty {
  @HiveField(0)
  easy,
  @HiveField(1)
  medium,
  @HiveField(2)
  hard,
}

@HiveType(typeId: 52)
class Integration extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final IntegrationType type;

  @HiveField(3)
  final IntegrationStatus status;

  @HiveField(4)
  final DateTime lastSync;

  @HiveField(5)
  final String icon;

  @HiveField(6)
  final Map<String, dynamic>? config;

  @HiveField(7)
  final DateTime createdAt;

  @HiveField(8)
  final DateTime updatedAt;

  @HiveField(9)
  final Map<String, dynamic>? metadata;

  Integration({
    String? id,
    required this.name,
    required this.type,
    this.status = IntegrationStatus.disconnected,
    DateTime? lastSync,
    required this.icon,
    this.config,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        lastSync = lastSync ?? DateTime.now(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Integration copyWith({
    String? id,
    String? name,
    IntegrationType? type,
    IntegrationStatus? status,
    DateTime? lastSync,
    String? icon,
    Map<String, dynamic>? config,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return Integration(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      status: status ?? this.status,
      lastSync: lastSync ?? this.lastSync,
      icon: icon ?? this.icon,
      config: config ?? this.config,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'status': status.name,
      'lastSync': lastSync.toIso8601String(),
      'icon': icon,
      'config': config,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory Integration.fromMap(Map<String, dynamic> map) {
    return Integration(
      id: map['id'],
      name: map['name'],
      type: IntegrationType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => IntegrationType.excel,
      ),
      status: IntegrationStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => IntegrationStatus.disconnected,
      ),
      lastSync: DateTime.parse(map['lastSync']),
      icon: map['icon'],
      config: map['config'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      metadata: map['metadata'],
    );
  }
}

@HiveType(typeId: 53)
enum IntegrationType {
  @HiveField(0)
  excel,
  @HiveField(1)
  sheets,
  @HiveField(2)
  banking,
  @HiveField(3)
  investment,
}

@HiveType(typeId: 54)
enum IntegrationStatus {
  @HiveField(0)
  connected,
  @HiveField(1)
  disconnected,
  @HiveField(2)
  error,
}

@HiveType(typeId: 55)
class SpendingTrend extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String month;

  @HiveField(2)
  final double spending;

  @HiveField(3)
  final double budget;

  @HiveField(4)
  final double savings;

  @HiveField(5)
  final DateTime date;

  @HiveField(6)
  final Map<String, dynamic>? categoryBreakdown;

  @HiveField(7)
  final DateTime createdAt;

  SpendingTrend({
    String? id,
    required this.month,
    required this.spending,
    required this.budget,
    required this.savings,
    DateTime? date,
    this.categoryBreakdown,
    DateTime? createdAt,
  })  : id = id ?? const Uuid().v4(),
        date = date ?? DateTime.now(),
        createdAt = createdAt ?? DateTime.now();

  double get overspending => spending > budget ? spending - budget : 0;

  double get savingsRate => spending > 0 ? (savings / spending) * 100 : 0;

  SpendingTrend copyWith({
    String? id,
    String? month,
    double? spending,
    double? budget,
    double? savings,
    DateTime? date,
    Map<String, dynamic>? categoryBreakdown,
    DateTime? createdAt,
  }) {
    return SpendingTrend(
      id: id ?? this.id,
      month: month ?? this.month,
      spending: spending ?? this.spending,
      budget: budget ?? this.budget,
      savings: savings ?? this.savings,
      date: date ?? this.date,
      categoryBreakdown: categoryBreakdown ?? this.categoryBreakdown,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'month': month,
      'spending': spending,
      'budget': budget,
      'savings': savings,
      'date': date.toIso8601String(),
      'categoryBreakdown': categoryBreakdown,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory SpendingTrend.fromMap(Map<String, dynamic> map) {
    return SpendingTrend(
      id: map['id'],
      month: map['month'],
      spending: map['spending'].toDouble(),
      budget: map['budget'].toDouble(),
      savings: map['savings'].toDouble(),
      date: DateTime.parse(map['date']),
      categoryBreakdown: map['categoryBreakdown'],
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

@HiveType(typeId: 56)
class CategoryAnalysis extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String category;

  @HiveField(2)
  final double amount;

  @HiveField(3)
  final double percentage;

  @HiveField(4)
  final CategoryTrend trend;

  @HiveField(5)
  final String suggestion;

  @HiveField(6)
  final DateTime analyzedAt;

  @HiveField(7)
  final Map<String, dynamic>? data;

  CategoryAnalysis({
    String? id,
    required this.category,
    required this.amount,
    required this.percentage,
    required this.trend,
    required this.suggestion,
    DateTime? analyzedAt,
    this.data,
  })  : id = id ?? const Uuid().v4(),
        analyzedAt = analyzedAt ?? DateTime.now();

  CategoryAnalysis copyWith({
    String? id,
    String? category,
    double? amount,
    double? percentage,
    CategoryTrend? trend,
    String? suggestion,
    DateTime? analyzedAt,
    Map<String, dynamic>? data,
  }) {
    return CategoryAnalysis(
      id: id ?? this.id,
      category: category ?? this.category,
      amount: amount ?? this.amount,
      percentage: percentage ?? this.percentage,
      trend: trend ?? this.trend,
      suggestion: suggestion ?? this.suggestion,
      analyzedAt: analyzedAt ?? this.analyzedAt,
      data: data ?? this.data,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'category': category,
      'amount': amount,
      'percentage': percentage,
      'trend': trend.name,
      'suggestion': suggestion,
      'analyzedAt': analyzedAt.toIso8601String(),
      'data': data,
    };
  }

  factory CategoryAnalysis.fromMap(Map<String, dynamic> map) {
    return CategoryAnalysis(
      id: map['id'],
      category: map['category'],
      amount: map['amount'].toDouble(),
      percentage: map['percentage'].toDouble(),
      trend: CategoryTrend.values.firstWhere(
        (e) => e.name == map['trend'],
        orElse: () => CategoryTrend.stable,
      ),
      suggestion: map['suggestion'],
      analyzedAt: DateTime.parse(map['analyzedAt']),
      data: map['data'],
    );
  }
}

@HiveType(typeId: 57)
enum CategoryTrend {
  @HiveField(0)
  up,
  @HiveField(1)
  down,
  @HiveField(2)
  stable,
}
