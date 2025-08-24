import 'dart:io';
import 'package:excel/excel.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';
import '../models/transaction.dart';
import '../models/budget.dart';
import 'database_service.dart';

class ExportService {
  static final NumberFormat _currencyFormat = NumberFormat.currency(
    locale: 'it_IT',
    symbol: '€',
    decimalDigits: 2,
  );

  static final DateFormat _dateFormat = DateFormat('dd/MM/yyyy');

  static Future<Directory> _ensureExportDir() async {
    final dir = Directory('/app/data/exports');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  static Future<String> exportTransactionsToExcel({
    DateTime? startDate,
    DateTime? endDate,
    String? budgetId,
    List<Transaction>? transactions,
  }) async {
    final excel = Excel.createExcel();
    final sheet = excel['Transazioni'];

    final headers = [
      'Data',
      'Descrizione',
      'Categoria',
      'Tipo',
      'Importo',
      'Budget',
      'Note',
    ];

    for (int i = 0; i < headers.length; i++) {
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: i, rowIndex: 0))
        ..value = headers[i]
        ..cellStyle = CellStyle(
          bold: true,
          horizontalAlign: HorizontalAlign.Center,
          backgroundColorHex: '#E0E0E0',
        );
    }

    List<Transaction> transactionList = transactions ?? [];
    if (transactionList.isEmpty) {
      if (budgetId != null) {
        transactionList = DatabaseService.getTransactionsByBudget(budgetId);
      } else if (startDate != null && endDate != null) {
        transactionList = DatabaseService.getTransactionsByDateRange(startDate, endDate);
      } else {
        transactionList = DatabaseService.getAllTransactions();
      }
    }

    transactionList.sort((a, b) => b.date.compareTo(a.date));

