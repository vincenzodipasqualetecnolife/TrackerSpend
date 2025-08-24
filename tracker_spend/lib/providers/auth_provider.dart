import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/auth.dart';

class AuthProvider extends ChangeNotifier {
  static const String _usersBoxName = 'auth_users';
  static const String _sessionsBoxName = 'user_sessions';
  static const String _currentUserKey = 'current_user';
  static const String _currentSessionKey = 'current_session';
  
  late Box<AuthUser> _usersBox;
  late Box<UserSession> _sessionsBox;
  late Box<String> _settingsBox;
  
  AuthUser? _currentUser;
  UserSession? _currentSession;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  // Getters
  AuthUser? get currentUser => _currentUser;
  UserSession? get currentSession => _currentSession;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isInitialized => _isInitialized;
  bool get isLoggedIn => _currentUser != null && _currentSession != null && !_currentSession!.isExpired;
  bool get isAdmin => _currentUser?.isAdmin ?? false;
  bool get isPremium => _currentUser?.isPremium ?? false;

  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      _usersBox = await Hive.openBox<AuthUser>(_usersBoxName);
      _sessionsBox = await Hive.openBox<UserSession>(_sessionsBoxName);
      _settingsBox = await Hive.openBox<String>('auth_settings');
      
      // Carica la sessione corrente se esiste
      await _loadCurrentSession();
      
