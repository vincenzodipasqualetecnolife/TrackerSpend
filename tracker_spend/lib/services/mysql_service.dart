import 'dart:io';
import 'package:mysql1/mysql1.dart';

class MySQLService {
  static MySqlConnection? _connection;
  static const String _host = 'mysql'; // Docker service name
  static const int _port = 3306;
  static const String _database = 'tracker_spend';
  static const String _username = 'tracker_user';
  static const String _password = 'tracker_password';

  /// Initialize MySQL connection
  static Future<void> initialize() async {
    try {
      final settings = ConnectionSettings(
        host: _host,
        port: _port,
        user: _username,
        password: _password,
        db: _database,
      );

      _connection = await MySqlConnection.connect(settings);
      print('MySQL connection established');
    } catch (e) {
      print('Error connecting to MySQL: $e');
      rethrow;
    }
  }

  /// Get the database connection
  static MySqlConnection get connection {
    if (_connection == null) {
      throw Exception('MySQL connection not initialized');
    }
    return _connection!;
  }

  /// Close the database connection
  static Future<void> close() async {
    await _connection?.close();
    _connection = null;
    print('MySQL connection closed');
  }

  /// Execute a query and return results
  static Future<Results> query(String sql, [List<Object?>? values]) async {
    try {
      // Convert DateTime values to UTC
      final convertedValues = values?.map((value) {
        if (value is DateTime) {
          return value.toUtc();
        }
        return value;
      }).toList();
      
      return await connection.query(sql, convertedValues);
    } catch (e) {
      print('Error executing query: $e');
      rethrow;
    }
  }

  /// Execute a query and return the first row
  static Future<ResultRow?> queryFirst(String sql, [List<Object?>? values]) async {
    final results = await query(sql, values);
    return results.isNotEmpty ? results.first : null;
  }

  /// Execute an insert query and return the inserted ID
  static Future<int> insert(String sql, [List<Object?>? values]) async {
    final results = await query(sql, values);
    return results.insertId ?? 0;
  }

  /// Execute an update/delete query and return affected rows
  static Future<int> execute(String sql, [List<Object?>? values]) async {
    final results = await query(sql, values);
    return results.affectedRows ?? 0;
  }
}
