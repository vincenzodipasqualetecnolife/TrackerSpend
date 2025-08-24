// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'education.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class TipAdapter extends TypeAdapter<Tip> {
  @override
  final int typeId = 20;

  @override
  Tip read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Tip(
      id: fields[0] as String?,
      title: fields[1] as String,
      content: fields[2] as String,
      category: fields[3] as TipCategory,
      difficulty: fields[4] as TipDifficulty,
      read: fields[5] as bool,
      createdAt: fields[6] as DateTime?,
      readAt: fields[7] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, Tip obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.title)
      ..writeByte(2)
      ..write(obj.content)
      ..writeByte(3)
      ..write(obj.category)
      ..writeByte(4)
      ..write(obj.difficulty)
      ..writeByte(5)
      ..write(obj.read)
      ..writeByte(6)
      ..write(obj.createdAt)
      ..writeByte(7)
      ..write(obj.readAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TipAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class BadgeAdapter extends TypeAdapter<Badge> {
  @override
  final int typeId = 23;

  @override
  Badge read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Badge(
      id: fields[0] as String?,
      name: fields[1] as String,
      description: fields[2] as String,
      icon: fields[3] as String,
      category: fields[4] as BadgeCategory,
      unlocked: fields[5] as bool,
      unlockedAt: fields[6] as DateTime?,
      progress: fields[7] as int,
      maxProgress: fields[8] as int,
      createdAt: fields[9] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, Badge obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.description)
      ..writeByte(3)
      ..write(obj.icon)
      ..writeByte(4)
      ..write(obj.category)
      ..writeByte(5)
      ..write(obj.unlocked)
      ..writeByte(6)
      ..write(obj.unlockedAt)
      ..writeByte(7)
      ..write(obj.progress)
      ..writeByte(8)
      ..write(obj.maxProgress)
      ..writeByte(9)
      ..write(obj.createdAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BadgeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ReportAdapter extends TypeAdapter<Report> {
  @override
  final int typeId = 25;

  @override
  Report read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Report(
      id: fields[0] as String?,
      title: fields[1] as String,
      period: fields[2] as String,
      summary: fields[3] as String,
      insights: (fields[4] as List).cast<String>(),
      recommendations: (fields[5] as List).cast<String>(),
      generatedAt: fields[6] as DateTime?,
      data: (fields[7] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, Report obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.title)
      ..writeByte(2)
      ..write(obj.period)
      ..writeByte(3)
      ..write(obj.summary)
      ..writeByte(4)
      ..write(obj.insights)
      ..writeByte(5)
      ..write(obj.recommendations)
      ..writeByte(6)
      ..write(obj.generatedAt)
      ..writeByte(7)
      ..write(obj.data);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ReportAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class TipCategoryAdapter extends TypeAdapter<TipCategory> {
  @override
  final int typeId = 21;

  @override
  TipCategory read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return TipCategory.savings;
      case 1:
        return TipCategory.budget;
      case 2:
        return TipCategory.investment;
      case 3:
        return TipCategory.general;
      default:
        return TipCategory.savings;
    }
  }

  @override
  void write(BinaryWriter writer, TipCategory obj) {
    switch (obj) {
      case TipCategory.savings:
        writer.writeByte(0);
        break;
      case TipCategory.budget:
        writer.writeByte(1);
        break;
      case TipCategory.investment:
        writer.writeByte(2);
        break;
      case TipCategory.general:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TipCategoryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class TipDifficultyAdapter extends TypeAdapter<TipDifficulty> {
  @override
  final int typeId = 22;

  @override
  TipDifficulty read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return TipDifficulty.beginner;
      case 1:
        return TipDifficulty.intermediate;
      case 2:
        return TipDifficulty.advanced;
      default:
        return TipDifficulty.beginner;
    }
  }

  @override
  void write(BinaryWriter writer, TipDifficulty obj) {
    switch (obj) {
      case TipDifficulty.beginner:
        writer.writeByte(0);
        break;
      case TipDifficulty.intermediate:
        writer.writeByte(1);
        break;
      case TipDifficulty.advanced:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TipDifficultyAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class BadgeCategoryAdapter extends TypeAdapter<BadgeCategory> {
  @override
  final int typeId = 24;

  @override
  BadgeCategory read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return BadgeCategory.savings;
      case 1:
        return BadgeCategory.budget;
      case 2:
        return BadgeCategory.consistency;
      case 3:
        return BadgeCategory.achievement;
      default:
        return BadgeCategory.savings;
    }
  }

  @override
  void write(BinaryWriter writer, BadgeCategory obj) {
    switch (obj) {
      case BadgeCategory.savings:
        writer.writeByte(0);
        break;
      case BadgeCategory.budget:
        writer.writeByte(1);
        break;
      case BadgeCategory.consistency:
        writer.writeByte(2);
        break;
      case BadgeCategory.achievement:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BadgeCategoryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
