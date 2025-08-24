import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:crypto/crypto.dart';
import 'dart:convert';

part 'auth.g.dart';

@HiveType(typeId: 200)
class AuthUser extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String username;

  @HiveField(2)
  final String email;

  @HiveField(3)
  final String passwordHash;

  @HiveField(4)
  final String salt;

  @HiveField(5)
  final AuthStatus status;

  @HiveField(6)
  final UserRole role;

  @HiveField(7)
  final DateTime createdAt;

  @HiveField(8)
  final DateTime updatedAt;

  @HiveField(9)
  final DateTime? lastLoginAt;

  @HiveField(10)
  final DateTime? emailVerifiedAt;

  @HiveField(11)
  final String? verificationToken;

  @HiveField(12)
  final String? resetPasswordToken;

  @HiveField(13)
  final DateTime? resetPasswordExpiresAt;

  @HiveField(14)
  final Map<String, dynamic>? profile;

  @HiveField(15)
  final Map<String, dynamic>? metadata;

  AuthUser({
    String? id,
    required this.username,
    required this.email,
    required this.passwordHash,
    required this.salt,
    this.status = AuthStatus.pending,
    this.role = UserRole.user,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.lastLoginAt,
    this.emailVerifiedAt,
    this.verificationToken,
    this.resetPasswordToken,
    this.resetPasswordExpiresAt,
    this.profile,
    this.metadata,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  bool get isActive => status == AuthStatus.active;
  bool get isEmailVerified => emailVerifiedAt != null;
  bool get isAdmin => role == UserRole.admin;
  bool get isPremium => role == UserRole.premium;

  AuthUser copyWith({
    String? id,
    String? username,
    String? email,
    String? passwordHash,
    String? salt,
    AuthStatus? status,
    UserRole? role,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? lastLoginAt,
    DateTime? emailVerifiedAt,
    String? verificationToken,
    String? resetPasswordToken,
    DateTime? resetPasswordExpiresAt,
    Map<String, dynamic>? profile,
    Map<String, dynamic>? metadata,
  }) {
    return AuthUser(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      passwordHash: passwordHash ?? this.passwordHash,
      salt: salt ?? this.salt,
      status: status ?? this.status,
      role: role ?? this.role,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
      emailVerifiedAt: emailVerifiedAt ?? this.emailVerifiedAt,
      verificationToken: verificationToken ?? this.verificationToken,
      resetPasswordToken: resetPasswordToken ?? this.resetPasswordToken,
      resetPasswordExpiresAt: resetPasswordExpiresAt ?? this.resetPasswordExpiresAt,
      profile: profile ?? this.profile,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'passwordHash': passwordHash,
      'salt': salt,
      'status': status.name,
      'role': role.name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'lastLoginAt': lastLoginAt?.toIso8601String(),
      'emailVerifiedAt': emailVerifiedAt?.toIso8601String(),
      'verificationToken': verificationToken,
      'resetPasswordToken': resetPasswordToken,
      'resetPasswordExpiresAt': resetPasswordExpiresAt?.toIso8601String(),
      'profile': profile,
      'metadata': metadata,
    };
  }

  factory AuthUser.fromMap(Map<String, dynamic> map) {
    return AuthUser(
      id: map['id'],
      username: map['username'],
      email: map['email'],
      passwordHash: map['passwordHash'],
      salt: map['salt'],
      status: AuthStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => AuthStatus.pending,
      ),
      role: UserRole.values.firstWhere(
        (e) => e.name == map['role'],
        orElse: () => UserRole.user,
      ),
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
      lastLoginAt: map['lastLoginAt'] != null ? DateTime.parse(map['lastLoginAt']) : null,
      emailVerifiedAt: map['emailVerifiedAt'] != null ? DateTime.parse(map['emailVerifiedAt']) : null,
      verificationToken: map['verificationToken'],
      resetPasswordToken: map['resetPasswordToken'],
      resetPasswordExpiresAt: map['resetPasswordExpiresAt'] != null ? DateTime.parse(map['resetPasswordExpiresAt']) : null,
      profile: map['profile'],
      metadata: map['metadata'],
    );
  }

  @override
  String toString() {
    return 'AuthUser(id: $id, username: $username, email: $email, status: $status)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is AuthUser && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

@HiveType(typeId: 201)
enum AuthStatus {
  @HiveField(0)
  pending,
  @HiveField(1)
  active,
  @HiveField(2)
  suspended,
  @HiveField(3)
  deleted,
}

@HiveType(typeId: 202)
enum UserRole {
  @HiveField(0)
  user,
  @HiveField(1)
  premium,
  @HiveField(2)
  admin,
}

@HiveType(typeId: 203)
class UserSession extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String userId;

  @HiveField(2)
  final String token;

  @HiveField(3)
  final DateTime createdAt;

  @HiveField(4)
  final DateTime expiresAt;

  @HiveField(5)
  final String? deviceInfo;

  @HiveField(6)
  final String? ipAddress;

  @HiveField(7)
  final bool isActive;

  UserSession({
    String? id,
    required this.userId,
    required this.token,
    DateTime? createdAt,
    DateTime? expiresAt,
    this.deviceInfo,
    this.ipAddress,
    this.isActive = true,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        expiresAt = expiresAt ?? DateTime.now().add(Duration(hours: 24));

  bool get isExpired => DateTime.now().isAfter(expiresAt);

  UserSession copyWith({
    String? id,
    String? userId,
    String? token,
    DateTime? createdAt,
    DateTime? expiresAt,
    String? deviceInfo,
    String? ipAddress,
    bool? isActive,
  }) {
    return UserSession(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      token: token ?? this.token,
      createdAt: createdAt ?? this.createdAt,
      expiresAt: expiresAt ?? this.expiresAt,
      deviceInfo: deviceInfo ?? this.deviceInfo,
      ipAddress: ipAddress ?? this.ipAddress,
      isActive: isActive ?? this.isActive,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'token': token,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt.toIso8601String(),
      'deviceInfo': deviceInfo,
      'ipAddress': ipAddress,
      'isActive': isActive,
    };
  }

  factory UserSession.fromMap(Map<String, dynamic> map) {
    return UserSession(
      id: map['id'],
      userId: map['userId'],
      token: map['token'],
      createdAt: DateTime.parse(map['createdAt']),
      expiresAt: DateTime.parse(map['expiresAt']),
      deviceInfo: map['deviceInfo'],
      ipAddress: map['ipAddress'],
      isActive: map['isActive'] ?? true,
    );
  }
}

/// Utility class per la gestione delle password
class PasswordUtils {
  static String generateSalt() {
    final random = DateTime.now().millisecondsSinceEpoch.toString();
    return sha256.convert(utf8.encode(random)).toString().substring(0, 16);
  }

  static String hashPassword(String password, String salt) {
    final combined = password + salt;
    return sha256.convert(utf8.encode(combined)).toString();
  }

  static bool verifyPassword(String password, String salt, String hash) {
    final computedHash = hashPassword(password, salt);
    return computedHash == hash;
  }

  static String generateToken() {
    final random = DateTime.now().millisecondsSinceEpoch.toString() + const Uuid().v4();
    return sha256.convert(utf8.encode(random)).toString();
  }

  static bool isPasswordStrong(String password) {
    if (password.length < 8) return false;
    
    bool hasUppercase = false;
    bool hasLowercase = false;
    bool hasDigit = false;
    bool hasSpecial = false;
    
    for (int i = 0; i < password.length; i++) {
      final char = password[i];
      if (char.contains(RegExp(r'[A-Z]'))) hasUppercase = true;
      if (char.contains(RegExp(r'[a-z]'))) hasLowercase = true;
      if (char.contains(RegExp(r'[0-9]'))) hasDigit = true;
      if (char.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) hasSpecial = true;
    }
    
    return hasUppercase && hasLowercase && hasDigit && hasSpecial;
  }
}

/// Classe per la validazione dei dati di registrazione
class RegistrationData {
  final String username;
  final String email;
  final String password;
  final String confirmPassword;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final Map<String, dynamic>? additionalData;

  RegistrationData({
    required this.username,
    required this.email,
    required this.password,
    required this.confirmPassword,
    this.firstName,
    this.lastName,
    this.phone,
    this.additionalData,
  });

  bool get isValid {
    return username.isNotEmpty &&
           email.isNotEmpty &&
           password.isNotEmpty &&
           password == confirmPassword &&
           PasswordUtils.isPasswordStrong(password) &&
           _isValidEmail(email) &&
           _isValidUsername(username);
  }

  String? get validationError {
    if (username.isEmpty) return 'Username è obbligatorio';
    if (!_isValidUsername(username)) return 'Username non valido (min 3 caratteri, solo lettere, numeri e underscore)';
    if (email.isEmpty) return 'Email è obbligatoria';
    if (!_isValidEmail(email)) return 'Email non valida';
    if (password.isEmpty) return 'Password è obbligatoria';
    if (!PasswordUtils.isPasswordStrong(password)) {
      return 'Password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale';
    }
    if (password != confirmPassword) return 'Le password non coincidono';
    return null;
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(email);
  }

  bool _isValidUsername(String username) {
    return username.length >= 3 && 
           RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(username);
  }

  Map<String, dynamic> toMap() {
    return {
      'username': username,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'additionalData': additionalData,
    };
  }
}

/// Classe per i dati di login
class LoginData {
  final String identifier; // username o email
  final String password;
  final bool rememberMe;

  LoginData({
    required this.identifier,
    required this.password,
    this.rememberMe = false,
  });

  bool get isValid {
    return identifier.isNotEmpty && password.isNotEmpty;
  }

  String? get validationError {
    if (identifier.isEmpty) return 'Username o email è obbligatorio';
    if (password.isEmpty) return 'Password è obbligatoria';
    return null;
  }
}
