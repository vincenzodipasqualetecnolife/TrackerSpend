import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'education.g.dart';

@HiveType(typeId: 20)
class Tip extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String content;

  @HiveField(3)
  final TipCategory category;

  @HiveField(4)
  final TipDifficulty difficulty;

  @HiveField(5)
  final bool read;

  @HiveField(6)
  final DateTime createdAt;

  @HiveField(7)
  final DateTime? readAt;

  Tip({
    String? id,
    required this.title,
    required this.content,
    required this.category,
    required this.difficulty,
    this.read = false,
    DateTime? createdAt,
    this.readAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  Tip copyWith({
    String? id,
    String? title,
    String? content,
    TipCategory? category,
    TipDifficulty? difficulty,
    bool? read,
    DateTime? createdAt,
    DateTime? readAt,
  }) {
    return Tip(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      read: read ?? this.read,
      createdAt: createdAt ?? this.createdAt,
      readAt: readAt ?? this.readAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'category': category.name,
      'difficulty': difficulty.name,
      'read': read,
      'createdAt': createdAt.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
    };
  }

  factory Tip.fromMap(Map<String, dynamic> map) {
    return Tip(
      id: map['id'],
      title: map['title'],
      content: map['content'],
      category: TipCategory.values.firstWhere(
        (e) => e.name == map['category'],
        orElse: () => TipCategory.general,
      ),
      difficulty: TipDifficulty.values.firstWhere(
        (e) => e.name == map['difficulty'],
        orElse: () => TipDifficulty.beginner,
      ),
      read: map['read'] ?? false,
      createdAt: DateTime.parse(map['createdAt']),
      readAt: map['readAt'] != null ? DateTime.parse(map['readAt']) : null,
    );
  }
}

@HiveType(typeId: 21)
enum TipCategory {
  @HiveField(0)
  savings,
  @HiveField(1)
  budget,
  @HiveField(2)
  investment,
  @HiveField(3)
  general,
}

@HiveType(typeId: 22)
enum TipDifficulty {
  @HiveField(0)
  beginner,
  @HiveField(1)
  intermediate,
  @HiveField(2)
  advanced,
}

@HiveType(typeId: 23)
class Badge extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String description;

  @HiveField(3)
  final String icon;

  @HiveField(4)
  final BadgeCategory category;

  @HiveField(5)
  final bool unlocked;

  @HiveField(6)
  final DateTime? unlockedAt;

  @HiveField(7)
  final int progress;

  @HiveField(8)
  final int maxProgress;

  @HiveField(9)
  final DateTime createdAt;

  Badge({
    String? id,
    required this.name,
    required this.description,
    required this.icon,
    required this.category,
    this.unlocked = false,
    this.unlockedAt,
    this.progress = 0,
    required this.maxProgress,
    DateTime? createdAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();

  double get progressPercentage => maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  Badge copyWith({
    String? id,
    String? name,
    String? description,
    String? icon,
    BadgeCategory? category,
    bool? unlocked,
    DateTime? unlockedAt,
    int? progress,
    int? maxProgress,
    DateTime? createdAt,
  }) {
    return Badge(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      category: category ?? this.category,
      unlocked: unlocked ?? this.unlocked,
      unlockedAt: unlockedAt ?? this.unlockedAt,
      progress: progress ?? this.progress,
      maxProgress: maxProgress ?? this.maxProgress,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon': icon,
      'category': category.name,
      'unlocked': unlocked,
      'unlockedAt': unlockedAt?.toIso8601String(),
      'progress': progress,
      'maxProgress': maxProgress,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Badge.fromMap(Map<String, dynamic> map) {
    return Badge(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      icon: map['icon'],
      category: BadgeCategory.values.firstWhere(
        (e) => e.name == map['category'],
        orElse: () => BadgeCategory.achievement,
      ),
      unlocked: map['unlocked'] ?? false,
      unlockedAt: map['unlockedAt'] != null ? DateTime.parse(map['unlockedAt']) : null,
      progress: map['progress'] ?? 0,
      maxProgress: map['maxProgress'],
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}

@HiveType(typeId: 24)
enum BadgeCategory {
  @HiveField(0)
  savings,
  @HiveField(1)
  budget,
  @HiveField(2)
  consistency,
  @HiveField(3)
  achievement,
}

@HiveType(typeId: 25)
class Report extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String title;

  @HiveField(2)
  final String period;

  @HiveField(3)
  final String summary;

  @HiveField(4)
  final List<String> insights;

  @HiveField(5)
  final List<String> recommendations;

  @HiveField(6)
  final DateTime generatedAt;

  @HiveField(7)
  final Map<String, dynamic>? data;

  Report({
    String? id,
    required this.title,
    required this.period,
    required this.summary,
    required this.insights,
    required this.recommendations,
    DateTime? generatedAt,
    this.data,
  })  : id = id ?? const Uuid().v4(),
        generatedAt = generatedAt ?? DateTime.now();

  Report copyWith({
    String? id,
    String? title,
    String? period,
    String? summary,
    List<String>? insights,
    List<String>? recommendations,
    DateTime? generatedAt,
    Map<String, dynamic>? data,
  }) {
    return Report(
      id: id ?? this.id,
      title: title ?? this.title,
      period: period ?? this.period,
      summary: summary ?? this.summary,
      insights: insights ?? this.insights,
      recommendations: recommendations ?? this.recommendations,
      generatedAt: generatedAt ?? this.generatedAt,
      data: data ?? this.data,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'period': period,
      'summary': summary,
      'insights': insights,
      'recommendations': recommendations,
      'generatedAt': generatedAt.toIso8601String(),
      'data': data,
    };
  }

  factory Report.fromMap(Map<String, dynamic> map) {
    return Report(
      id: map['id'],
      title: map['title'],
      period: map['period'],
      summary: map['summary'],
      insights: List<String>.from(map['insights'] ?? []),
      recommendations: List<String>.from(map['recommendations'] ?? []),
      generatedAt: DateTime.parse(map['generatedAt']),
      data: map['data'],
    );
  }
}
