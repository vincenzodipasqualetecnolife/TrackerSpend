// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AuthUserAdapter extends TypeAdapter<AuthUser> {
  @override
  final int typeId = 200;

  @override
  AuthUser read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AuthUser(
      id: fields[0] as String?,
      username: fields[1] as String,
      email: fields[2] as String,
      passwordHash: fields[3] as String,
      salt: fields[4] as String,
      status: fields[5] as AuthStatus,
      role: fields[6] as UserRole,
      createdAt: fields[7] as DateTime?,
      updatedAt: fields[8] as DateTime?,
      lastLoginAt: fields[9] as DateTime?,
      emailVerifiedAt: fields[10] as DateTime?,
      verificationToken: fields[11] as String?,
      resetPasswordToken: fields[12] as String?,
      resetPasswordExpiresAt: fields[13] as DateTime?,
      profile: (fields[14] as Map?)?.cast<String, dynamic>(),
      metadata: (fields[15] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, AuthUser obj) {
    writer
      ..writeByte(16)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.username)
      ..writeByte(2)
      ..write(obj.email)
      ..writeByte(3)
      ..write(obj.passwordHash)
      ..writeByte(4)
      ..write(obj.salt)
      ..writeByte(5)
      ..write(obj.status)
      ..writeByte(6)
      ..write(obj.role)
      ..writeByte(7)
      ..write(obj.createdAt)
      ..writeByte(8)
      ..write(obj.updatedAt)
      ..writeByte(9)
      ..write(obj.lastLoginAt)
      ..writeByte(10)
      ..write(obj.emailVerifiedAt)
      ..writeByte(11)
      ..write(obj.verificationToken)
      ..writeByte(12)
      ..write(obj.resetPasswordToken)
      ..writeByte(13)
      ..write(obj.resetPasswordExpiresAt)
      ..writeByte(14)
      ..write(obj.profile)
      ..writeByte(15)
      ..write(obj.metadata);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthUserAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class UserSessionAdapter extends TypeAdapter<UserSession> {
  @override
  final int typeId = 203;

  @override
  UserSession read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return UserSession(
      id: fields[0] as String?,
      userId: fields[1] as String,
      token: fields[2] as String,
      createdAt: fields[3] as DateTime?,
      expiresAt: fields[4] as DateTime?,
      deviceInfo: fields[5] as String?,
      ipAddress: fields[6] as String?,
      isActive: fields[7] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, UserSession obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.userId)
      ..writeByte(2)
      ..write(obj.token)
      ..writeByte(3)
      ..write(obj.createdAt)
      ..writeByte(4)
      ..write(obj.expiresAt)
      ..writeByte(5)
      ..write(obj.deviceInfo)
      ..writeByte(6)
      ..write(obj.ipAddress)
      ..writeByte(7)
      ..write(obj.isActive);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserSessionAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class AuthStatusAdapter extends TypeAdapter<AuthStatus> {
  @override
  final int typeId = 201;

  @override
  AuthStatus read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return AuthStatus.pending;
      case 1:
        return AuthStatus.active;
      case 2:
        return AuthStatus.suspended;
      case 3:
        return AuthStatus.deleted;
      default:
        return AuthStatus.pending;
    }
  }

  @override
  void write(BinaryWriter writer, AuthStatus obj) {
    switch (obj) {
      case AuthStatus.pending:
        writer.writeByte(0);
        break;
      case AuthStatus.active:
        writer.writeByte(1);
        break;
      case AuthStatus.suspended:
        writer.writeByte(2);
        break;
      case AuthStatus.deleted:
        writer.writeByte(3);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthStatusAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class UserRoleAdapter extends TypeAdapter<UserRole> {
  @override
  final int typeId = 202;

  @override
  UserRole read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return UserRole.user;
      case 1:
        return UserRole.premium;
      case 2:
        return UserRole.admin;
      default:
        return UserRole.user;
    }
  }

  @override
  void write(BinaryWriter writer, UserRole obj) {
    switch (obj) {
      case UserRole.user:
        writer.writeByte(0);
        break;
      case UserRole.premium:
        writer.writeByte(1);
        break;
      case UserRole.admin:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserRoleAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
