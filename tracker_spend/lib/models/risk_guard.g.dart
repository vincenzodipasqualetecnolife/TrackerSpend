// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'risk_guard.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AlertAdapter extends TypeAdapter<Alert> {
  @override
  final int typeId = 30;

  @override
  Alert read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Alert(
      id: fields[0] as String?,
      type: fields[1] as AlertType,
      title: fields[2] as String,
      message: fields[3] as String,
      severity: fields[4] as AlertSeverity,
      createdAt: fields[5] as DateTime?,
      read: fields[6] as bool,
      actionRequired: fields[7] as bool,
      metadata: (fields[8] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, Alert obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.type)
      ..writeByte(2)
      ..write(obj.title)
      ..writeByte(3)
      ..write(obj.message)
      ..writeByte(4)
      ..write(obj.severity)
      ..writeByte(5)
      ..write(obj.createdAt)
      ..writeByte(6)
      ..write(obj.read)
      ..writeByte(7)
      ..write(obj.actionRequired)
      ..writeByte(8)
      ..write(obj.metadata);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AlertAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class EmergencyFundAdapter extends TypeAdapter<EmergencyFund> {
  @override
  final int typeId = 33;

  @override
  EmergencyFund read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return EmergencyFund(
      id: fields[0] as String?,
      name: fields[1] as String,
      targetAmount: fields[2] as double,
      currentAmount: fields[3] as double,
      monthlyContribution: fields[4] as double,
      status: fields[5] as EmergencyFundStatus,
      priority: fields[6] as EmergencyFundPriority,
      createdAt: fields[7] as DateTime?,
      updatedAt: fields[8] as DateTime?,
      metadata: (fields[9] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, EmergencyFund obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.targetAmount)
      ..writeByte(3)
      ..write(obj.currentAmount)
      ..writeByte(4)
      ..write(obj.monthlyContribution)
      ..writeByte(5)
      ..write(obj.status)
      ..writeByte(6)
      ..write(obj.priority)
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
      other is EmergencyFundAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class RiskAssessmentAdapter extends TypeAdapter<RiskAssessment> {
  @override
  final int typeId = 36;

  @override
  RiskAssessment read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return RiskAssessment(
      id: fields[0] as String?,
      category: fields[1] as String,
      riskLevel: fields[2] as RiskLevel,
      score: fields[3] as int,
      description: fields[4] as String,
      recommendations: (fields[5] as List).cast<String>(),
      assessedAt: fields[6] as DateTime?,
      data: (fields[7] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, RiskAssessment obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.category)
      ..writeByte(2)
      ..write(obj.riskLevel)
      ..writeByte(3)
      ..write(obj.score)
      ..writeByte(4)
      ..write(obj.description)
      ..writeByte(5)
      ..write(obj.recommendations)
      ..writeByte(6)
      ..write(obj.assessedAt)
      ..writeByte(7)
      ..write(obj.data);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is RiskAssessmentAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class InsuranceAdapter extends TypeAdapter<Insurance> {
  @override
  final int typeId = 38;

  @override
  Insurance read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return Insurance(
      id: fields[0] as String?,
      type: fields[1] as InsuranceType,
      provider: fields[2] as String,
      monthlyPremium: fields[3] as double,
      coverage: fields[4] as double,
      expiryDate: fields[5] as DateTime,
      status: fields[6] as InsuranceStatus,
      createdAt: fields[7] as DateTime?,
      metadata: (fields[8] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, Insurance obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.type)
      ..writeByte(2)
      ..write(obj.provider)
      ..writeByte(3)
      ..write(obj.monthlyPremium)
      ..writeByte(4)
      ..write(obj.coverage)
      ..writeByte(5)
      ..write(obj.expiryDate)
      ..writeByte(6)
      ..write(obj.status)
      ..writeByte(7)
      ..write(obj.createdAt)
      ..writeByte(8)
      ..write(obj.metadata);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is InsuranceAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class AlertTypeAdapter extends TypeAdapter<AlertType> {
  @override
  final int typeId = 31;

  @override
  AlertType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return AlertType.low_balance;
      case 1:
        return AlertType.high_spending;
      case 2:
        return AlertType.budget_exceeded;
      case 3:
        return AlertType.unusual_transaction;
      case 4:
        return AlertType.general;
      default:
        return AlertType.low_balance;
    }
  }

  @override
  void write(BinaryWriter writer, AlertType obj) {
    switch (obj) {
      case AlertType.low_balance:
        writer.writeByte(0);
        break;
      case AlertType.high_spending:
        writer.writeByte(1);
        break;
      case AlertType.budget_exceeded:
        writer.writeByte(2);
        break;
      case AlertType.unusual_transaction:
        writer.writeByte(3);
        break;
      case AlertType.general:
        writer.writeByte(4);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AlertTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class AlertSeverityAdapter extends TypeAdapter<AlertSeverity> {
  @override
  final int typeId = 32;

  @override
  AlertSeverity read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return AlertSeverity.low;
      case 1:
        return AlertSeverity.medium;
      case 2:
        return AlertSeverity.high;
      case 3:
        return AlertSeverity.critical;
      default:
        return AlertSeverity.low;
    }
  }

  @override
  void write(BinaryWriter writer, AlertSeverity obj) {
    switch (obj) {
      case AlertSeverity.low:
        writer.writeByte(0);
        break;
      case AlertSeverity.medium:
        writer.writeByte(1);
        break;
      case AlertSeverity.high:
        writer.writeByte(2);
        break;
      case AlertSeverity.critical:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AlertSeverityAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class EmergencyFundStatusAdapter extends TypeAdapter<EmergencyFundStatus> {
  @override
  final int typeId = 34;

  @override
  EmergencyFundStatus read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return EmergencyFundStatus.active;
      case 1:
        return EmergencyFundStatus.paused;
      case 2:
        return EmergencyFundStatus.completed;
      default:
        return EmergencyFundStatus.active;
    }
  }

  @override
  void write(BinaryWriter writer, EmergencyFundStatus obj) {
    switch (obj) {
      case EmergencyFundStatus.active:
        writer.writeByte(0);
        break;
      case EmergencyFundStatus.paused:
        writer.writeByte(1);
        break;
      case EmergencyFundStatus.completed:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EmergencyFundStatusAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class EmergencyFundPriorityAdapter extends TypeAdapter<EmergencyFundPriority> {
  @override
  final int typeId = 35;

  @override
  EmergencyFundPriority read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return EmergencyFundPriority.low;
      case 1:
        return EmergencyFundPriority.medium;
      case 2:
        return EmergencyFundPriority.high;
      default:
        return EmergencyFundPriority.low;
    }
  }

  @override
  void write(BinaryWriter writer, EmergencyFundPriority obj) {
    switch (obj) {
      case EmergencyFundPriority.low:
        writer.writeByte(0);
        break;
      case EmergencyFundPriority.medium:
        writer.writeByte(1);
        break;
      case EmergencyFundPriority.high:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is EmergencyFundPriorityAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class RiskLevelAdapter extends TypeAdapter<RiskLevel> {
  @override
  final int typeId = 37;

  @override
  RiskLevel read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return RiskLevel.low;
      case 1:
        return RiskLevel.medium;
      case 2:
        return RiskLevel.high;
      default:
        return RiskLevel.low;
    }
  }

  @override
  void write(BinaryWriter writer, RiskLevel obj) {
    switch (obj) {
      case RiskLevel.low:
        writer.writeByte(0);
        break;
      case RiskLevel.medium:
        writer.writeByte(1);
        break;
      case RiskLevel.high:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is RiskLevelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class InsuranceTypeAdapter extends TypeAdapter<InsuranceType> {
  @override
  final int typeId = 39;

  @override
  InsuranceType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return InsuranceType.health;
      case 1:
        return InsuranceType.auto;
      case 2:
        return InsuranceType.home;
      case 3:
        return InsuranceType.life;
      case 4:
        return InsuranceType.disability;
      default:
        return InsuranceType.health;
    }
  }

  @override
  void write(BinaryWriter writer, InsuranceType obj) {
    switch (obj) {
      case InsuranceType.health:
        writer.writeByte(0);
        break;
      case InsuranceType.auto:
        writer.writeByte(1);
        break;
      case InsuranceType.home:
        writer.writeByte(2);
        break;
      case InsuranceType.life:
        writer.writeByte(3);
        break;
      case InsuranceType.disability:
        writer.writeByte(4);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is InsuranceTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class InsuranceStatusAdapter extends TypeAdapter<InsuranceStatus> {
  @override
  final int typeId = 40;

  @override
  InsuranceStatus read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return InsuranceStatus.active;
      case 1:
        return InsuranceStatus.expired;
      case 2:
        return InsuranceStatus.pending;
      default:
        return InsuranceStatus.active;
    }
  }

  @override
  void write(BinaryWriter writer, InsuranceStatus obj) {
    switch (obj) {
      case InsuranceStatus.active:
        writer.writeByte(0);
        break;
      case InsuranceStatus.expired:
        writer.writeByte(1);
        break;
      case InsuranceStatus.pending:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is InsuranceStatusAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
