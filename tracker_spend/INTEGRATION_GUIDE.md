# Guida Integrazione Frontend - TrackerSpend

## 🎯 Obiettivo
Questa guida fornisce tutte le informazioni necessarie per integrare il frontend UI/UX con la logica applicativa già implementata.

## 📋 Stato Attuale del Progetto

### ✅ Completato
- **Logica Applicativa**: 100% implementata e testata
- **Database**: Hive configurato con modelli completi
- **Servizi**: File parsing, export, analytics
- **State Management**: Provider configurato
- **UI Placeholder**: Schermata principale funzionante

### 🔄 Da Sviluppare
- **UI/UX Completa**: Schermate dettagliate, form, grafici
- **Navigazione**: Routing tra schermate
- **Temi**: Design system e personalizzazione
- **Animazioni**: Transizioni e micro-interazioni

## 🏗️ Architettura Implementata

### Provider Pattern
```dart
// Provider già configurati in main.dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => TransactionProvider()),
    ChangeNotifierProvider(create: (_) => BudgetProvider()),
  ],
  child: MaterialApp(...),
)
```

### Struttura File
```
lib/
├── models/          # ✅ Modelli completi
├── services/        # ✅ Servizi business logic
├── providers/       # ✅ State management
├── widgets/         # 🔄 UI components (da espandere)
├── utils/           # 🔄 Utility functions
└── constants/       # 🔄 Design constants
```

## 🔌 API Disponibili

### TransactionProvider
```dart
// Accesso al provider
final provider = Provider.of<TransactionProvider>(context, listen: false);

// Operazioni principali
await provider.addTransaction(transaction);
await provider.updateTransaction(transaction);
await provider.deleteTransaction(id);
await provider.importTransactionsFromFile();

// Filtri
provider.filterTransactions(
  startDate: DateTime.now().subtract(Duration(days: 30)),
  endDate: DateTime.now(),
  category: 'Alimentari',
  type: TransactionType.expense,
);

// Statistiche
double totalIncome = provider.totalIncome;
double totalExpenses = provider.totalExpenses;
double netAmount = provider.netAmount;
```

### BudgetProvider
```dart
// Accesso al provider
final provider = Provider.of<BudgetProvider>(context, listen: false);

// Operazioni principali
await provider.addBudget(budget);
await provider.updateBudget(budget);
await provider.deleteBudget(id);

// Creazione budget con categorie default
final budget = await provider.createDefaultBudget(
  name: 'Budget Mensile',
  description: 'Budget per gennaio 2024',
  totalAmount: 2000.0,
  period: BudgetPeriod.monthly,
  startDate: DateTime.now(),
  endDate: DateTime.now().add(Duration(days: 30)),
);

// Statistiche budget
final stats = provider.getBudgetStatistics(budgetId);
final recommendations = provider.getBudgetRecommendations(budgetId);
```

## 🎨 Esempi di Integrazione UI

### 1. Lista Transazioni con Filtri
```dart
class TransactionsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<TransactionProvider>(
      builder: (context, provider, child) {
        return Scaffold(
          appBar: AppBar(
            title: Text('Transazioni'),
            actions: [
              IconButton(
                icon: Icon(Icons.filter_list),
                onPressed: () => _showFilterDialog(context, provider),
              ),
            ],
          ),
          body: provider.isLoading
              ? Center(child: CircularProgressIndicator())
              : ListView.builder(
                  itemCount: provider.filteredTransactions.length,
                  itemBuilder: (context, index) {
                    final transaction = provider.filteredTransactions[index];
                    return TransactionCard(transaction: transaction);
                  },
                ),
        );
      },
    );
  }
}
```

### 2. Form Aggiunta Transazione
```dart
class AddTransactionScreen extends StatefulWidget {
  @override
  _AddTransactionScreenState createState() => _AddTransactionScreenState();
}

class _AddTransactionScreenState extends State<AddTransactionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _amountController = TextEditingController();
  DateTime _selectedDate = DateTime.now();
  TransactionType _selectedType = TransactionType.expense;
  String _selectedCategory = 'Altro';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Nuova Transazione')),
      body: Form(
        key: _formKey,
        child: Column(
          children: [
            TextFormField(
              controller: _descriptionController,
              decoration: InputDecoration(labelText: 'Descrizione'),
              validator: (value) => value?.isEmpty == true ? 'Campo obbligatorio' : null,
            ),
            TextFormField(
              controller: _amountController,
              decoration: InputDecoration(labelText: 'Importo'),
              keyboardType: TextInputType.number,
              validator: (value) => value?.isEmpty == true ? 'Campo obbligatorio' : null,
            ),
            // Altri campi...
            ElevatedButton(
              onPressed: _saveTransaction,
              child: Text('Salva'),
            ),
          ],
        ),
      ),
    );
  }

  void _saveTransaction() {
    if (_formKey.currentState?.validate() == true) {
      final provider = Provider.of<TransactionProvider>(context, listen: false);
      final transaction = Transaction(
        date: _selectedDate,
        description: _descriptionController.text,
        amount: double.parse(_amountController.text),
        type: _selectedType,
        category: _selectedCategory,
      );
      provider.addTransaction(transaction);
      Navigator.pop(context);
    }
  }
}
```

