import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

part 'user.g.dart';

@HiveType(typeId: 100)
class User extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String email;

  @HiveField(3)
  final String? phone;

  @HiveField(4)
  final UserPreferences preferences;

  @HiveField(5)
  final UserSettings settings;

  @HiveField(6)
  final DateTime createdAt;

  @HiveField(7)
  final DateTime updatedAt;

  @HiveField(8)
  final DateTime? lastLoginAt;

  @HiveField(9)
  final Map<String, dynamic>? metadata;

  User({
    String? id,
    required this.name,
    required this.email,
    this.phone,
    UserPreferences? preferences,
    UserSettings? settings,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.lastLoginAt,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        preferences = preferences ?? UserPreferences(),
        settings = settings ?? UserSettings(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    UserPreferences? preferences,
    UserSettings? settings,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastLoginAt,
    Map<String, dynamic>? metadata,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      preferences: preferences ?? this.preferences,
      settings: settings ?? this.settings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'preferences': preferences.toMap(),
      'settings': settings.toMap(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
      'metadata': metadata,
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'],
      name: map['name'],
      email: map['email'],
      phone: map['phone'],
      preferences: UserPreferences.fromMap(map['preferences'] ?? {}),
      settings: UserSettings.fromMap(map['settings'] ?? {}),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      lastLoginAt: map['lastLoginAt'] != null ? DateTime.parse(map['lastLoginAt']) : null,
      metadata: map['metadata'],
    );
  }

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

@HiveType(typeId: 101)
class UserPreferences extends HiveObject {
  @HiveField(0)
  final String currency;

  @HiveField(1)
  final String language;

  @HiveField(2)
  final String timezone;

  @HiveField(3)
  final bool notificationsEnabled;

  @HiveField(4)
  final bool darkMode;

  @HiveField(5)
  final List<String> favoriteCategories;

  @HiveField(6)
  final Map<String, dynamic>? customSettings;

  UserPreferences({
    this.currency = 'EUR',
    this.language = 'it',
    this.timezone = 'Europe/Rome',
    this.notificationsEnabled = true,
    this.darkMode = true,
    List<String>? favoriteCategories,
    this.customSettings,
  }) : favoriteCategories = favoriteCategories ?? [];

  UserPreferences copyWith({
    String? currency,
    String? language,
    String? timezone,
    bool? notificationsEnabled,
    bool? darkMode,
    List<String>? favoriteCategories,
    Map<String, dynamic>? customSettings,
  }) {
    return UserPreferences(
      currency: currency ?? this.currency,
      language: language ?? this.language,
      timezone: timezone ?? this.timezone,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      darkMode: darkMode ?? this.darkMode,
      favoriteCategories: favoriteCategories ?? this.favoriteCategories,
      customSettings: customSettings ?? this.customSettings,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'currency': currency,
      'language': language,
      'timezone': timezone,
      'notificationsEnabled': notificationsEnabled,
      'darkMode': darkMode,
      'favoriteCategories': favoriteCategories,
      'customSettings': customSettings,
    };
  }

  factory UserPreferences.fromMap(Map<String, dynamic> map) {
    return UserPreferences(
      currency: map['currency'] ?? 'EUR',
      language: map['language'] ?? 'it',
      timezone: map['timezone'] ?? 'Europe/Rome',
      notificationsEnabled: map['notificationsEnabled'] ?? true,
      darkMode: map['darkMode'] ?? true,
      favoriteCategories: List<String>.from(map['favoriteCategories'] ?? []),
      customSettings: map['customSettings'],
    );
  }
}

@HiveType(typeId: 102)
class UserSettings extends HiveObject {
  @HiveField(0)
  final double lowBalanceThreshold;

  @HiveField(1)
  final double highSpendingThreshold;

  @HiveField(2)
  final int budgetReminderDays;

  @HiveField(3)
  final bool autoCategorization;

  @HiveField(4)
  final bool dataExportEnabled;

  @HiveField(5)
  final bool analyticsEnabled;

  @HiveField(6)
  final List<String> excludedCategories;

  @HiveField(7)
  final Map<String, dynamic>? advancedSettings;

  UserSettings({
    this.lowBalanceThreshold = 500.0,
    this.highSpendingThreshold = 1000.0,
    this.budgetReminderDays = 7,
    this.autoCategorization = true,
    this.dataExportEnabled = true,
    this.analyticsEnabled = true,
    List<String>? excludedCategories,
    this.advancedSettings,
  }) : excludedCategories = excludedCategories ?? [];

  UserSettings copyWith({
    double? lowBalanceThreshold,
    double? highSpendingThreshold,
    int? budgetReminderDays,
    bool? autoCategorization,
    bool? dataExportEnabled,
    bool? analyticsEnabled,
    List<String>? excludedCategories,
    Map<String, dynamic>? advancedSettings,
  }) {
    return UserSettings(
      lowBalanceThreshold: lowBalanceThreshold ?? this.lowBalanceThreshold,
      highSpendingThreshold: highSpendingThreshold ?? this.highSpendingThreshold,
      budgetReminderDays: budgetReminderDays ?? this.budgetReminderDays,
      autoCategorization: autoCategorization ?? this.autoCategorization,
      dataExportEnabled: dataExportEnabled ?? this.dataExportEnabled,
      analyticsEnabled: analyticsEnabled ?? this.analyticsEnabled,
      excludedCategories: excludedCategories ?? this.excludedCategories,
      advancedSettings: advancedSettings ?? this.advancedSettings,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'lowBalanceThreshold': lowBalanceThreshold,
      'highSpendingThreshold': highSpendingThreshold,
      'budgetReminderDays': budgetReminderDays,
      'autoCategorization': autoCategorization,
      'dataExportEnabled': dataExportEnabled,
      'analyticsEnabled': analyticsEnabled,
      'excludedCategories': excludedCategories,
      'advancedSettings': advancedSettings,
    };
  }

  factory UserSettings.fromMap(Map<String, dynamic> map) {
    return UserSettings(
      lowBalanceThreshold: map['lowBalanceThreshold']?.toDouble() ?? 500.0,
      highSpendingThreshold: map['highSpendingThreshold']?.toDouble() ?? 1000.0,
      budgetReminderDays: map['budgetReminderDays'] ?? 7,
      autoCategorization: map['autoCategorization'] ?? true,
      dataExportEnabled: map['dataExportEnabled'] ?? true,
      analyticsEnabled: map['analyticsEnabled'] ?? true,
      excludedCategories: List<String>.from(map['excludedCategories'] ?? []),
      advancedSettings: map['advancedSettings'],
    );
  }
}
