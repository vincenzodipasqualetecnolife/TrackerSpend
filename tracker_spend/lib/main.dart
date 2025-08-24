import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'services/database_service.dart';
import 'services/api_server.dart';
import 'providers/transaction_provider.dart';
import 'providers/budget_provider.dart';
import 'providers/goal_provider.dart';
import 'providers/auth_provider.dart';
import 'widgets/home_screen.dart';

// Import all models for Hive registration
import 'models/transaction.dart';
import 'models/category.dart';
import 'models/budget.dart';
import 'models/goal.dart';
import 'models/auth.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Initialize Hive
    await Hive.initFlutter();
    
    // Register all Hive adapters
    _registerHiveAdapters();
    
    // Initialize database
    await DatabaseService.initialize();
    
    // Start API server for React frontend
    await ApiServer.start();
    
    runApp(const TrackerSpendApp());
  } catch (e) {
    print('Error initializing app: $e');
    runApp(const ErrorApp());
  }
}

void _registerHiveAdapters() {
  // Core models
  Hive.registerAdapter(TransactionAdapter());
  Hive.registerAdapter(TransactionTypeAdapter());
  Hive.registerAdapter(CategoryAdapter());
  Hive.registerAdapter(CategoryTypeAdapter());
  Hive.registerAdapter(BudgetAdapter());
  Hive.registerAdapter(BudgetPeriodAdapter());
  Hive.registerAdapter(BudgetCategoryAdapter());
  
  // Goal models
  Hive.registerAdapter(GoalAdapter());
  Hive.registerAdapter(GoalPriorityAdapter());
  Hive.registerAdapter(GoalStatusAdapter());
  
  // Auth models
  Hive.registerAdapter(AuthUserAdapter());
  Hive.registerAdapter(AuthStatusAdapter());
  Hive.registerAdapter(UserRoleAdapter());
  Hive.registerAdapter(UserSessionAdapter());
}

class TrackerSpendApp extends StatelessWidget {
  const TrackerSpendApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Auth provider (deve essere il primo)
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        
        // Core providers
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
        ChangeNotifierProvider(create: (_) => BudgetProvider()),
        
        // New feature providers
        ChangeNotifierProvider(create: (_) => GoalProvider()),
      ],
      child: MaterialApp(
        title: 'TrackerSpend',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: const HomeScreen(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}

class ErrorApp extends StatelessWidget {
  const ErrorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TrackerSpend - Error',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Errore di Inizializzazione'),
          backgroundColor: Colors.red,
          foregroundColor: Colors.white,
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                SizedBox(height: 16),
                Text(
                  'Errore durante l\'inizializzazione dell\'app',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 8),
                Text(
                  'Impossibile inizializzare il database. Verifica i permessi e riprova.',
                  style: TextStyle(fontSize: 14),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