    for (int i = 0; i < transactionList.length; i++) {
      final transaction = transactionList[i];
      final row = i + 1;

      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: row))
        ..value = _dateFormat.format(transaction.date);
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 1, rowIndex: row))
        ..value = transaction.description;
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 2, rowIndex: row))
        ..value = transaction.category;
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 3, rowIndex: row))
        ..value = transaction.type == TransactionType.income ? 'Entrata' : 'Uscita';
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 4, rowIndex: row))
        ..value = _currencyFormat.format(transaction.amount);
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 5, rowIndex: row))
        ..value = transaction.budgetId ?? '-';
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 6, rowIndex: row))
        ..value = transaction.metadata?['notes'] ?? '';
    }

    final directory = await _ensureExportDir();
    final fileName = 'transazioni_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final filePath = '${directory.path}/$fileName';
    final file = File(filePath);
    await file.writeAsBytes(excel.encode()!);
    return filePath;
  }

  static Future<String> exportBudgetReportToExcel(Budget budget) async {
    final excel = Excel.createExcel();
    final sheet = excel['Budget Report'];

    sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: 0))
      ..value = 'Budget: ${budget.name}'
      ..cellStyle = CellStyle(bold: true, fontSize: 16);
    sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: 1))
      ..value = 'Periodo: ${_dateFormat.format(budget.startDate)} - ${_dateFormat.format(budget.endDate)}';
    sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: 2))
      ..value = 'Budget Totale: ${_currencyFormat.format(budget.totalAmount)}';
    sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: 3))
      ..value = 'Speso: ${_currencyFormat.format(budget.spentAmount)}';
    sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: 4))
      ..value = 'Rimanente: ${_currencyFormat.format(budget.remainingAmount)}';

    final categoryHeaders = [
      'Categoria',
      'Budget Assegnato',
      'Speso',
      'Rimanente',
      '% Utilizzato',
    ];

    for (int i = 0; i < categoryHeaders.length; i++) {
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: i, rowIndex: 7))
        ..value = categoryHeaders[i]
        ..cellStyle = CellStyle(bold: true, backgroundColorHex: '#E0E0E0');
    }

    int row = 8;
    for (final category in budget.categories) {
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 0, rowIndex: row))
        ..value = category.name;
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 1, rowIndex: row))
        ..value = _currencyFormat.format(category.allocatedAmount);
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 2, rowIndex: row))
        ..value = _currencyFormat.format(category.spentAmount);
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 3, rowIndex: row))
        ..value = _currencyFormat.format(category.remainingAmount);
      sheet.cell(CellIndex.indexByColumnRow(columnIndex: 4, rowIndex: row))
        ..value = '${category.spentPercentage.toStringAsFixed(1)}%';
      row++;
    }

    final directory = await _ensureExportDir();
    final fileName = 'budget_${budget.name}_${DateTime.now().millisecondsSinceEpoch}.xlsx';
    final filePath = '${directory.path}/$fileName';
    final file = File(filePath);
    await file.writeAsBytes(excel.encode()!);
    return filePath;
  }

  static Future<String> exportTransactionsToPdf({
    DateTime? startDate,
    DateTime? endDate,
    String? budgetId,
    List<Transaction>? transactions,
  }) async {
    final pdf = pw.Document();

    List<Transaction> transactionList = transactions ?? [];
    if (transactionList.isEmpty) {
      if (budgetId != null) {
        transactionList = DatabaseService.getTransactionsByBudget(budgetId);
      } else if (startDate != null && endDate != null) {
        transactionList = DatabaseService.getTransactionsByDateRange(startDate, endDate);
      } else {
        transactionList = DatabaseService.getAllTransactions();
      }
    }

    transactionList.sort((a, b) => b.date.compareTo(a.date));

    final totalIncome = transactionList
        .where((t) => t.type == TransactionType.income)
        .fold(0.0, (sum, t) => sum + t.amount);
    final totalExpenses = transactionList
        .where((t) => t.type == TransactionType.expense)
        .fold(0.0, (sum, t) => sum + t.amount);

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        header: (context) => pw.Container(
          padding: const pw.EdgeInsets.all(10),
          decoration: const pw.BoxDecoration(color: PdfColors.grey300),
          child: pw.Text('Report Transazioni - TrackerSpend',
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
        ),
        footer: (context) => pw.Container(
          padding: const pw.EdgeInsets.all(10),
          child: pw.Text(
            'Generato il ${_dateFormat.format(DateTime.now())}',
            style: const pw.TextStyle(fontSize: 10),
          ),
        ),
        build: (context) => [
          pw.Container(
            padding: const pw.EdgeInsets.all(10),
            decoration: const pw.BoxDecoration(color: PdfColors.grey100),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text('Riepilogo',
                    style: pw.TextStyle(
                        fontSize: 16, fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 10),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Entrate Totali:'),
                    pw.Text(_currencyFormat.format(totalIncome)),
                  ],
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Uscite Totali:'),
                    pw.Text(_currencyFormat.format(totalExpenses)),
                  ],
                ),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('Saldo:'),
                    pw.Text(
                      _currencyFormat.format(totalIncome - totalExpenses),
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold,
                        color: (totalIncome - totalExpenses) >= 0
                            ? PdfColors.green
                            : PdfColors.red,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          pw.SizedBox(height: 20),
          pw.Table(
            border: pw.TableBorder.all(),
            columnWidths: const {
              0: pw.FixedColumnWidth(80),
              1: pw.FlexColumnWidth(3),
              2: pw.FixedColumnWidth(100),
              3: pw.FixedColumnWidth(80),
              4: pw.FixedColumnWidth(100),
            },
            children: [
              pw.TableRow(
                decoration: const pw.BoxDecoration(color: PdfColors.grey300),
                children: [
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Data',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Descrizione',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Categoria',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Tipo',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Importo',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                ],
              ),
              ...transactionList.map((transaction) => pw.TableRow(children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child:
                          pw.Text(_dateFormat.format(transaction.date)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(transaction.description),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(transaction.category),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(transaction.type == TransactionType.income
                          ? 'Entrata'
                          : 'Uscita'),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(
                        _currencyFormat.format(transaction.amount),
                        style: pw.TextStyle(
                          color: transaction.type == TransactionType.income
                              ? PdfColors.green
                              : PdfColors.red,
                        ),
                      ),
                    ),
                  ])),
            ],
          ),
        ],
      ),
    );

    final directory = await _ensureExportDir();
    final fileName = 'transazioni_${DateTime.now().millisecondsSinceEpoch}.pdf';
    final filePath = '${directory.path}/$fileName';
    final file = File(filePath);
    await file.writeAsBytes(await pdf.save());
    return filePath;
  }

  static Future<String> exportBudgetReportToPdf(Budget budget) async {
    final pdf = pw.Document();
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        header: (context) => pw.Container(
          padding: const pw.EdgeInsets.all(10),
          decoration: const pw.BoxDecoration(color: PdfColors.grey300),
          child: pw.Text('Report Budget - TrackerSpend',
              style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
        ),
        footer: (context) => pw.Container(
          padding: const pw.EdgeInsets.all(10),
          child: pw.Text(
            'Generato il ${_dateFormat.format(DateTime.now())}',
            style: const pw.TextStyle(fontSize: 10),
          ),
        ),
        build: (context) => [
          pw.Container(
            padding: const pw.EdgeInsets.all(10),
            decoration: const pw.BoxDecoration(color: PdfColors.grey100),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(budget.name,
                    style: pw.TextStyle(
                        fontSize: 20, fontWeight: pw.FontWeight.bold)),
                pw.SizedBox(height: 10),
                pw.Text('Descrizione: ${budget.description}'),
                pw.Text(
                    'Periodo: ${_dateFormat.format(budget.startDate)} - ${_dateFormat.format(budget.endDate)}'),
                pw.Text('Budget Totale: ${_currencyFormat.format(budget.totalAmount)}'),
                pw.Text('Speso: ${_currencyFormat.format(budget.spentAmount)}'),
                pw.Text(
                  'Rimanente: ${_currencyFormat.format(budget.remainingAmount)}',
                  style: pw.TextStyle(
                    fontWeight: pw.FontWeight.bold,
                    color: budget.remainingAmount >= 0
                        ? PdfColors.green
                        : PdfColors.red,
                  ),
                ),
                pw.Text(
                    'Percentuale Utilizzato: ${budget.spentPercentage.toStringAsFixed(1)}%'),
              ],
            ),
          ),
          pw.SizedBox(height: 20),
          pw.Text('Dettaglio per Categoria',
              style: pw.TextStyle(
                  fontSize: 16, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 10),
          pw.Table(
            border: pw.TableBorder.all(),
            columnWidths: const {
              0: pw.FlexColumnWidth(2),
              1: pw.FixedColumnWidth(100),
              2: pw.FixedColumnWidth(100),
              3: pw.FixedColumnWidth(100),
              4: pw.FixedColumnWidth(80),
            },
            children: [
              pw.TableRow(
                decoration: const pw.BoxDecoration(color: PdfColors.grey300),
                children: [
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Categoria',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Budget',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Speso',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('Rimanente',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                  pw.Padding(
                    padding: const pw.EdgeInsets.all(5),
                    child: pw.Text('%',
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ),
                ],
              ),
              ...budget.categories.map((category) => pw.TableRow(children: [
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(category.name),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(
                          _currencyFormat.format(category.allocatedAmount)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(
                          _currencyFormat.format(category.spentAmount)),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(
                        _currencyFormat.format(category.remainingAmount),
                        style: pw.TextStyle(
                          color: category.remainingAmount >= 0
                              ? PdfColors.green
                              : PdfColors.red,
                        ),
                      ),
                    ),
                    pw.Padding(
                      padding: const pw.EdgeInsets.all(5),
                      child: pw.Text(
                          '${category.spentPercentage.toStringAsFixed(1)}%'),
                    ),
                  ])),
            ],
          ),
        ],
      ),
    );

    final directory = await _ensureExportDir();
    final fileName = 'budget_${budget.name}_${DateTime.now().millisecondsSinceEpoch}.pdf';
    final filePath = '${directory.path}/$fileName';
    final file = File(filePath);
    await file.writeAsBytes(await pdf.save());
    return filePath;
  }
}


