import 'dart:io';
import 'dart:convert';
import 'package:csv/csv.dart';
import 'package:excel/excel.dart';
import 'package:path/path.dart' as path;
import '../models/transaction.dart';
import '../models/category.dart';
import '../providers/transaction_provider.dart';
import '../providers/budget_provider.dart';

class CsvImportService {
  static const List<String> _supportedFormats = ['csv', 'xlsx', 'xls'];
  
  /// Importa un file CSV/Excel e lo rende persistente nel database
  static Future<ImportResult> importFile(
    File file, 
    TransactionProvider transactionProvider,
    BudgetProvider budgetProvider, {
    bool autoCategorize = true,
    String? defaultCategory = 'Altro',
  }) async {
    try {
      final extension = path.extension(file.path).toLowerCase().replaceAll('.', '');
      
      if (!_supportedFormats.contains(extension)) {
        return ImportResult(
          success: false,
          error: 'Formato file non supportato. Formati supportati: ${_supportedFormats.join(', ')}',
        );
      }

      List<Map<String, dynamic>> data;
      
      if (extension == 'csv') {
        data = await _parseCsvFile(file);
      } else {
        data = await _parseExcelFile(file);
      }

      if (data.isEmpty) {
        return ImportResult(
          success: false,
          error: 'Il file non contiene dati validi',
        );
      }

      // Normalizza i dati
      final normalizedData = _normalizeData(data);
      
      // Converte in transazioni
      final transactions = _convertToTransactions(normalizedData, autoCategorize, defaultCategory);
      
      // Salva nel database
      await _saveTransactions(transactions, transactionProvider);
      
      // Aggiorna i budget se necessario
      await _updateBudgets(transactions, budgetProvider);
      
      return ImportResult(
        success: true,
        importedCount: transactions.length,
        transactions: transactions,
        summary: _generateImportSummary(transactions),
      );
      
    } catch (e) {
      return ImportResult(
        success: false,
        error: 'Errore durante l\'importazione: $e',
      );
    }
  }

  /// Parsing del file CSV
  static Future<List<Map<String, dynamic>>> _parseCsvFile(File file) async {
    final csvString = await file.readAsString();
    final List<List<dynamic>> csvTable = const CsvToListConverter().convert(csvString);
    
    if (csvTable.isEmpty) return [];
    
    final headers = csvTable[0].map((h) => h.toString().trim()).toList();
    final rows = csvTable.skip(1);
    
    return rows.map((row) {
      final Map<String, dynamic> map = {};
      for (int i = 0; i < headers.length && i < row.length; i++) {
        map[headers[i]] = row[i];
      }
      return map;
    }).toList();
  }

  /// Parsing del file Excel
  static Future<List<Map<String, dynamic>>> _parseExcelFile(File file) async {
    final bytes = await file.readAsBytes();
    final excel = Excel.decodeBytes(bytes);
    
    final List<Map<String, dynamic>> data = [];
    
    for (final sheet in excel.tables.keys) {
      final table = excel.tables[sheet]!;
      if (table.maxRows == 0) continue;
      
      final headers = table.row(0)?.map((cell) => cell?.value.toString().trim() ?? '').toList() ?? [];
      if (headers.isEmpty) continue;
      
      for (int row = 1; row < table.maxRows; row++) {
        final rowData = table.row(row);
        if (rowData == null) continue;
        
        final Map<String, dynamic> map = {};
        for (int col = 0; col < headers.length && col < rowData.length; col++) {
          final cell = rowData[col];
          map[headers[col]] = cell?.value;
        }
        
        if (map.isNotEmpty) {
          data.add(map);
        }
      }
      
      // Prendi solo il primo foglio per ora
      break;
    }
    
    return data;
  }

