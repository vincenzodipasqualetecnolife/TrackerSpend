import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'category.g.dart';

@HiveType(typeId: 5)
class Category extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String icon;

  @HiveField(3)
  final String color;

  @HiveField(4)
  final CategoryType type;

  @HiveField(5)
  final String? parentId;

  @HiveField(6)
  final List<String> keywords;

  @HiveField(7)
  final DateTime createdAt;

  @HiveField(8)
  final DateTime updatedAt;

  @HiveField(9)
  final bool isDefault;

  Category({
    String? id,
    required this.name,
    required this.icon,
    required this.color,
    required this.type,
    this.parentId,
    List<String>? keywords,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.isDefault = false,
  })  : id = id ?? const Uuid().v4(),
        keywords = keywords ?? [],
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  Category copyWith({
    String? id,
    String? name,
    String? icon,
    String? color,
    CategoryType? type,
    String? parentId,
    List<String>? keywords,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDefault,
  }) {
    return Category(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      type: type ?? this.type,
      parentId: parentId ?? this.parentId,
      keywords: keywords ?? this.keywords,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'color': color,
      'type': type.name,
      'parentId': parentId,
      'keywords': keywords,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDefault': isDefault,
    };
  }

  factory Category.fromMap(Map<String, dynamic> map) {
    return Category(
      id: map['id'],
      name: map['name'],
      icon: map['icon'],
      color: map['color'],
      type: CategoryType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => CategoryType.expense,
      ),
      parentId: map['parentId'],
      keywords: List<String>.from(map['keywords'] ?? []),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      isDefault: map['isDefault'] ?? false,
    );
  }

  @override
  String toString() {
    return 'Category(id: $id, name: $name, type: $type)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Category && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

@HiveType(typeId: 6)
enum CategoryType {
  @HiveField(0)
  income,
  @HiveField(1)
  expense,
}
