import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'goal.g.dart';

@HiveType(typeId: 10)
class Goal extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final double targetAmount;

  @HiveField(3)
  final double currentAmount;

  @HiveField(4)
  final DateTime deadline;

  @HiveField(5)
  final String category;

  @HiveField(6)
  final GoalPriority priority;

  @HiveField(7)
  final GoalStatus status;

  @HiveField(8)
  final DateTime createdAt;

  @HiveField(9)
  final DateTime updatedAt;

  @HiveField(10)
  final Map<String, dynamic>? metadata;

  Goal({
    String? id,
    required this.name,
    required this.targetAmount,
    this.currentAmount = 0.0,
    required this.deadline,
    required this.category,
    required this.priority,
    this.status = GoalStatus.active,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  double get progressPercentage => targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  int get daysRemaining {
    final now = DateTime.now();
    final remaining = deadline.difference(now).inDays;
    return remaining > 0 ? remaining : 0;
  }

  bool get isCompleted => currentAmount >= targetAmount;

  bool get isOverdue => deadline.isBefore(DateTime.now()) && !isCompleted;

  Goal copyWith({
    String? id,
    String? name,
    double? targetAmount,
    double? currentAmount,
    DateTime? deadline,
    String? category,
    GoalPriority? priority,
    GoalStatus? status,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return Goal(
      id: id ?? this.id,
      name: name ?? this.name,
      targetAmount: targetAmount ?? this.targetAmount,
      currentAmount: currentAmount ?? this.currentAmount,
      deadline: deadline ?? this.deadline,
      category: category ?? this.category,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'targetAmount': targetAmount,
      'currentAmount': currentAmount,
      'deadline': deadline.toIso8601String(),
      'category': category,
      'priority': priority.name,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory Goal.fromMap(Map<String, dynamic> map) {
    return Goal(
      id: map['id'],
      name: map['name'],
      targetAmount: map['targetAmount'].toDouble(),
      currentAmount: map['currentAmount'].toDouble(),
      deadline: DateTime.parse(map['deadline']),
      category: map['category'],
      priority: GoalPriority.values.firstWhere(
        (e) => e.name == map['priority'],
        orElse: () => GoalPriority.medium,
      ),
      status: GoalStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => GoalStatus.active,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      metadata: map['metadata'],
    );
  }

  @override
  String toString() {
    return 'Goal(id: $id, name: $name, targetAmount: $targetAmount, currentAmount: $currentAmount, progress: ${progressPercentage.toStringAsFixed(1)}%)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Goal && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

@HiveType(typeId: 11)
enum GoalPriority {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
}

@HiveType(typeId: 12)
enum GoalStatus {
  @HiveField(0)
  active,
  @HiveField(1)
  completed,
  @HiveField(2)
  paused,
}
