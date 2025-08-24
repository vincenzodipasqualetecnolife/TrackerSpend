import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'risk_guard.g.dart';

@HiveType(typeId: 30)
class Alert extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final AlertType type;

  @HiveField(2)
  final String title;

  @HiveField(3)
  final String message;

  @HiveField(4)
  final AlertSeverity severity;

  @HiveField(5)
  final DateTime createdAt;

  @HiveField(6)
  final bool read;

  @HiveField(7)
  final bool actionRequired;

  @HiveField(8)
  final Map<String, dynamic>? metadata;

  Alert({
    String? id,
    required this.type,
    required this.title,
    required this.message,
    required this.severity,
    DateTime? createdAt,
    this.read = false,
    this.actionRequired = false,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  Alert copyWith({
    String? id,
    AlertType? type,
    String? title,
    String? message,
    AlertSeverity? severity,
    DateTime? createdAt,
    bool? read,
    bool? actionRequired,
    Map<String, dynamic>? metadata,
  }) {
    return Alert(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      severity: severity ?? this.severity,
      createdAt: createdAt ?? this.createdAt,
      read: read ?? this.read,
      actionRequired: actionRequired ?? this.actionRequired,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type.name,
      'title': title,
      'message': message,
      'severity': severity.name,
      'createdAt': createdAt.toIso8601String(),
      'read': read,
      'actionRequired': actionRequired,
      'metadata': metadata,
    };
  }

  factory Alert.fromMap(Map<String, dynamic> map) {
    return Alert(
      id: map['id'],
      type: AlertType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => AlertType.general,
      ),
      title: map['title'],
      message: map['message'],
      severity: AlertSeverity.values.firstWhere(
        (e) => e.name == map['severity'],
        orElse: () => AlertSeverity.medium,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      read: map['read'] ?? false,
      actionRequired: map['actionRequired'] ?? false,
      metadata: map['metadata'],
    );
  }
}

@HiveType(typeId: 31)
enum AlertType {
  @HiveField(0)
  low_balance,
  @HiveField(1)
  high_spending,
  @HiveField(2)
  budget_exceeded,
  @HiveField(3)
  unusual_transaction,
  @HiveField(4)
  general,
}

@HiveType(typeId: 32)
enum AlertSeverity {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
  @HiveField(3)
  critical,
}

@HiveType(typeId: 33)
class EmergencyFund extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final double targetAmount;

  @HiveField(3)
  final double currentAmount;

  @HiveField(4)
  final double monthlyContribution;

  @HiveField(5)
  final EmergencyFundStatus status;

  @HiveField(6)
  final EmergencyFundPriority priority;

  @HiveField(7)
  final DateTime createdAt;

  @HiveField(8)
  final DateTime updatedAt;

  @HiveField(9)
  final Map<String, dynamic>? metadata;

  EmergencyFund({
    String? id,
    required this.name,
    required this.targetAmount,
    this.currentAmount = 0.0,
    this.monthlyContribution = 0.0,
    this.status = EmergencyFundStatus.active,
    this.priority = EmergencyFundPriority.medium,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  double get progressPercentage => targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

  double get remainingAmount => targetAmount - currentAmount;

  bool get isCompleted => currentAmount >= targetAmount;

  EmergencyFund copyWith({
    String? id,
    String? name,
    double? targetAmount,
    double? currentAmount,
    double? monthlyContribution,
    EmergencyFundStatus? status,
    EmergencyFundPriority? priority,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? metadata,
  }) {
    return EmergencyFund(
      id: id ?? this.id,
      name: name ?? this.name,
      targetAmount: targetAmount ?? this.targetAmount,
      currentAmount: currentAmount ?? this.currentAmount,
      monthlyContribution: monthlyContribution ?? this.monthlyContribution,
      status: status ?? this.status,
      priority: priority ?? this.priority,
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
      'monthlyContribution': monthlyContribution,
      'status': status.name,
      'priority': priority.name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory EmergencyFund.fromMap(Map<String, dynamic> map) {
    return EmergencyFund(
      id: map['id'],
      name: map['name'],
      targetAmount: map['targetAmount'].toDouble(),
      currentAmount: map['currentAmount'].toDouble(),
      monthlyContribution: map['monthlyContribution'].toDouble(),
      status: EmergencyFundStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => EmergencyFundStatus.active,
      ),
      priority: EmergencyFundPriority.values.firstWhere(
        (e) => e.name == map['priority'],
        orElse: () => EmergencyFundPriority.medium,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      metadata: map['metadata'],
    );
  }
}

@HiveType(typeId: 34)
enum EmergencyFundStatus {
  @HiveField(0)
  active,
  @HiveField(1)
  paused,
  @HiveField(2)
  completed,
}

@HiveType(typeId: 35)
enum EmergencyFundPriority {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
}

@HiveType(typeId: 36)
class RiskAssessment extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String category;

  @HiveField(2)
  final RiskLevel riskLevel;

  @HiveField(3)
  final int score;

  @HiveField(4)
  final String description;

  @HiveField(5)
  final List<String> recommendations;

  @HiveField(6)
  final DateTime assessedAt;

  @HiveField(7)
  final Map<String, dynamic>? data;

  RiskAssessment({
    String? id,
    required this.category,
    required this.riskLevel,
    required this.score,
    required this.description,
    required this.recommendations,
    DateTime? assessedAt,
    this.data,
  })  : id = id ?? const Uuid().v4(),
        assessedAt = assessedAt ?? DateTime.now();

  RiskAssessment copyWith({
    String? id,
    String? category,
    RiskLevel? riskLevel,
    int? score,
    String? description,
    List<String>? recommendations,
    DateTime? assessedAt,
    Map<String, dynamic>? data,
  }) {
    return RiskAssessment(
      id: id ?? this.id,
      category: category ?? this.category,
      riskLevel: riskLevel ?? this.riskLevel,
      score: score ?? this.score,
      description: description ?? this.description,
      recommendations: recommendations ?? this.recommendations,
      assessedAt: assessedAt ?? this.assessedAt,
      data: data ?? this.data,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'category': category,
      'riskLevel': riskLevel.name,
      'score': score,
      'description': description,
      'recommendations': recommendations,
      'assessedAt': assessedAt.toIso8601String(),
      'data': data,
    };
  }

  factory RiskAssessment.fromMap(Map<String, dynamic> map) {
    return RiskAssessment(
      id: map['id'],
      category: map['category'],
      riskLevel: RiskLevel.values.firstWhere(
        (e) => e.name == map['riskLevel'],
        orElse: () => RiskLevel.medium,
      ),
      score: map['score'],
      description: map['description'],
      recommendations: List<String>.from(map['recommendations'] ?? []),
      assessedAt: DateTime.parse(map['assessedAt']),
      data: map['data'],
    );
  }
}

@HiveType(typeId: 37)
enum RiskLevel {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
}

@HiveType(typeId: 38)
class Insurance extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final InsuranceType type;

  @HiveField(2)
  final String provider;

  @HiveField(3)
  final double monthlyPremium;

  @HiveField(4)
  final double coverage;

  @HiveField(5)
  final DateTime expiryDate;

  @HiveField(6)
  final InsuranceStatus status;

  @HiveField(7)
  final DateTime createdAt;

  @HiveField(8)
  final Map<String, dynamic>? metadata;

  Insurance({
    String? id,
    required this.type,
    required this.provider,
    required this.monthlyPremium,
    required this.coverage,
    required this.expiryDate,
    this.status = InsuranceStatus.active,
    DateTime? createdAt,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  bool get isExpired => expiryDate.isBefore(DateTime.now());

  bool get isExpiringSoon {
    final now = DateTime.now();
    final daysUntilExpiry = expiryDate.difference(now).inDays;
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }

  Insurance copyWith({
    String? id,
    InsuranceType? type,
    String? provider,
    double? monthlyPremium,
    double? coverage,
    DateTime? expiryDate,
    InsuranceStatus? status,
    DateTime? createdAt,
    Map<String, dynamic>? metadata,
  }) {
    return Insurance(
      id: id ?? this.id,
      type: type ?? this.type,
      provider: provider ?? this.provider,
      monthlyPremium: monthlyPremium ?? this.monthlyPremium,
      coverage: coverage ?? this.coverage,
      expiryDate: expiryDate ?? this.expiryDate,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type.name,
      'provider': provider,
      'monthlyPremium': monthlyPremium,
      'coverage': coverage,
      'expiryDate': expiryDate.toIso8601String(),
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory Insurance.fromMap(Map<String, dynamic> map) {
    return Insurance(
      id: map['id'],
      type: InsuranceType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => InsuranceType.health,
      ),
      provider: map['provider'],
      monthlyPremium: map['monthlyPremium'].toDouble(),
      coverage: map['coverage'].toDouble(),
      expiryDate: DateTime.parse(map['expiryDate']),
      status: InsuranceStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => InsuranceStatus.active,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      metadata: map['metadata'],
    );
  }
}

@HiveType(typeId: 39)
enum InsuranceType {
  @HiveField(0)
  health,
  @HiveField(1)
  auto,
  @HiveField(2)
  home,
  @HiveField(3)
  life,
  @HiveField(4)
  disability,
}

@HiveType(typeId: 40)
enum InsuranceStatus {
  @HiveField(0)
  active,
  @HiveField(1)
  expired,
  @HiveField(2)
  pending,
}
