import 'dart:io';
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:shelf_router/shelf_router.dart';
import 'package:mysql1/mysql1.dart';

class SimpleApiServer {
  static HttpServer? _server;
  static const int _port = 3001;
  static MySqlConnection? _mysqlConnection;

  /// Initialize MySQL connection
  static Future<void> _initializeMySQL() async {
    try {
      final settings = ConnectionSettings(
        host: 'mysql',
        port: 3306,
        user: 'tracker_user',
        password: 'tracker_password',
        db: 'tracker_spend',
      );

      _mysqlConnection = await MySqlConnection.connect(settings);
      print('MySQL connection established');
    } catch (e) {
      print('Error connecting to MySQL: $e');
      rethrow;
    }
  }

  /// Starts the API server
  static Future<void> start() async {
    if (_server != null) {
      print('API Server already running on port $_port');
      return;
    }

    try {
      // Initialize MySQL connection
      await _initializeMySQL();

      final router = Router();

      // CORS headers
      final defaultCorsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
      };

      // Middleware for CORS and routing
      final handler = const Pipeline()
          .addMiddleware(corsHeaders(headers: defaultCorsHeaders))
          .addHandler(router);

      // Health check
      router.get('/health', (Request request) {
        return Response.ok(
          jsonEncode({'status': 'ok', 'timestamp': DateTime.now().toIso8601String()}),
          headers: {'content-type': 'application/json'},
        );
      });

      // Auth endpoints
      router.post('/api/auth/register', _register);
      router.post('/api/auth/login', _login);
      router.post('/api/auth/logout', _logout);

      // Start server
      _server = await io.serve(handler, InternetAddress.anyIPv4, _port);
      print('Simple API Server running on http://0.0.0.0:$_port');
    } catch (e) {
      print('Error starting API server: $e');
    }
  }

  /// Stops the API server
  static Future<void> stop() async {
    await _server?.close();
    await _mysqlConnection?.close();
    _server = null;
    _mysqlConnection = null;
    print('API Server stopped');
  }

  // Auth endpoints
  static Future<Response> _register(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      // Validate required fields
      if (data['username'] == null || data['email'] == null || data['password'] == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Username, email and password are required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Check if user already exists
      final existingUser = await _queryFirst(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [data['username'], data['email']]
      );

      if (existingUser != null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Username or email already exists'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Insert new user (active by default)
      final userId = await _insert(
        '''INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, 1)''',
        [
          data['username'],
          data['email'],
          data['password'], // TODO: implement proper hashing
          data['firstName'] ?? '',
          data['lastName'] ?? '',
          data['phone'] ?? '',
        ]
      );

      return Response.ok(
        jsonEncode({
          'success': true,
          'message': 'User registered successfully',
          'userId': userId,
        }),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _login(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      if (data['identifier'] == null || data['password'] == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Identifier and password are required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Find user by username or email
      final user = await _queryFirst(
        'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
        [data['identifier'], data['identifier']]
      );

      if (user == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Invalid credentials'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Check password (in production, use bcrypt)
      if (user['password_hash'] != data['password']) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Invalid credentials'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Generate session token
      final token = DateTime.now().millisecondsSinceEpoch.toString();
      final expiresAt = DateTime.utc().add(Duration(hours: 24));

      await _insert(
        'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user['id'], token, expiresAt]
      );

      return Response.ok(
        jsonEncode({
          'success': true,
          'message': 'Login successful',
          'token': token,
          'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'firstName': user['first_name'],
            'lastName': user['last_name'],
          }
        }),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _logout(Request request) async {
    try {
      final token = request.headers['authorization']?.replaceFirst('Bearer ', '');
      if (token != null) {
        await _execute(
          'DELETE FROM user_sessions WHERE token = ?',
          [token]
        );
      }

      return Response.ok(
        jsonEncode({'success': true, 'message': 'Logged out successfully'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  // Helper methods for MySQL
  static Future<Results> _query(String sql, [List<Object?>? values]) async {
    try {
      // Convert DateTime values to UTC
      final convertedValues = values?.map((value) {
        if (value is DateTime) {
          return value.toUtc();
        }
        return value;
      }).toList();
      
      return await _mysqlConnection!.query(sql, convertedValues);
    } catch (e) {
      print('Error executing query: $e');
      rethrow;
    }
  }

  static Future<ResultRow?> _queryFirst(String sql, [List<Object?>? values]) async {
    final results = await _query(sql, values);
    return results.isNotEmpty ? results.first : null;
  }

  static Future<int> _insert(String sql, [List<Object?>? values]) async {
    final results = await _query(sql, values);
    return results.insertId ?? 0;
  }

  static Future<int> _execute(String sql, [List<Object?>? values]) async {
    final results = await _query(sql, values);
    return results.affectedRows ?? 0;
  }
}

Future<void> main() async {
  await SimpleApiServer.start();
  print('Simple API process waiting for termination signal (CTRL+C)');
  
  // Keep the process alive until SIGINT/SIGTERM
  final signals = <Stream<ProcessSignal>>[
    ProcessSignal.sigint.watch(),
    ProcessSignal.sigterm.watch(),
  ];
  
  await StreamGroup.merge(signals).first;
  await SimpleApiServer.stop();
}

// Minimal StreamGroup implementation
class StreamGroup<T> {
  static Stream<T> merge<T>(Iterable<Stream<T>> streams) {
    final controller = StreamController<T>();
    final subscriptions = <StreamSubscription<T>>[];
    
    for (final stream in streams) {
      subscriptions.add(stream.listen(controller.add, onError: controller.addError));
    }
    
    controller.onCancel = () async {
      for (final sub in subscriptions) {
        await sub.cancel();
      }
    };
    
    return controller.stream;
  }
}