      _isInitialized = true;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Errore nell\'inizializzazione dell\'autenticazione: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadCurrentSession() async {
    try {
      final sessionId = _settingsBox.get(_currentSessionKey);
      if (sessionId != null) {
        final session = _sessionsBox.get(sessionId);
        if (session != null && !session.isExpired && session.isActive) {
          final user = _usersBox.get(session.userId);
          if (user != null && user.isActive) {
            _currentSession = session;
            _currentUser = user;
          }
        }
      }
    } catch (e) {
      // Ignora errori nel caricamento della sessione
      print('Errore nel caricamento della sessione: $e');
    }
  }

  /// Registrazione di un nuovo utente
  Future<AuthResult> register(RegistrationData data) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      // Validazione
      final validationError = data.validationError;
      if (validationError != null) {
        return AuthResult(success: false, error: validationError);
      }

      // Controlla se username o email esistono già
      if (await _userExists(data.username, data.email)) {
        return AuthResult(success: false, error: 'Username o email già in uso');
      }

      // Crea il nuovo utente
      final salt = PasswordUtils.generateSalt();
      final passwordHash = PasswordUtils.hashPassword(data.password, salt);
      final verificationToken = PasswordUtils.generateToken();

      final newUser = AuthUser(
        username: data.username,
        email: data.email,
        passwordHash: passwordHash,
        salt: salt,
        status: AuthStatus.pending,
        verificationToken: verificationToken,
        profile: {
          'firstName': data.firstName,
          'lastName': data.lastName,
          'phone': data.phone,
          ...?data.additionalData,
        },
      );

      // Salva l'utente
      await _usersBox.put(newUser.id, newUser);

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        user: newUser,
        message: 'Registrazione completata. Verifica la tua email per attivare l\'account.',
      );

    } catch (e) {
      _error = 'Errore durante la registrazione: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Login dell'utente
  Future<AuthResult> login(LoginData data) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      // Validazione
      final validationError = data.validationError;
      if (validationError != null) {
        return AuthResult(success: false, error: validationError);
      }

      // Trova l'utente per username o email
      AuthUser? user;
      for (final authUser in _usersBox.values) {
        if (authUser.username.toLowerCase() == data.identifier.toLowerCase() ||
            authUser.email.toLowerCase() == data.identifier.toLowerCase()) {
          user = authUser;
          break;
        }
      }

      if (user == null) {
        return AuthResult(success: false, error: 'Utente non trovato');
      }

      if (!user.isActive) {
        return AuthResult(success: false, error: 'Account non attivo. Verifica la tua email.');
      }

      // Verifica password
      if (!PasswordUtils.verifyPassword(data.password, user.salt, user.passwordHash)) {
        return AuthResult(success: false, error: 'Password non corretta');
      }

      // Crea una nuova sessione
      final session = UserSession(
        userId: user.id,
        token: PasswordUtils.generateToken(),
        expiresAt: data.rememberMe 
            ? DateTime.now().add(Duration(days: 30))
            : DateTime.now().add(Duration(hours: 24)),
      );

      // Salva la sessione
      await _sessionsBox.put(session.id, session);

      // Aggiorna lastLoginAt dell'utente
      final updatedUser = user.copyWith(
        lastLoginAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      await _usersBox.put(user.id, updatedUser);

      // Imposta la sessione corrente
      _currentUser = updatedUser;
      _currentSession = session;
      await _settingsBox.put(_currentSessionKey, session.id);

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        user: updatedUser,
        session: session,
        message: 'Login effettuato con successo',
      );

    } catch (e) {
      _error = 'Errore durante il login: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Logout dell'utente
  Future<void> logout() async {
    try {
      if (_currentSession != null) {
        // Disattiva la sessione corrente
        final updatedSession = _currentSession!.copyWith(isActive: false);
        await _sessionsBox.put(_currentSession!.id, updatedSession);
      }

      // Rimuovi la sessione corrente
      await _settingsBox.delete(_currentSessionKey);
      
      _currentUser = null;
      _currentSession = null;
      
      notifyListeners();
    } catch (e) {
      _error = 'Errore durante il logout: $e';
      notifyListeners();
    }
  }

  /// Verifica email
  Future<AuthResult> verifyEmail(String token) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      AuthUser? userToVerify;
      for (final user in _usersBox.values) {
        if (user.verificationToken == token) {
          userToVerify = user;
          break;
        }
      }

      if (userToVerify == null) {
        return AuthResult(success: false, error: 'Token di verifica non valido');
      }

      final updatedUser = userToVerify.copyWith(
        status: AuthStatus.active,
        emailVerifiedAt: DateTime.now(),
        verificationToken: null,
        updatedAt: DateTime.now(),
      );

      await _usersBox.put(userToVerify.id, updatedUser);

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        user: updatedUser,
        message: 'Email verificata con successo',
      );

    } catch (e) {
      _error = 'Errore durante la verifica email: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Reset password
  Future<AuthResult> requestPasswordReset(String email) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      AuthUser? user;
      for (final authUser in _usersBox.values) {
        if (authUser.email.toLowerCase() == email.toLowerCase()) {
          user = authUser;
          break;
        }
      }

      if (user == null) {
        return AuthResult(success: false, error: 'Email non trovata');
      }

      final resetToken = PasswordUtils.generateToken();
      final updatedUser = user.copyWith(
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: DateTime.now().add(Duration(hours: 1)),
        updatedAt: DateTime.now(),
      );

      await _usersBox.put(user.id, updatedUser);

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        message: 'Email di reset password inviata',
      );

    } catch (e) {
      _error = 'Errore durante la richiesta di reset password: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Cambia password
  Future<AuthResult> resetPassword(String token, String newPassword) async {
    try {
      _error = null;
      _isLoading = true;
      notifyListeners();

      if (!PasswordUtils.isPasswordStrong(newPassword)) {
        return AuthResult(
          success: false, 
          error: 'Password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale'
        );
      }

      AuthUser? userToUpdate;
      for (final user in _usersBox.values) {
        if (user.resetPasswordToken == token && 
            user.resetPasswordExpiresAt != null &&
            user.resetPasswordExpiresAt!.isAfter(DateTime.now())) {
          userToUpdate = user;
          break;
        }
      }

      if (userToUpdate == null) {
        return AuthResult(success: false, error: 'Token di reset non valido o scaduto');
      }

      final newSalt = PasswordUtils.generateSalt();
      final newPasswordHash = PasswordUtils.hashPassword(newPassword, newSalt);

      final updatedUser = userToUpdate.copyWith(
        passwordHash: newPasswordHash,
        salt: newSalt,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        updatedAt: DateTime.now(),
      );

      await _usersBox.put(userToUpdate.id, updatedUser);

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        user: updatedUser,
        message: 'Password cambiata con successo',
      );

    } catch (e) {
      _error = 'Errore durante il cambio password: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Aggiorna profilo utente
  Future<AuthResult> updateProfile(Map<String, dynamic> profileData) async {
    try {
      if (_currentUser == null) {
        return AuthResult(success: false, error: 'Utente non autenticato');
      }

      _error = null;
      _isLoading = true;
      notifyListeners();

      final updatedUser = _currentUser!.copyWith(
        profile: {...?_currentUser!.profile, ...profileData},
        updatedAt: DateTime.now(),
      );

      await _usersBox.put(_currentUser!.id, updatedUser);
      _currentUser = updatedUser;

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        user: updatedUser,
        message: 'Profilo aggiornato con successo',
      );

    } catch (e) {
      _error = 'Errore durante l\'aggiornamento del profilo: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Cambia password dell'utente corrente
  Future<AuthResult> changePassword(String currentPassword, String newPassword) async {
    try {
      if (_currentUser == null) {
        return AuthResult(success: false, error: 'Utente non autenticato');
      }

      _error = null;
      _isLoading = true;
      notifyListeners();

      // Verifica password corrente
      if (!PasswordUtils.verifyPassword(currentPassword, _currentUser!.salt, _currentUser!.passwordHash)) {
        return AuthResult(success: false, error: 'Password corrente non corretta');
      }

      if (!PasswordUtils.isPasswordStrong(newPassword)) {
        return AuthResult(
          success: false, 
          error: 'Nuova password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale'
        );
      }

      final newSalt = PasswordUtils.generateSalt();
      final newPasswordHash = PasswordUtils.hashPassword(newPassword, newSalt);

      final updatedUser = _currentUser!.copyWith(
        passwordHash: newPasswordHash,
        salt: newSalt,
        updatedAt: DateTime.now(),
      );

      await _usersBox.put(_currentUser!.id, updatedUser);
      _currentUser = updatedUser;

      _isLoading = false;
      notifyListeners();

      return AuthResult(
        success: true,
        user: updatedUser,
        message: 'Password cambiata con successo',
      );

    } catch (e) {
      _error = 'Errore durante il cambio password: $e';
      _isLoading = false;
      notifyListeners();
      return AuthResult(success: false, error: _error);
    }
  }

  /// Controlla se un utente esiste
  Future<bool> _userExists(String username, String email) async {
    for (final user in _usersBox.values) {
      if (user.username.toLowerCase() == username.toLowerCase() ||
          user.email.toLowerCase() == email.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /// Ottieni tutti gli utenti (solo per admin)
  List<AuthUser> getAllUsers() {
    if (!isAdmin) return [];
    return _usersBox.values.toList();
  }

  /// Elimina un utente (solo per admin)
  Future<AuthResult> deleteUser(String userId) async {
    try {
      if (!isAdmin) {
        return AuthResult(success: false, error: 'Accesso negato');
      }

      final user = _usersBox.get(userId);
      if (user == null) {
        return AuthResult(success: false, error: 'Utente non trovato');
      }

      // Elimina tutte le sessioni dell'utente
      for (final session in _sessionsBox.values) {
        if (session.userId == userId) {
          await _sessionsBox.delete(session.id);
        }
      }

      // Marca l'utente come eliminato
      final deletedUser = user.copyWith(
        status: AuthStatus.deleted,
        updatedAt: DateTime.now(),
      );
      await _usersBox.put(userId, deletedUser);

      return AuthResult(
        success: true,
        message: 'Utente eliminato con successo',
      );

    } catch (e) {
      return AuthResult(success: false, error: 'Errore durante l\'eliminazione: $e');
    }
  }

  /// Pulisci le sessioni scadute
  Future<void> _cleanupExpiredSessions() async {
    try {
      final expiredSessions = _sessionsBox.values
          .where((session) => session.isExpired || !session.isActive)
          .toList();

      for (final session in expiredSessions) {
        await _sessionsBox.delete(session.id);
      }
    } catch (e) {
      print('Errore durante la pulizia delle sessioni: $e');
    }
  }

  @override
  void dispose() {
    _cleanupExpiredSessions();
    _usersBox.close();
    _sessionsBox.close();
    _settingsBox.close();
    super.dispose();
  }
}

/// Risultato delle operazioni di autenticazione
class AuthResult {
  final bool success;
  final String? error;
  final String? message;
  final AuthUser? user;
  final UserSession? session;

  AuthResult({
    required this.success,
    this.error,
    this.message,
    this.user,
    this.session,
  });
}
