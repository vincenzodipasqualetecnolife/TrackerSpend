import 'dart:io';
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_cors_headers/shelf_cors_headers.dart';
import 'package:shelf_router/shelf_router.dart';
import '../models/transaction.dart';
import '../models/budget.dart';
import '../models/category.dart';
import '../services/database_service.dart';
import '../services/export_service.dart';
import '../services/mysql_service.dart';

class ApiServer {
  static HttpServer? _server;
  static const int _port = 3001;

  /// Starts the API server
  static Future<void> start() async {
    if (_server != null) {
      print('API Server already running on port $_port');
      return;
    }

    try {
      // Initialize MySQL connection
      await MySQLService.initialize();
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

      // Health check (support both root and /api prefix)
      router.get('/health', (Request request) {
        return Response.ok(
          jsonEncode({'status': 'ok', 'timestamp': DateTime.now().toIso8601String()}),
          headers: {'content-type': 'application/json'},
        );
      });
      router.get('/api/health', (Request request) {
        return Response.ok(
          jsonEncode({'status': 'ok', 'timestamp': DateTime.now().toIso8601String()}),
          headers: {'content-type': 'application/json'},
        );
      });

      // Transactions endpoints
      router.get('/api/transactions', _getTransactions);
      router.post('/api/transactions', _createTransaction);
      router.put('/api/transactions/<id>', _updateTransaction);
      router.delete('/api/transactions/<id>', _deleteTransaction);
      router.post('/api/transactions/import', _importTransactions);
      router.get('/api/transactions/export', _exportTransactions);

      // Budgets endpoints
      router.get('/api/budgets', _getBudgets);
      router.post('/api/budgets', _createBudget);
      router.put('/api/budgets/<id>', _updateBudget);
      router.delete('/api/budgets/<id>', _deleteBudget);
      router.get('/api/budgets/<id>/statistics', _getBudgetStatistics);
      router.get('/api/budgets/<id>/recommendations', _getBudgetRecommendations);

      // Auth endpoints
      router.post('/api/auth/register', _register);
      router.post('/api/auth/login', _login);
      router.post('/api/auth/logout', _logout);
      router.post('/api/auth/forgot-password', _forgotPassword);
      router.post('/api/auth/reset-password', _resetPassword);
      router.get('/api/auth/verify-email/<token>', _verifyEmail);
      router.get('/api/auth/profile', _getProfile);
      router.put('/api/auth/profile', _updateProfile);

      // Categories endpoints
      router.get('/api/categories', _getCategories);
      router.post('/api/categories', _createCategory);
      router.put('/api/categories/<id>', _updateCategory);

      // Analytics endpoints
      router.get('/api/analytics/summary', _getAnalyticsSummary);
      router.get('/api/analytics/category-totals', _getCategoryTotals);
      router.get('/api/analytics/monthly-totals', _getMonthlyTotals);

      // Start server (bind on all interfaces for Docker)
      _server = await io.serve(handler, InternetAddress.anyIPv4, _port);
      print('API Server running on http://0.0.0.0:$_port');
    } catch (e) {
      print('Error starting API server: $e');
    }
  }

  /// Stops the API server
  static Future<void> stop() async {
    await _server?.close();
    _server = null;
    await MySQLService.close();
    print('API Server stopped');
  }

  // Middleware for logging requests
  static Response _logRequests(Request request) {
    print('${DateTime.now()} - ${request.method} ${request.url}');
    return Response.notFound('Not found');
  }

