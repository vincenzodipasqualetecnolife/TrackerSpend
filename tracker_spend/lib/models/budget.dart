import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'budget.g.dart';

@HiveType(typeId: 2)
class Budget extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String description;

  @HiveField(3)
  final double totalAmount;

  @HiveField(4)
  final BudgetPeriod period;

  @HiveField(5)
  final DateTime startDate;

  @HiveField(6)
  final DateTime endDate;

  @HiveField(7)
  final List<BudgetCategory> categories;

  @HiveField(8)
  final DateTime createdAt;

  @HiveField(9)
  final DateTime updatedAt;

  @HiveField(10)
  final bool isActive;

  @HiveField(11)
  final Map<String, dynamic>? metadata;

  Budget({
    String? id,
    required this.name,
    required this.description,
    required this.totalAmount,
    required this.period,
    required this.startDate,
    required this.endDate,
    List<BudgetCategory>? categories,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.isActive = true,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        categories = categories ?? [],
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  double get spentAmount {
    return categories.fold(0.0, (sum, category) => sum + category.spentAmount);
  }

  double get remainingAmount => totalAmount - spentAmount;

  double get spentPercentage => totalAmount > 0 ? (spentAmount / totalAmount) * 100 : 0;

  bool get isOverBudget => spentAmount > totalAmount;

  /// Creates an empty budget for fallback
  static Budget empty() {
    return Budget(
      name: 'Empty',
      description: 'Empty budget',
      totalAmount: 0,
      period: BudgetPeriod.monthly,
      startDate: DateTime.now(),
      endDate: DateTime.now().add(Duration(days: 30)),
      categories: [],
    );
  }

  Budget copyWith({
    String? id,
    String? name,
    String? description,
    double? totalAmount,
    BudgetPeriod? period,
    DateTime? startDate,
    DateTime? endDate,
    List<BudgetCategory>? categories,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isActive,
    Map<String, dynamic>? metadata,
  }) {
    return Budget(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      totalAmount: totalAmount ?? this.totalAmount,
      period: period ?? this.period,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      categories: categories ?? this.categories,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isActive: isActive ?? this.isActive,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'totalAmount': totalAmount,
      'period': period.name,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'categories': categories.map((c) => c.toMap()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isActive': isActive,
      'metadata': metadata,
    };
  }

  factory Budget.fromMap(Map<String, dynamic> map) {
    return Budget(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      totalAmount: map['totalAmount'].toDouble(),
      period: BudgetPeriod.values.firstWhere(
        (e) => e.name == map['period'],
        orElse: () => BudgetPeriod.monthly,
      ),
      startDate: DateTime.parse(map['startDate']),
      endDate: DateTime.parse(map['endDate']),
      categories: (map['categories'] as List)
          .map((c) => BudgetCategory.fromMap(c))
          .toList(),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      isActive: map['isActive'] ?? true,
      metadata: map['metadata'],
    );
  }

  @override
  String toString() {
    return 'Budget(id: $id, name: $name, totalAmount: $totalAmount, period: $period)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Budget && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

@HiveType(typeId: 3)
class BudgetCategory extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final double allocatedAmount;

  @HiveField(3)
  final double spentAmount;

  @HiveField(4)
  final String color;

  BudgetCategory({
    String? id,
    required this.name,
    required this.allocatedAmount,
    this.spentAmount = 0.0,
    this.color = '#2196F3',
  }) : id = id ?? const Uuid().v4();

  double get remainingAmount => allocatedAmount - spentAmount;

  double get spentPercentage => allocatedAmount > 0 ? (spentAmount / allocatedAmount) * 100 : 0;

  bool get isOverBudget => spentAmount > allocatedAmount;

  BudgetCategory copyWith({
    String? id,
    String? name,
    double? allocatedAmount,
    double? spentAmount,
    String? color,
  }) {
    return BudgetCategory(
      id: id ?? this.id,
      name: name ?? this.name,
      allocatedAmount: allocatedAmount ?? this.allocatedAmount,
      spentAmount: spentAmount ?? this.spentAmount,
      color: color ?? this.color,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'allocatedAmount': allocatedAmount,
      'spentAmount': spentAmount,
      'color': color,
    };
  }

  factory BudgetCategory.fromMap(Map<String, dynamic> map) {
    return BudgetCategory(
      id: map['id'],
      name: map['name'],
      allocatedAmount: map['allocatedAmount'].toDouble(),
      spentAmount: map['spentAmount'].toDouble(),
      color: map['color'] ?? '#2196F3',
    );
  }

  @override
  String toString() {
    return 'BudgetCategory(id: $id, name: $name, allocatedAmount: $allocatedAmount, spentAmount: $spentAmount)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is BudgetCategory && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

@HiveType(typeId: 4)
enum BudgetPeriod {
  @HiveField(0)
  weekly,
  @HiveField(1)
  monthly,
  @HiveField(2)
  quarterly,
  @HiveField(3)
  yearly,
}