  /// Normalizza i dati importati
  static List<Map<String, dynamic>> _normalizeData(List<Map<String, dynamic>> rawData) {
    return rawData.map((row) {
      final normalized = <String, dynamic>{};
      
      // Mappa i campi comuni
      for (final entry in row.entries) {
        final key = entry.key.toLowerCase().trim();
        final value = entry.value?.toString().trim() ?? '';
        
        switch (key) {
          case 'data':
          case 'date':
          case 'data_transazione':
          case 'transaction_date':
            normalized['date'] = value;
            break;
          case 'descrizione':
          case 'description':
          case 'desc':
          case 'note':
            normalized['description'] = value;
            break;
          case 'importo':
          case 'amount':
          case 'somma':
          case 'valore':
            normalized['amount'] = value;
            break;
          case 'categoria':
          case 'category':
          case 'cat':
            normalized['category'] = value;
            break;
          case 'tipo':
          case 'type':
          case 'entrata':
          case 'uscita':
            normalized['type'] = value;
            break;
          default:
            // Mantieni altri campi come metadata
            if (!normalized.containsKey('metadata')) {
              normalized['metadata'] = <String, dynamic>{};
            }
            normalized['metadata'][entry.key] = entry.value;
        }
      }
      
      return normalized;
    }).toList();
  }

  /// Converte i dati normalizzati in transazioni
  static List<Transaction> _convertToTransactions(
    List<Map<String, dynamic>> normalizedData,
    bool autoCategorize,
    String? defaultCategory,
  ) {
    return normalizedData.map((row) {
      // Parsing della data
      DateTime? date;
      try {
        if (row['date'] != null) {
          final dateStr = row['date'].toString();
          // Prova diversi formati di data
          if (dateStr.contains('/')) {
            final parts = dateStr.split('/');
            if (parts.length == 3) {
              date = DateTime(
                int.parse(parts[2]),
                int.parse(parts[1]),
                int.parse(parts[0]),
              );
            }
          } else if (dateStr.contains('-')) {
            date = DateTime.parse(dateStr);
          } else {
            // Fallback alla data corrente
            date = DateTime.now();
          }
        } else {
          date = DateTime.now();
        }
      } catch (e) {
        date = DateTime.now();
      }

      // Parsing dell'importo
      double amount = 0.0;
      try {
        if (row['amount'] != null) {
          final amountStr = row['amount'].toString()
              .replaceAll('€', '')
              .replaceAll('$', '')
              .replaceAll(',', '.')
              .trim();
          amount = double.parse(amountStr);
        }
      } catch (e) {
        amount = 0.0;
      }

      // Determinazione del tipo
      TransactionType type = TransactionType.expense;
      if (row['type'] != null) {
        final typeStr = row['type'].toString().toLowerCase();
        if (typeStr.contains('entrata') || 
            typeStr.contains('income') || 
            typeStr.contains('+') ||
            amount < 0) {
          type = TransactionType.income;
          if (amount < 0) amount = amount.abs();
        }
      }

      // Categorizzazione
      String category = defaultCategory ?? 'Altro';
      if (row['category'] != null && row['category'].toString().isNotEmpty) {
        category = row['category'].toString().trim();
      } else if (autoCategorize) {
        category = _autoCategorize(row['description']?.toString() ?? '');
      }

      // Descrizione
      String description = row['description']?.toString() ?? 'Transazione importata';
      if (description.isEmpty) {
        description = 'Transazione importata';
      }

      return Transaction(
        date: date,
        description: description,
        amount: amount,
        type: type,
        category: category,
        metadata: row['metadata'] as Map<String, dynamic>?,
      );
    }).toList();
  }