  // Transaction endpoints
  static Future<Response> _getTransactions(Request request) async {
    try {
      final transactions = DatabaseService.getAllTransactions();
      final jsonData = transactions.map((t) => t.toMap()).toList();
      
      return Response.ok(
        jsonEncode(jsonData),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _createTransaction(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      final transaction = Transaction.fromMap(data);
      await DatabaseService.addTransaction(transaction);
      
      return Response.ok(
        jsonEncode(transaction.toMap()),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _updateTransaction(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Transaction ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      data['id'] = id;
      
      final transaction = Transaction.fromMap(data);
      await DatabaseService.updateTransaction(transaction);
      
      return Response.ok(
        jsonEncode(transaction.toMap()),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _deleteTransaction(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Transaction ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      await DatabaseService.deleteTransaction(id);
      
      return Response.ok(
        jsonEncode({'message': 'Transaction deleted successfully'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _importTransactions(Request request) async {
    try {
      // This would need to handle file upload
      // For now, we'll return a placeholder
      return Response.ok(
        jsonEncode({'message': 'Import functionality to be implemented'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _exportTransactions(Request request) async {
    try {
      final filePath = await ExportService.exportTransactionsToExcel();
      
      return Response.ok(
        jsonEncode({'filePath': filePath}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  // Budget endpoints
  static Future<Response> _getBudgets(Request request) async {
    try {
      final budgets = DatabaseService.getAllBudgets();
      final jsonData = budgets.map((b) => b.toMap()).toList();
      
      return Response.ok(
        jsonEncode(jsonData),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _createBudget(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      final budget = Budget.fromMap(data);
      await DatabaseService.addBudget(budget);
      
      return Response.ok(
        jsonEncode(budget.toMap()),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _updateBudget(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Budget ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      data['id'] = id;
      
      final budget = Budget.fromMap(data);
      await DatabaseService.updateBudget(budget);
      
      return Response.ok(
        jsonEncode(budget.toMap()),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _deleteBudget(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Budget ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      await DatabaseService.deleteBudget(id);
      
      return Response.ok(
        jsonEncode({'message': 'Budget deleted successfully'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _getBudgetStatistics(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Budget ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final budget = DatabaseService.getBudget(id);
      if (budget == null) {
        return Response.notFound(
          jsonEncode({'error': 'Budget not found'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final transactions = DatabaseService.getTransactionsByBudget(id);
      final incomeTransactions = transactions.where((t) => t.type == TransactionType.income);
      final expenseTransactions = transactions.where((t) => t.type == TransactionType.expense);

      final totalIncome = incomeTransactions.fold(0.0, (sum, t) => sum + t.amount);
      final totalExpenses = expenseTransactions.fold(0.0, (sum, t) => sum + t.amount);

      final stats = {
        'totalIncome': totalIncome,
        'totalExpenses': totalExpenses,
        'netAmount': totalIncome - totalExpenses,
        'budgetUtilization': budget.spentPercentage,
        'remainingBudget': budget.remainingAmount,
        'isOverBudget': budget.isOverBudget,
        'transactionCount': transactions.length,
      };

      return Response.ok(
        jsonEncode(stats),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _getBudgetRecommendations(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Budget ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final budget = DatabaseService.getBudget(id);
      if (budget == null) {
        return Response.notFound(
          jsonEncode({'error': 'Budget not found'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Simple recommendations logic
      final recommendations = <String, dynamic>{};
      
      if (budget.isOverBudget) {
        recommendations['overBudget'] = {
          'message': 'Il budget è stato superato',
          'suggestion': 'Considera di ridurre le spese o aumentare il budget',
          'severity': 'high',
        };
      }

      for (final category in budget.categories) {
        if (category.isOverBudget) {
          recommendations['category_${category.name}'] = {
            'message': 'Categoria ${category.name} superata',
            'suggestion': 'Riduci le spese in questa categoria',
            'severity': 'medium',
            'category': category.name,
            'overAmount': category.spentAmount - category.allocatedAmount,
          };
        }
      }

      return Response.ok(
        jsonEncode(recommendations),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  // Category endpoints
  static Future<Response> _getCategories(Request request) async {
    try {
      final categories = DatabaseService.getAllCategories();
      final jsonData = categories.map((c) => c.toMap()).toList();
      
      return Response.ok(
        jsonEncode(jsonData),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _createCategory(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      final category = Category.fromMap(data);
      await DatabaseService.addCategory(category);
      
      return Response.ok(
        jsonEncode(category.toMap()),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _updateCategory(Request request) async {
    try {
      final id = request.params['id'];
      if (id == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Category ID required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      data['id'] = id;
      
      final category = Category.fromMap(data);
      await DatabaseService.updateCategory(category);
      
      return Response.ok(
        jsonEncode(category.toMap()),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  // Analytics endpoints
  static Future<Response> _getAnalyticsSummary(Request request) async {
    try {
      final totalIncome = DatabaseService.getTotalIncome(null, null);
      final totalExpenses = DatabaseService.getTotalExpenses(null, null);
      final netAmount = totalIncome - totalExpenses;

      final summary = {
        'totalIncome': totalIncome,
        'totalExpenses': totalExpenses,
        'netAmount': netAmount,
        'transactionCount': DatabaseService.getAllTransactions().length,
      };

      return Response.ok(
        jsonEncode(summary),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _getCategoryTotals(Request request) async {
    try {
      final categoryTotals = DatabaseService.getCategoryTotals(null, null);
      
      return Response.ok(
        jsonEncode(categoryTotals),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _getMonthlyTotals(Request request) async {
    try {
      final year = int.tryParse(request.url.queryParameters['year'] ?? DateTime.now().year.toString()) ?? DateTime.now().year;
      final monthlyTotals = DatabaseService.getMonthlyTotals(year);
      
      return Response.ok(
        jsonEncode(monthlyTotals),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
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
      final existingUser = await MySQLService.queryFirst(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [data['username'], data['email']]
      );

      if (existingUser != null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Username or email already exists'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // Hash password (in production, use bcrypt)
      final passwordHash = data['password']; // TODO: implement proper hashing

      // Insert new user (active by default)
      final userId = await MySQLService.insert(
        '''INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, 1)''',
        [
          data['username'],
          data['email'],
          passwordHash,
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
      final user = await MySQLService.queryFirst(
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

      await MySQLService.insert(
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
        await MySQLService.execute(
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

  static Future<Response> _forgotPassword(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      if (data['email'] == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Email is required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final user = await MySQLService.queryFirst(
        'SELECT id FROM users WHERE email = ? AND is_active = 1',
        [data['email']]
      );

      if (user == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Email not found'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // TODO: Send email with reset link
      return Response.ok(
        jsonEncode({'success': true, 'message': 'Password reset email sent'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _resetPassword(Request request) async {
    try {
      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;
      
      if (data['token'] == null || data['newPassword'] == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Token and new password are required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // TODO: Implement token validation and password reset
      return Response.ok(
        jsonEncode({'success': true, 'message': 'Password reset successfully'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _verifyEmail(Request request) async {
    try {
      final token = request.params['token'];
      if (token == null) {
        return Response.badRequest(
          body: jsonEncode({'error': 'Token is required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      // TODO: Implement email verification
      return Response.ok(
        jsonEncode({'success': true, 'message': 'Email verified successfully'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _getProfile(Request request) async {
    try {
      final token = request.headers['authorization']?.replaceFirst('Bearer ', '');
      if (token == null) {
        return Response(401,
          body: jsonEncode({'error': 'Authentication required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final session = await MySQLService.queryFirst(
        'SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()',
        [token]
      );

      if (session == null) {
        return Response(401,
          body: jsonEncode({'error': 'Invalid or expired token'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final user = await MySQLService.queryFirst(
        'SELECT id, username, email, first_name, last_name, phone, created_at FROM users WHERE id = ?',
        [session['user_id']]
      );

      return Response.ok(
        jsonEncode(user),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }

  static Future<Response> _updateProfile(Request request) async {
    try {
      final token = request.headers['authorization']?.replaceFirst('Bearer ', '');
      if (token == null) {
        return Response(401,
          body: jsonEncode({'error': 'Authentication required'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final session = await MySQLService.queryFirst(
        'SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()',
        [token]
      );

      if (session == null) {
        return Response(401,
          body: jsonEncode({'error': 'Invalid or expired token'}),
          headers: {'content-type': 'application/json'},
        );
      }

      final body = await request.readAsString();
      final data = jsonDecode(body) as Map<String, dynamic>;

      await MySQLService.execute(
        '''UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?''',
        [
          data['firstName'] ?? '',
          data['lastName'] ?? '',
          data['phone'] ?? '',
          session['user_id'],
        ]
      );

      return Response.ok(
        jsonEncode({'success': true, 'message': 'Profile updated successfully'}),
        headers: {'content-type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'content-type': 'application/json'},
      );
    }
  }
}
