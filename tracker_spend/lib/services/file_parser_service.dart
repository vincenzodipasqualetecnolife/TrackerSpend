import 'dart:io';
import 'dart:typed_data';
import 'package:excel/excel.dart';
import 'package:csv/csv.dart';
import 'package:file_picker/file_picker.dart';
import '../models/transaction.dart';
import '../models/category.dart';

class FileParserService {
  static const List<String> _requiredColumns = ['date', 'description', 'amount', 'type'];
  static const List<String> _optionalColumns = ['category', 'budgetId', 'metadata'];

  /// Parses an Excel file and returns a list of transactions
  static Future<List<Transaction>> parseExcelFile(String filePath) async {
    try {
      final bytes = await File(filePath).readAsBytes();
      final excel = Excel.decodeBytes(bytes);
      
      final List<Transaction> transactions = [];
      
      for (final sheet in excel.tables.keys) {
        final table = excel.tables[sheet]!;
        final headers = _extractHeaders(table);
        
        if (!_validateHeaders(headers)) {
          throw FormatException('Invalid headers in sheet: $sheet');
        }
        
        for (int row = 1; row < table.maxRows; row++) {
          final transaction = _parseRow(table, headers, row);
          if (transaction != null) {
            transactions.add(transaction);
          }
        }
      }
      
      return transactions;
    } catch (e) {
      throw Exception('Error parsing Excel file: $e');
    }
  }

  /// Parses a CSV file and returns a list of transactions
  static Future<List<Transaction>> parseCsvFile(String filePath) async {
    try {
      final input = File(filePath).readAsStringSync();
      final List<List<dynamic>> rowsAsListOfValues = const CsvToListConverter().convert(input);
      
      if (rowsAsListOfValues.isEmpty) {
        throw FormatException('CSV file is empty');
      }
      
      final headers = rowsAsListOfValues[0].cast<String>();
      
      if (!_validateHeaders(headers)) {
        throw FormatException('Invalid headers in CSV file');
      }
      
      final List<Transaction> transactions = [];
      
      for (int i = 1; i < rowsAsListOfValues.length; i++) {
        final transaction = _parseCsvRow(rowsAsListOfValues[i], headers);
        if (transaction != null) {
          transactions.add(transaction);
        }
      }
      
      return transactions;
    } catch (e) {
      throw Exception('Error parsing CSV file: $e');
    }
  }

