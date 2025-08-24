import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/transaction_provider.dart';
import '../providers/budget_provider.dart';
import '../services/export_service.dart';
import '../models/transaction.dart';
import '../models/budget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _initializeProviders();
  }

  Future<void> _initializeProviders() async {
    final transactionProvider = Provider.of<TransactionProvider>(context, listen: false);
    final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
    
    await transactionProvider.initialize();
    await budgetProvider.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TrackerSpend'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.file_upload),
            onPressed: _showImportDialog,
            tooltip: 'Importa File',
          ),
          IconButton(
            icon: const Icon(Icons.file_download),
            onPressed: _showExportDialog,
            tooltip: 'Esporta Report',
          ),
        ],
      ),
      body: Consumer2<TransactionProvider, BudgetProvider>(
        builder: (context, transactionProvider, budgetProvider, child) {
          if (transactionProvider.isLoading || budgetProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (transactionProvider.error != null) {
            return _buildErrorWidget(transactionProvider.error!);
          }

          if (budgetProvider.error != null) {
            return _buildErrorWidget(budgetProvider.error!);
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryCards(transactionProvider),
                const SizedBox(height: 24),
                _buildQuickActions(),
                const SizedBox(height: 24),
                _buildRecentTransactions(transactionProvider),
                const SizedBox(height: 24),
                _buildActiveBudgets(budgetProvider),
                const SizedBox(height: 24),
                _buildTestButtons(),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddTransactionDialog,
        tooltip: 'Aggiungi Transazione',
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildSummaryCards(TransactionProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Riepilogo',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Entrate',
                '€${provider.totalIncome.toStringAsFixed(2)}',
                Colors.green,
                Icons.trending_up,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                'Uscite',
                '€${provider.totalExpenses.toStringAsFixed(2)}',
                Colors.red,
                Icons.trending_down,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                'Saldo',
                '€${provider.netAmount.toStringAsFixed(2)}',
                provider.netAmount >= 0 ? Colors.blue : Colors.orange,
                Icons.account_balance_wallet,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String amount, Color color, IconData icon) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 4),
            Text(
              amount,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Azioni Rapide',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _showAddTransactionDialog,
                icon: const Icon(Icons.add),
                label: const Text('Nuova Transazione'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _showCreateBudgetDialog,
                icon: const Icon(Icons.account_balance),
                label: const Text('Nuovo Budget'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentTransactions(TransactionProvider provider) {
    final recentTransactions = provider.getRecentTransactions(limit: 5);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Transazioni Recenti',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () => _showAllTransactions(provider),
              child: const Text('Vedi Tutte'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (recentTransactions.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('Nessuna transazione trovata'),
            ),
          )
        else
          ...recentTransactions.map((transaction) => _buildTransactionCard(transaction)),
      ],
    );
  }

  Widget _buildTransactionCard(Transaction transaction) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: transaction.type == TransactionType.income 
              ? Colors.green 
              : Colors.red,
          child: Icon(
            transaction.type == TransactionType.income 
                ? Icons.trending_up 
                : Icons.trending_down,
            color: Colors.white,
          ),
        ),
        title: Text(transaction.description),
        subtitle: Text(
          '${transaction.category} • ${_formatDate(transaction.date)}',
        ),
        trailing: Text(
          '€${transaction.amount.toStringAsFixed(2)}',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: transaction.type == TransactionType.income 
                ? Colors.green 
                : Colors.red,
          ),
        ),
        onTap: () => _showTransactionDetails(transaction),
      ),
    );
  }

  Widget _buildActiveBudgets(BudgetProvider provider) {
    final activeBudgets = provider.activeBudgets;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Budget Attivi',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () => _showAllBudgets(provider),
              child: const Text('Vedi Tutti'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (activeBudgets.isEmpty)
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Text('Nessun budget attivo'),
            ),
          )
        else
          ...activeBudgets.map((budget) => _buildBudgetCard(budget, provider)),
      ],
    );
  }

  Widget _buildBudgetCard(Budget budget, BudgetProvider provider) {
    final stats = provider.getBudgetStatistics(budget.id);
    
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  budget.name,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  '${budget.spentPercentage.toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: budget.isOverBudget ? Colors.red : Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: budget.spentPercentage / 100,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(
                budget.isOverBudget ? Colors.red : Colors.green,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Speso: €${budget.spentAmount.toStringAsFixed(2)}'),
                Text('Rimanente: €${budget.remainingAmount.toStringAsFixed(2)}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTestButtons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Test Funzionalità',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            ElevatedButton(
              onPressed: _addTestTransaction,
              child: const Text('Aggiungi Transazione Test'),
            ),
            ElevatedButton(
              onPressed: _addTestBudget,
              child: const Text('Aggiungi Budget Test'),
            ),
            ElevatedButton(
              onPressed: _testExport,
              child: const Text('Test Export'),
            ),
            ElevatedButton(
              onPressed: _testImport,
              child: const Text('Test Import'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Errore',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                final transactionProvider = Provider.of<TransactionProvider>(context, listen: false);
                final budgetProvider = Provider.of<BudgetProvider>(context, listen: false);
                transactionProvider.initialize();
                budgetProvider.initialize();
              },
              child: const Text('Riprova'),
            ),
          ],
        ),
      ),
    );
  }

  // Dialog methods
  void _showImportDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Importa File'),
        content: const Text('Seleziona un file Excel o CSV per importare le transazioni.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annulla'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _importFile();
            },
            child: const Text('Importa'),
          ),
        ],
      ),
    );
  }

  void _showExportDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Esporta Report'),
        content: const Text('Seleziona il formato per esportare i dati.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Annulla'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _exportToExcel();
            },
            child: const Text('Excel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _exportToPdf();
            },
            child: const Text('PDF'),
          ),
        ],
      ),
    );
  }

  void _showAddTransactionDialog() {
    // Placeholder for add transaction dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Aggiungi Transazione'),
        content: const Text('Funzionalità in sviluppo - UI placeholder'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Chiudi'),
          ),
        ],
      ),
    );
  }

  void _showCreateBudgetDialog() {
    // Placeholder for create budget dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Crea Budget'),
        content: const Text('Funzionalità in sviluppo - UI placeholder'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Chiudi'),
          ),
        ],
      ),
    );
  }

  // Action methods
  Future<void> _importFile() async {
    try {
      final provider = Provider.of<TransactionProvider>(context, listen: false);
      await provider.importTransactionsFromFile();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('File importato con successo!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Errore nell\'importazione: $e')),
        );
      }
    }
  }

  Future<void> _exportToExcel() async {
    try {
      final filePath = await ExportService.exportTransactionsToExcel();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Report esportato in: $filePath')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Errore nell\'esportazione: $e')),
        );
      }
    }
  }

  Future<void> _exportToPdf() async {
    try {
      final filePath = await ExportService.exportTransactionsToPdf();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Report esportato in: $filePath')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Errore nell\'esportazione: $e')),
        );
      }
    }
  }

  // Test methods
  void _addTestTransaction() {
    final provider = Provider.of<TransactionProvider>(context, listen: false);
    final testTransaction = Transaction(
      date: DateTime.now(),
      description: 'Test Transaction',
      amount: 50.0,
      type: TransactionType.expense,
      category: 'Test',
    );
    provider.addTransaction(testTransaction);
  }

  void _addTestBudget() async {
    final provider = Provider.of<BudgetProvider>(context, listen: false);
    final testBudget = await provider.createDefaultBudget(
      name: 'Test Budget',
      description: 'Budget di test',
      totalAmount: 1000.0,
      period: BudgetPeriod.monthly,
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(days: 30)),
    );
    provider.addBudget(testBudget);
  }

  void _testExport() async {
    await _exportToExcel();
  }

  void _testImport() async {
    await _importFile();
  }

  // Navigation methods
  void _showAllTransactions(TransactionProvider provider) {
    // Placeholder for all transactions screen
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tutte le Transazioni'),
        content: Text('${provider.transactions.length} transazioni totali'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Chiudi'),
          ),
        ],
      ),
    );
  }

  void _showAllBudgets(BudgetProvider provider) {
    // Placeholder for all budgets screen
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tutti i Budget'),
        content: Text('${provider.budgets.length} budget totali'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Chiudi'),
          ),
        ],
      ),
    );
  }

  void _showTransactionDetails(Transaction transaction) {
    // Placeholder for transaction details
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Dettagli Transazione'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Descrizione: ${transaction.description}'),
            Text('Importo: €${transaction.amount.toStringAsFixed(2)}'),
            Text('Categoria: ${transaction.category}'),
            Text('Data: ${_formatDate(transaction.date)}'),
            Text('Tipo: ${transaction.type == TransactionType.income ? 'Entrata' : 'Uscita'}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Chiudi'),
          ),
        ],
      ),
    );
  }

  // Helper methods
  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
