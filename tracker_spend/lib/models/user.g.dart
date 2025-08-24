// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class UserAdapter extends TypeAdapter<User> {
  @override
  final int typeId = 100;

  @override
  User read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return User(
      id: fields[0] as String?,
      name: fields[1] as String,
      email: fields[2] as String,
      phone: fields[3] as String?,
      preferences: fields[4] as UserPreferences?,
      settings: fields[5] as UserSettings?,
      createdAt: fields[6] as DateTime?,
      updatedAt: fields[7] as DateTime?,
      lastLoginAt: fields[8] as DateTime?,
      metadata: (fields[9] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, User obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.email)
      ..writeByte(3)
      ..write(obj.phone)
      ..writeByte(4)
      ..write(obj.preferences)
      ..writeByte(5)
      ..write(obj.settings)
      ..writeByte(6)
      ..write(obj.createdAt)
      ..writeByte(7)
      ..write(obj.updatedAt)
      ..writeByte(8)
      ..write(obj.lastLoginAt)
      ..writeByte(9)
      ..write(obj.metadata);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class UserPreferencesAdapter extends TypeAdapter<UserPreferences> {
  @override
  final int typeId = 101;

  @override
  UserPreferences read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return UserPreferences(
      currency: fields[0] as String,
      language: fields[1] as String,
      timezone: fields[2] as String,
      notificationsEnabled: fields[3] as bool,
      darkMode: fields[4] as bool,
      favoriteCategories: (fields[5] as List?)?.cast<String>(),
      customSettings: (fields[6] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, UserPreferences obj) {
    writer
      ..writeByte(7)
      ..writeByte(0)
      ..write(obj.currency)
      ..writeByte(1)
      ..write(obj.language)
      ..writeByte(2)
      ..write(obj.timezone)
      ..writeByte(3)
      ..write(obj.notificationsEnabled)
      ..writeByte(4)
      ..write(obj.darkMode)
      ..writeByte(5)
      ..write(obj.favoriteCategories)
      ..writeByte(6)
      ..write(obj.customSettings);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserPreferencesAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class UserSettingsAdapter extends TypeAdapter<UserSettings> {
  @override
  final int typeId = 102;

  @override
  UserSettings read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return UserSettings(
      lowBalanceThreshold: fields[0] as double,
      highSpendingThreshold: fields[1] as double,
      budgetReminderDays: fields[2] as int,
      autoCategorization: fields[3] as bool,
      dataExportEnabled: fields[4] as bool,
      analyticsEnabled: fields[5] as bool,
      excludedCategories: (fields[6] as List?)?.cast<String>(),
      advancedSettings: (fields[7] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, UserSettings obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.lowBalanceThreshold)
      ..writeByte(1)
      ..write(obj.highSpendingThreshold)
      ..writeByte(2)
      ..write(obj.budgetReminderDays)
      ..writeByte(3)
      ..write(obj.autoCategorization)
      ..writeByte(4)
      ..write(obj.dataExportEnabled)
      ..writeByte(5)
      ..write(obj.analyticsEnabled)
      ..writeByte(6)
      ..write(obj.excludedCategories)
      ..writeByte(7)
      ..write(obj.advancedSettings);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserSettingsAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