  /// Picks a file and parses it based on its extension
  static Future<List<Transaction>> pickAndParseFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xlsx', 'xls', 'csv'],
        allowMultiple: false,
      );

      if (result == null || result.files.isEmpty) {
        throw Exception('No file selected');
      }

      final file = result.files.first;
      final filePath = file.path!;
      final extension = filePath.split('.').last.toLowerCase();

      switch (extension) {
        case 'xlsx':
        case 'xls':
          return await parseExcelFile(filePath);
        case 'csv':
          return await parseCsvFile(filePath);
        default:
          throw Exception('Unsupported file format: $extension');
      }
    } catch (e) {
      throw Exception('Error picking file: $e');
    }
  }

  /// Extracts headers from Excel table
  static List<String> _extractHeaders(dynamic table) {
    final headers = <String>[];
    for (int col = 0; col < table.maxColumns; col++) {
      final cell = table.cell(CellIndex.indexByColumnRow(columnIndex: col, rowIndex: 0));
      if (cell.value != null) {
        headers.add(cell.value.toString().toLowerCase().trim());
      }
    }
    return headers;
  }

  /// Validates that required headers are present
  static bool _validateHeaders(List<String> headers) {
    for (final requiredColumn in _requiredColumns) {
      if (!headers.contains(requiredColumn)) {
        return false;
      }
    }
    return true;
  }

  /// Parses a row from Excel table
  static Transaction? _parseRow(dynamic table, List<String> headers, int row) {
    try {
      final Map<String, dynamic> rowData = {};
      
      for (int col = 0; col < headers.length; col++) {
        final cell = table.cell(CellIndex.indexByColumnRow(columnIndex: col, rowIndex: row));
        final value = cell.value;
        
        if (value != null) {
          rowData[headers[col]] = value;
        }
      }
      
      return _createTransactionFromRowData(rowData);
    } catch (e) {
      print('Error parsing row $row: $e');
      return null;
    }
  }

  /// Parses a row from CSV
  static Transaction? _parseCsvRow(List<dynamic> row, List<String> headers) {
    try {
      final Map<String, dynamic> rowData = {};
      
      for (int i = 0; i < headers.length && i < row.length; i++) {
        final value = row[i];
        if (value != null && value.toString().isNotEmpty) {
          rowData[headers[i]] = value;
        }
      }
      
      return _createTransactionFromRowData(rowData);
    } catch (e) {
      print('Error parsing CSV row: $e');
      return null;
    }
  }

  /// Creates a Transaction object from row data
  static Transaction? _createTransactionFromRowData(Map<String, dynamic> rowData) {
    try {
      // Parse date
      final dateStr = rowData['date']?.toString() ?? '';
      DateTime? date;
      try {
        date = DateTime.parse(dateStr);
      } catch (e) {
        // Try different date formats
        final formats = [
          'dd/MM/yyyy',
          'MM/dd/yyyy',
          'yyyy-MM-dd',
          'dd-MM-yyyy',
          'MM-dd-yyyy',
        ];
        
        bool parsed = false;
        for (final format in formats) {
          try {
            date = _parseDate(dateStr, format);
            parsed = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!parsed) {
          date = null; // Use current date as fallback
        }
      }

      // Parse amount
      final amountStr = rowData['amount']?.toString() ?? '0';
      final amount = double.tryParse(amountStr.replaceAll(',', '.')) ?? 0.0;

      // Parse type
      final typeStr = rowData['type']?.toString().toLowerCase() ?? 'expense';
      final type = typeStr.contains('income') || typeStr.contains('entrata') 
          ? TransactionType.income 
          : TransactionType.expense;

      // Parse description
      final description = rowData['description']?.toString() ?? '';

      // Parse category
      final category = rowData['category']?.toString() ?? 'Altro';

      // Parse budget ID
      final budgetId = rowData['budgetId']?.toString();

      // Parse metadata
      final metadata = <String, dynamic>{};
      for (final entry in rowData.entries) {
        if (!_requiredColumns.contains(entry.key) && 
            !_optionalColumns.contains(entry.key)) {
          metadata[entry.key] = entry.value;
        }
      }

      return Transaction(
        date: date ?? DateTime.now(),
        description: description,
        amount: amount,
        type: type,
        category: category,
        budgetId: budgetId,
        metadata: metadata.isNotEmpty ? metadata : null,
      );
    } catch (e) {
      print('Error creating transaction: $e');
      return null;
    }
  }

  /// Parses date with custom format
  static DateTime _parseDate(String dateStr, String format) {
    // Simple date parsing for common formats
    final parts = dateStr.split(RegExp(r'[/\-]'));
    if (parts.length != 3) {
      throw Exception('Invalid date format');
    }

    int day, month, year;
    
    switch (format) {
      case 'dd/MM/yyyy':
      case 'dd-MM-yyyy':
        day = int.parse(parts[0]);
        month = int.parse(parts[1]);
        year = int.parse(parts[2]);
        break;
      case 'MM/dd/yyyy':
      case 'MM-dd-yyyy':
        day = int.parse(parts[1]);
        month = int.parse(parts[0]);
        year = int.parse(parts[2]);
        break;
      case 'yyyy-MM-dd':
        day = int.parse(parts[2]);
        month = int.parse(parts[1]);
        year = int.parse(parts[0]);
        break;
      default:
        throw Exception('Unsupported date format');
    }

    return DateTime(year, month, day);
  }

  /// Validates a list of transactions
  static List<String> validateTransactions(List<Transaction> transactions) {
    final errors = <String>[];
    
    for (int i = 0; i < transactions.length; i++) {
      final transaction = transactions[i];
      
      if (transaction.description.isEmpty) {
        errors.add('Row ${i + 1}: Description is empty');
      }
      
      if (transaction.amount <= 0) {
        errors.add('Row ${i + 1}: Amount must be greater than 0');
      }
      
      if (transaction.date.isAfter(DateTime.now())) {
        errors.add('Row ${i + 1}: Date cannot be in the future');
      }
    }
    
    return errors;
  }

  /// Auto-categorizes transactions based on keywords
  static List<Transaction> autoCategorizeTransactions(
    List<Transaction> transactions,
    List<Category> categories,
  ) {
    return transactions.map((transaction) {
      final category = _findBestCategory(transaction.description, categories);
      return transaction.copyWith(category: category?.name ?? 'Altro');
    }).toList();
  }

  /// Finds the best category for a transaction based on keywords
  static Category? _findBestCategory(String description, List<Category> categories) {
    final lowerDescription = description.toLowerCase();
    
    for (final category in categories) {
      for (final keyword in category.keywords) {
        if (lowerDescription.contains(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    return null;
  }
}