  /// Categorizzazione automatica basata sulla descrizione
  static String _autoCategorize(String description) {
    final desc = description.toLowerCase();
    
    // Alimentari
    if (desc.contains('supermercato') || desc.contains('alimentari') || 
        desc.contains('cibo') || desc.contains('ristorante') || desc.contains('pizza')) {
      return 'Alimentari';
    }
    
    // Trasporti
    if (desc.contains('benzina') || desc.contains('gas') || desc.contains('auto') ||
        desc.contains('trasporto') || desc.contains('bus') || desc.contains('metro')) {
      return 'Trasporti';
    }
    
    // Casa
    if (desc.contains('casa') || desc.contains('affitto') || desc.contains('bolletta') ||
        desc.contains('luce') || desc.contains('gas') || desc.contains('acqua')) {
      return 'Casa';
    }
    
    // Shopping
    if (desc.contains('shopping') || desc.contains('vestiti') || desc.contains('negozio')) {
      return 'Shopping';
    }
    
    // Intrattenimento
    if (desc.contains('cinema') || desc.contains('teatro') || desc.contains('concerto') ||
        desc.contains('bar') || desc.contains('pub')) {
      return 'Intrattenimento';
    }
    
    // Salute
    if (desc.contains('farmacia') || desc.contains('medico') || desc.contains('ospedale')) {
      return 'Salute';
    }
    
    // Stipendio
    if (desc.contains('stipendio') || desc.contains('paga') || desc.contains('salary')) {
      return 'Stipendio';
    }
    
    return 'Altro';
  }

  /// Salva le transazioni nel database
  static Future<void> _saveTransactions(
    List<Transaction> transactions,
    TransactionProvider provider,
  ) async {
    for (final transaction in transactions) {
      await provider.addTransaction(transaction);
    }
  }

  /// Aggiorna i budget basandosi sulle nuove transazioni
  static Future<void> _updateBudgets(
    List<Transaction> transactions,
    BudgetProvider provider,
  ) async {
    // Logica per aggiornare i budget se necessario
    // Per ora è un placeholder
  }

  /// Genera un riepilogo dell'importazione
  static ImportSummary _generateImportSummary(List<Transaction> transactions) {
    final totalIncome = transactions
        .where((t) => t.type == TransactionType.income)
        .fold(0.0, (sum, t) => sum + t.amount);
    
    final totalExpenses = transactions
        .where((t) => t.type == TransactionType.expense)
        .fold(0.0, (sum, t) => sum + t.amount);
    
    final categories = <String, int>{};
    for (final transaction in transactions) {
      categories[transaction.category] = (categories[transaction.category] ?? 0) + 1;
    }
    
    return ImportSummary(
      totalTransactions: transactions.length,
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      netAmount: totalIncome - totalExpenses,
      categories: categories,
      dateRange: _getDateRange(transactions),
    );
  }

  /// Ottiene il range di date delle transazioni
  static DateRange _getDateRange(List<Transaction> transactions) {
    if (transactions.isEmpty) {
      final now = DateTime.now();
      return DateRange(now, now);
    }
    
    final dates = transactions.map((t) => t.date).toList();
    dates.sort();
    
    return DateRange(dates.first, dates.last);
  }

  /// Esporta le transazioni in formato CSV
  static Future<String> exportToCsv(List<Transaction> transactions) async {
    final csvData = [
      ['Data', 'Descrizione', 'Importo', 'Tipo', 'Categoria', 'ID'],
      ...transactions.map((t) => [
        t.date.toIso8601String().split('T')[0],
        t.description,
        t.amount.toString(),
        t.type.name,
        t.category,
        t.id,
      ]),
    ];
    
    return const ListToCsvConverter().convert(csvData);
  }
}

/// Risultato dell'importazione
class ImportResult {
  final bool success;
  final String? error;
  final int? importedCount;
  final List<Transaction>? transactions;
  final ImportSummary? summary;

  ImportResult({
    required this.success,
    this.error,
    this.importedCount,
    this.transactions,
    this.summary,
  });
}

/// Riepilogo dell'importazione
class ImportSummary {
  final int totalTransactions;
  final double totalIncome;
  final double totalExpenses;
  final double netAmount;
  final Map<String, int> categories;
  final DateRange dateRange;

  ImportSummary({
    required this.totalTransactions,
    required this.totalIncome,
    required this.totalExpenses,
    required this.netAmount,
    required this.categories,
    required this.dateRange,
  });
}

/// Range di date
class DateRange {
  final DateTime start;
  final DateTime end;

  DateRange(this.start, this.end);

  int get days => end.difference(start).inDays;
}