### 3. Dashboard con Grafici
```dart
class DashboardScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer2<TransactionProvider, BudgetProvider>(
      builder: (context, transactionProvider, budgetProvider, child) {
        return Scaffold(
          appBar: AppBar(title: Text('Dashboard')),
          body: SingleChildScrollView(
            child: Column(
              children: [
                // Riepilogo
                SummaryCards(provider: transactionProvider),
                
                // Grafico categorie
                CategoryChart(provider: transactionProvider),
                
                // Budget progress
                BudgetProgressCards(provider: budgetProvider),
                
                // Transazioni recenti
                RecentTransactions(provider: transactionProvider),
              ],
            ),
          ),
        );
      },
    );
  }
}
```

## 📊 Grafici e Visualizzazioni

### Preparato per Integrazione
Le librerie per i grafici sono già configurate:
- `fl_chart`: Grafici personalizzabili
- `syncfusion_flutter_charts`: Grafici avanzati

### Esempio Grafico Categorie
```dart
class CategoryChart extends StatelessWidget {
  final TransactionProvider provider;

  const CategoryChart({required this.provider});

  @override
  Widget build(BuildContext context) {
    final categoryTotals = provider.getCategoryTotals();
    
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Spese per Categoria', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: categoryTotals.entries.map((entry) {
                    return PieChartSectionData(
                      value: entry.value,
                      title: '${entry.key}\n€${entry.value.toStringAsFixed(2)}',
                      color: _getCategoryColor(entry.key),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 🔄 Gestione Stato e Loading

### Pattern Consigliato
```dart
Consumer<TransactionProvider>(
  builder: (context, provider, child) {
    if (provider.isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (provider.error != null) {
      return ErrorWidget(
        error: provider.error!,
        onRetry: () => provider.loadTransactions(),
      );
    }
    
    return YourContentWidget();
  },
)
```

## 📱 Navigazione

### Setup Routing
```dart
MaterialApp(
  // ...
  routes: {
    '/': (context) => HomeScreen(),
    '/transactions': (context) => TransactionsScreen(),
    '/budgets': (context) => BudgetsScreen(),
    '/add-transaction': (context) => AddTransactionScreen(),
    '/add-budget': (context) => AddBudgetScreen(),
    '/analytics': (context) => AnalyticsScreen(),
  },
)
```

## 🎨 Design System

### Costanti Colori
```dart
// lib/constants/colors.dart
class AppColors {
  static const primary = Color(0xFF2196F3);
  static const secondary = Color(0xFF4CAF50);
  static const error = Color(0xFFF44336);
  static const warning = Color(0xFFFF9800);
  static const success = Color(0xFF4CAF50);
  
  // Categorie
  static const alimentari = Color(0xFFFF5722);
  static const trasporti = Color(0xFF2196F3);
  static const casa = Color(0xFF4CAF50);
  static const intrattenimento = Color(0xFF9C27B0);
  static const salute = Color(0xFFF44336);
  static const shopping = Color(0xFFFF9800);
}
```

### Temi
```dart
// lib/constants/themes.dart
class AppThemes {
  static ThemeData lightTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(seedColor: AppColors.primary),
    useMaterial3: true,
    // Personalizzazioni...
  );
  
  static ThemeData darkTheme = ThemeData(
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.dark,
    ),
    useMaterial3: true,
    // Personalizzazioni...
  );
}
```

## 🧪 Testing UI

### Widget Test
```dart
// test/widget/transaction_card_test.dart
testWidgets('TransactionCard displays transaction data', (WidgetTester tester) async {
  final transaction = Transaction(
    date: DateTime.now(),
    description: 'Test Transaction',
    amount: 100.0,
    type: TransactionType.expense,
    category: 'Test',
  );

  await tester.pumpWidget(
    MaterialApp(
      home: TransactionCard(transaction: transaction),
    ),
  );

  expect(find.text('Test Transaction'), findsOneWidget);
  expect(find.text('€100.00'), findsOneWidget);
  expect(find.text('Test'), findsOneWidget);
});
```

## 📋 Checklist Integrazione

### Fase 1: Setup Base
- [ ] Configurare routing e navigazione
- [ ] Implementare design system
- [ ] Creare componenti base (bottoni, input, card)
- [ ] Setup temi light/dark

### Fase 2: Schermate Principali
- [ ] Home/Dashboard
- [ ] Lista Transazioni
- [ ] Form Aggiunta/Modifica Transazione
- [ ] Lista Budget
- [ ] Form Creazione/Modifica Budget
- [ ] Dettagli Transazione/Budget

### Fase 3: Funzionalità Avanzate
- [ ] Grafici e visualizzazioni
- [ ] Filtri avanzati
- [ ] Ricerca
- [ ] Export/Import UI
- [ ] Impostazioni

### Fase 4: Polish
- [ ] Animazioni e transizioni
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design
- [ ] Accessibility

## 🚀 Prossimi Passi

1. **Iniziare con la schermata principale**: Espandere `HomeScreen` esistente
2. **Creare componenti riutilizzabili**: Card, form, bottoni
3. **Implementare navigazione**: Routing tra schermate
4. **Aggiungere grafici**: Utilizzare le librerie già configurate
5. **Testare integrazione**: Verificare che tutto funzioni correttamente

## 📞 Supporto

Per domande o chiarimenti:
- Controllare la documentazione nei file sorgente
- Utilizzare i pulsanti di test nella schermata principale
- Verificare gli esempi di utilizzo nei provider

La logica applicativa è completa e pronta per l'integrazione UI/UX!
