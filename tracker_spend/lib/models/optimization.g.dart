// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'optimization.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class OptimizationSuggestionAdapter
    extends TypeAdapter<OptimizationSuggestion> {
  @override
  final int typeId = 50;

  @override
  OptimizationSuggestion read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return OptimizationSuggestion(
      id: fields[0] as String?,
      title: fields[1] as String,
      description: fields[2] as String,
      potentialSavings: fields[3] as double,
      difficulty: fields[4] as SuggestionDifficulty,
      category: fields[5] as String,
      implemented: fields[6] as bool,
      implementedAt: fields[7] as DateTime?,
      createdAt: fields[8] as DateTime?,
      metadata: (fields[9] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, OptimizationSuggestion obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.title)
      ..writeByte(2)
      ..write(obj.description)
      ..writeByte(3)
      ..write(obj.potentialSavings)
      ..writeByte(4)
      ..write(obj.difficulty)
      ..writeByte(5)
      ..write(obj.category)
      ..writeByte(6)
      ..write(obj.implemented)
      ..writeByte(7)
      ..write(obj.implementedAt)
      ..writeByte(8)
      ..write(obj.createdAt)
      ..writeByte(9)
      ..write(obj.metadata);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OptimizationSuggestionAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class IntegrationAdapter extends TypeAdapter<Integration> {
  @override
  final int typeId = 52;

  @override
  Integration read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Integration(
      id: fields[0] as String?,
      name: fields[1] as String,
      type: fields[2] as IntegrationType,
      status: fields[3] as IntegrationStatus,
      lastSync: fields[4] as DateTime?,
      icon: fields[5] as String,
      config: (fields[6] as Map?)?.cast<String, dynamic>(),
      createdAt: fields[7] as DateTime?,
      updatedAt: fields[8] as DateTime?,
      metadata: (fields[9] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, Integration obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.type)
      ..writeByte(3)
      ..write(obj.status)
      ..writeByte(4)
      ..write(obj.lastSync)
      ..writeByte(5)
      ..write(obj.icon)
      ..writeByte(6)
      ..write(obj.config)
      ..writeByte(7)
      ..write(obj.createdAt)
      ..writeByte(8)
      ..write(obj.updatedAt)
      ..writeByte(9)
      ..write(obj.metadata);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is IntegrationAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class SpendingTrendAdapter extends TypeAdapter<SpendingTrend> {
  @override
  final int typeId = 55;

  @override
  SpendingTrend read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SpendingTrend(
      id: fields[0] as String?,
      month: fields[1] as String,
      spending: fields[2] as double,
      budget: fields[3] as double,
      savings: fields[4] as double,
      date: fields[5] as DateTime?,
      categoryBreakdown: (fields[6] as Map?)?.cast<String, dynamic>(),
      createdAt: fields[7] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, SpendingTrend obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.month)
      ..writeByte(2)
      ..write(obj.spending)
      ..writeByte(3)
      ..write(obj.budget)
      ..writeByte(4)
      ..write(obj.savings)
      ..writeByte(5)
      ..write(obj.date)
      ..writeByte(6)
      ..write(obj.categoryBreakdown)
      ..writeByte(7)
      ..write(obj.createdAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SpendingTrendAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class CategoryAnalysisAdapter extends TypeAdapter<CategoryAnalysis> {
  @override
  final int typeId = 56;

  @override
  CategoryAnalysis read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CategoryAnalysis(
      id: fields[0] as String?,
      category: fields[1] as String,
      amount: fields[2] as double,
      percentage: fields[3] as double,
      trend: fields[4] as CategoryTrend,
      suggestion: fields[5] as String,
      analyzedAt: fields[6] as DateTime?,
      data: (fields[7] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, CategoryAnalysis obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.category)
      ..writeByte(2)
      ..write(obj.amount)
      ..writeByte(3)
      ..write(obj.percentage)
      ..writeByte(4)
      ..write(obj.trend)
      ..writeByte(5)
      ..write(obj.suggestion)
      ..writeByte(6)
      ..write(obj.analyzedAt)
      ..writeByte(7)
      ..write(obj.data);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CategoryAnalysisAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class SuggestionDifficultyAdapter extends TypeAdapter<SuggestionDifficulty> {
  @override
  final int typeId = 51;

  @override
  SuggestionDifficulty read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return SuggestionDifficulty.easy;
      case 1:
        return SuggestionDifficulty.medium;
      case 2:
        return SuggestionDifficulty.hard;
      default:
        return SuggestionDifficulty.easy;
    }
  }

  @override
  void write(BinaryWriter writer, SuggestionDifficulty obj) {
    switch (obj) {
      case SuggestionDifficulty.easy:
        writer.writeByte(0);
        break;
      case SuggestionDifficulty.medium:
        writer.writeByte(1);
        break;
      case SuggestionDifficulty.hard:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SuggestionDifficultyAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class IntegrationTypeAdapter extends TypeAdapter<IntegrationType> {
  @override
  final int typeId = 53;

  @override
  IntegrationType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return IntegrationType.excel;
      case 1:
        return IntegrationType.sheets;
      case 2:
        return IntegrationType.banking;
      case 3:
        return IntegrationType.investment;
      default:
        return IntegrationType.excel;
    }
  }

  @override
  void write(BinaryWriter writer, IntegrationType obj) {
    switch (obj) {
      case IntegrationType.excel:
        writer.writeByte(0);
        break;
      case IntegrationType.sheets:
        writer.writeByte(1);
        break;
      case IntegrationType.banking:
        writer.writeByte(2);
        break;
      case IntegrationType.investment:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is IntegrationTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class IntegrationStatusAdapter extends TypeAdapter<IntegrationStatus> {
  @override
  final int typeId = 54;

  @override
  IntegrationStatus read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return IntegrationStatus.connected;
      case 1:
        return IntegrationStatus.disconnected;
      case 2:
        return IntegrationStatus.error;
      default:
        return IntegrationStatus.connected;
    }
  }

  @override
  void write(BinaryWriter writer, IntegrationStatus obj) {
    switch (obj) {
      case IntegrationStatus.connected:
        writer.writeByte(0);
        break;
      case IntegrationStatus.disconnected:
        writer.writeByte(1);
        break;
      case IntegrationStatus.error:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is IntegrationStatusAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class CategoryTrendAdapter extends TypeAdapter<CategoryTrend> {
  @override
  final int typeId = 57;

  @override
  CategoryTrend read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return CategoryTrend.up;
      case 1:
        return CategoryTrend.down;
      case 2:
        return CategoryTrend.stable;
      default:
        return CategoryTrend.up;
    }
  }

  @override
  void write(BinaryWriter writer, CategoryTrend obj) {
    switch (obj) {
      case CategoryTrend.up:
        writer.writeByte(0);
        break;
      case CategoryTrend.down:
        writer.writeByte(1);
        break;
      case CategoryTrend.stable:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CategoryTrendAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
