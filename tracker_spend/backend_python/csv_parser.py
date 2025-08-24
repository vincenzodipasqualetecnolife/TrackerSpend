import csv
import pandas as pd
from datetime import datetime
import re
from typing import List, Dict, Any, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CSVTransactionParser:
    """Parser per file CSV e Excel di estratti conto bancari"""
    
    def __init__(self):
        self.supported_formats = {
            'standard': {
                'date_col': 'date',
                'description_col': 'description', 
                'amount_col': 'amount',
                'type_col': 'type',
                'category_col': 'category'
            },
            'intesa_sanpaolo': {
                'date_col': 'Data',
                'description_col': 'Descrizione',
                'amount_col': 'Importo',
                'type_col': None,  # Da determinare dal segno
                'category_col': None
            },
            'unicredit': {
                'date_col': 'Data',
                'description_col': 'Causale',
                'amount_col': 'Importo',
                'type_col': None,
                'category_col': None
            },
            'poste_italiane': {
                'date_col': 'Data',
                'description_col': 'Descrizione',
                'amount_col': 'Importo',
                'type_col': None,
                'category_col': None
            },
            'modern_bank': {
                'date_col': 'Data',
                'description_col': 'Dettagli',
                'amount_col': 'Importo',
                'operation_col': 'Operazione',
                'category_col': 'Categoria',
                'account_col': 'Conto o carta',
                'status_col': 'Contabilizzazione',
                'currency_col': 'Valuta'
            }
        }
        
        # Categorie predefinite per la categorizzazione automatica
        self.category_keywords = {
            'Alimentari': [
                'supermercato', 'conad', 'esselunga', 'carrefour', 'coop', 'lidl', 'aldi',
                'pane', 'latte', 'frutta', 'verdura', 'macelleria', 'pescheria',
                'ristorante', 'pizzeria', 'bar', 'caffè', 'gelato', 'fast food'
            ],
            'Trasporti': [
                'benzina', 'diesel', 'enel', 'eni', 'q8', 'esso', 'shell', 'ip',
                'metro', 'bus', 'treno', 'taxi', 'uber', 'noleggio', 'parcheggio',
                'autostrada', 'pedaggio', 'assicurazione', 'bollo'
            ],
            'Casa': [
                'bolletta', 'luce', 'gas', 'acqua', 'riscaldamento', 'condominio',
                'affitto', 'mutuo', 'spese condominiali', 'elettricità'
            ],
            'Shopping': [
                'vestiti', 'abbigliamento', 'scarpe', 'borsa', 'accessori',
                'h&m', 'zara', 'uniqlo', 'nike', 'adidas', 'decathlon',
                'amazon', 'ebay', 'aliexpress', 'shopping online'
            ],
            'Salute': [
                'farmacia', 'medico', 'ospedale', 'visita', 'esame', 'analisi',
                'palestra', 'fitness', 'piscina', 'massaggio', 'dentista'
            ],
            'Intrattenimento': [
                'cinema', 'teatro', 'concerto', 'museo', 'mostra', 'disco',
                'netflix', 'spotify', 'youtube', 'gaming', 'videogiochi'
            ],
            'Lavoro': [
                'stipendio', 'bonus', 'premio', 'commissione', 'freelance',
                'ufficio', 'materiale', 'corso', 'formazione'
            ],
            'Risparmio': [
                'investimento', 'fondi', 'azioni', 'obbligazioni', 'deposito',
                'risparmio', 'conto deposito', 'piano accumulo'
            ]
        }
    
    def detect_file_type(self, file_path: str) -> str:
        """Rileva se il file è CSV o Excel"""
        if file_path.lower().endswith(('.xlsx', '.xls')):
            return 'excel'
        else:
            return 'csv'
    
    def detect_format(self, file_path: str) -> str:
        """Rileva automaticamente il formato del file (CSV o Excel)"""
        file_type = self.detect_file_type(file_path)
        
        if file_type == 'excel':
            return self._detect_excel_format(file_path)
        else:
            return self._detect_csv_format(file_path)
    
    def _detect_excel_format(self, file_path: str) -> str:
        """Rileva automaticamente il formato del file Excel"""
        try:
            df = pd.read_excel(file_path, nrows=5)  # Legge le prime 5 righe per analizzare
            headers = df.columns.tolist()
            headers_lower = [h.lower() for h in headers]
            
            logger.info(f"=== DEBUG RILEVAMENTO FORMATO EXCEL ===")
            logger.info(f"Header originali: {headers}")
            logger.info(f"Header lowercase: {headers_lower}")
            logger.info(f"Prime 3 righe del file:")
            for i in range(min(3, len(df))):
                row_values = list(df.iloc[i])
                logger.info(f"Riga {i}: {row_values}")
            
            # Se tutte le colonne sono Unnamed, prova a usare la prima riga come header
            if all(col.startswith('Unnamed:') for col in headers):
                logger.info("Tutte le colonne sono Unnamed, provo a usare la prima riga come header")
                first_row = df.iloc[0].tolist()
                first_row_lower = [str(cell).lower() for cell in first_row]
                logger.info(f"Prima riga come header: {first_row}")
                logger.info(f"Prima riga lowercase: {first_row_lower}")
                
                # Controlla se la prima riga contiene gli header del formato modern_bank
                if 'data' in first_row_lower and 'dettagli' in first_row_lower and 'importo' in first_row_lower:
                    logger.info("Rilevato formato modern_bank dalla prima riga")
                    return 'modern_bank'
                elif 'data' in first_row_lower and 'descrizione' in first_row_lower:
                    if 'causale' in first_row_lower:
                        logger.info("Rilevato formato unicredit dalla prima riga")
                        return 'unicredit'
                    else:
                        logger.info("Rilevato formato intesa_sanpaolo dalla prima riga")
                        return 'intesa_sanpaolo'
                elif 'data' in first_row_lower and 'causale' in first_row_lower:
                    logger.info("Rilevato formato unicredit dalla prima riga")
                    return 'unicredit'
                elif all(col in first_row_lower for col in ['date', 'description', 'amount']):
                    logger.info("Rilevato formato standard dalla prima riga")
                    return 'standard'
                else:
                    logger.info(f"Nessun formato riconosciuto nella prima riga: {first_row_lower}")
            
            # Controlla i formati supportati negli header originali
            if 'data' in headers_lower and 'dettagli' in headers_lower and 'importo' in headers_lower:
                logger.info("Rilevato formato modern_bank dagli header")
                return 'modern_bank'
            elif 'data' in headers_lower and 'descrizione' in headers_lower:
                if 'causale' in headers_lower:
                    logger.info("Rilevato formato unicredit dagli header")
                    return 'unicredit'
                else:
                    logger.info("Rilevato formato intesa_sanpaolo dagli header")
                    return 'intesa_sanpaolo'
            elif 'data' in headers_lower and 'causale' in headers_lower:
                logger.info("Rilevato formato unicredit dagli header")
                return 'unicredit'
            elif all(col in headers_lower for col in ['date', 'description', 'amount']):
                logger.info("Rilevato formato standard dagli header")
                return 'standard'
            else:
                logger.info("Nessun formato specifico rilevato, uso standard come fallback")
                return 'standard'  # Fallback
                
        except Exception as e:
            logger.error(f"Errore nel rilevamento formato Excel: {e}")
            return 'standard'
    
    def _detect_csv_format(self, file_path: str) -> str:
        """Rileva automaticamente il formato del CSV"""
        # Prova diverse codifiche per leggere l'header
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'windows-1252', 'cp1252']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    reader = csv.reader(file)
                    headers = next(reader, [])
                    
                headers_lower = [h.lower() for h in headers]
                
                # Controlla i formati supportati
                if 'data' in headers_lower and 'dettagli' in headers_lower and 'importo' in headers_lower:
                    return 'modern_bank'
                elif 'data' in headers_lower and 'descrizione' in headers_lower:
                    if 'causale' in headers_lower:
                        return 'unicredit'
                    else:
                        return 'intesa_sanpaolo'
                elif 'data' in headers_lower and 'causale' in headers_lower:
                    return 'unicredit'
                elif all(col in headers_lower for col in ['date', 'description', 'amount']):
                    return 'standard'
                else:
                    return 'standard'  # Fallback
                    
            except UnicodeDecodeError:
                continue
            except Exception as e:
                logger.warning(f"Errore con encoding {encoding}: {e}")
                continue
        
        logger.error("Impossibile rilevare il formato del file CSV")
        return 'standard'
    
    def parse_file(self, file_path: str, format_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parsa il file (CSV o Excel) e restituisce le transazioni"""
        try:
            file_type = self.detect_file_type(file_path)
            
            if not format_type:
                format_type = self.detect_format(file_path)
            
            logger.info(f"Parsing file {file_path} (tipo: {file_type}) con formato {format_type}")
            
            result = None
            if file_type == 'excel':
                result = self._parse_excel_file(file_path, format_type)
            else:
                result = self._parse_csv_file(file_path, format_type)
            
            logger.info(f"Risultato parsing: {type(result)}, lunghezza: {len(result) if result else 0}")
            if result and len(result) > 0:
                logger.info(f"Prima transazione parsata: {result[0]}")
            
            return result
                
        except Exception as e:
            logger.error(f"Errore nel parsing file: {e}")
            raise
    
    def parse_csv(self, file_path: str, format_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Parsa il file CSV e restituisce le transazioni (metodo legacy per compatibilità)"""
        return self.parse_file(file_path, format_type)
    
    def _parse_csv_file(self, file_path: str, format_type: str) -> List[Dict[str, Any]]:
        """Parsa il file CSV e restituisce le transazioni"""
        if format_type == 'standard':
            return self._parse_standard_csv(file_path)
        elif format_type in ['intesa_sanpaolo', 'unicredit', 'poste_italiane', 'modern_bank']:
            return self._parse_bank_csv(file_path, format_type)
        else:
            raise ValueError(f"Formato non supportato: {format_type}")
    
    def _parse_excel_file(self, file_path: str, format_type: str) -> List[Dict[str, Any]]:
        """Parsa il file Excel e restituisce le transazioni"""
        try:
            # Carica il file Excel senza header per vedere tutte le righe
            df = pd.read_excel(file_path, header=None)
            logger.info(f"📌 File caricato con {len(df)} righe totali")
            logger.info(f"📋 Prime 5 righe del file:")
            for i in range(min(5, len(df))):
                logger.info(f"Riga {i}: {list(df.iloc[i])}")
            
            # Cerca la riga che contiene l'header (cerca "Data", "Operazione", "Dettagli", "Importo")
            header_row = None
            for i in range(min(25, len(df))):  # Controlla le prime 25 righe per modern_bank
                row_values = [str(cell).lower() for cell in df.iloc[i] if pd.notna(cell)]
                logger.info(f"🔍 Controllo riga {i}: {row_values}")
                if 'data' in row_values and ('operazione' in row_values or 'dettagli' in row_values or 'importo' in row_values):
                    header_row = i
                    logger.info(f"🎯 Header trovato alla riga {i}: {list(df.iloc[i])}")
                    break
            
            if header_row is None:
                logger.error("❌ Header non trovato nelle prime 20 righe")
                return []
            
            # Usa la riga trovata come header e prendi i dati da quella riga in poi
            df_with_header = df.iloc[header_row:].copy()
            df_with_header.columns = df_with_header.iloc[0]
            df_with_header = df_with_header.iloc[1:].reset_index(drop=True)
            
            logger.info(f"📌 Colonne dopo header: {df_with_header.columns.tolist()}")
            logger.info(f"📊 Righe di dati: {len(df_with_header)}")
            
            # Mostra le prime righe di dati per debug
            logger.info("📋 Prime 3 righe di dati:")
            for i in range(min(3, len(df_with_header))):
                logger.info(f"Riga {i}: {list(df_with_header.iloc[i])}")
            
            # Se è formato modern_bank, usa il parser specifico
            if format_type == 'modern_bank':
                logger.info("🎯 Usando parser specifico per modern_bank")
                return self._parse_modern_bank_excel(df_with_header)
            
            # Parsa le transazioni per altri formati
            transactions = []
            for index, row in df_with_header.iterrows():
                try:
                    # Cerca le colonne per data, descrizione, importo
                    date_col = None
                    desc_col = None
                    amount_col = None
                    operation_col = None
                    
                    # Cerca colonne che potrebbero contenere la data
                    for col in df_with_header.columns:
                        col_lower = str(col).lower()
                        if any(keyword in col_lower for keyword in ['data', 'date', 'giorno']):
                            date_col = col
                            break
                    
                    # Cerca colonne per la descrizione
                    for col in df_with_header.columns:
                        col_lower = str(col).lower()
                        if any(keyword in col_lower for keyword in ['descrizione', 'dettagli', 'causale', 'note', 'description']):
                            desc_col = col
                            break
                    
                    # Cerca colonne per l'operazione
                    for col in df_with_header.columns:
                        col_lower = str(col).lower()
                        if any(keyword in col_lower for keyword in ['operazione', 'operation']):
                            operation_col = col
                            break
                    
                    # Cerca colonne per l'importo
                    for col in df_with_header.columns:
                        col_lower = str(col).lower()
                        if any(keyword in col_lower for keyword in ['importo', 'amount', 'euro', '€', 'valore']):
                            amount_col = col
                            break
                    
                    if date_col and amount_col:
                        # Gestisci la data (può essere stringa o datetime)
                        date_value = row[date_col]
                        if pd.notna(date_value):
                            if isinstance(date_value, str):
                                date_str = date_value
                            elif hasattr(date_value, 'strftime'):  # È un oggetto datetime
                                date_str = date_value.strftime('%Y-%m-%d')
                            else:
                                date_str = str(date_value)
                        else:
                            date_str = None
                        
                        desc_str = str(row[desc_col]) if desc_col and pd.notna(row[desc_col]) else ""
                        operation_str = str(row[operation_col]) if operation_col and pd.notna(row[operation_col]) else ""
                        amount_str = str(row[amount_col]) if pd.notna(row[amount_col]) else None
                        
                        if date_str and amount_str and date_str != 'nan' and amount_str != 'nan':
                            # Parsa la data
                            parsed_date = self._parse_date(date_str)
                            if not parsed_date:
                                logger.warning(f"Data non valida: {date_str}")
                                continue
                            
                            # Parsa l'importo
                            parsed_amount = self._parse_amount(amount_str)
                            if parsed_amount is None:
                                logger.warning(f"Importo non valido: {amount_str}")
                                continue
                            
                            # Combina operazione e dettagli per la descrizione
                            description = ""
                            if operation_str and operation_str != 'nan':
                                description += operation_str.strip()
                            if desc_str and desc_str != 'nan':
                                if description:
                                    description += ": " + desc_str.strip()
                                else:
                                    description = desc_str.strip()
                            
                            if not description:
                                description = "Transazione senza descrizione"
                            
                            # Determina il tipo di transazione
                            transaction_type = self._determine_transaction_type(parsed_amount, 'standard')
                            
                            # Categorizza automaticamente
                            category = self._auto_categorize(description)
                            
                            transaction = {
                                'transaction_date': parsed_date,
                                'description': description,
                                'amount': abs(parsed_amount),
                                'type': transaction_type,
                                'category': category,
                                'bank': 'intesa_sanpaolo'
                            }
                            
                            transactions.append(transaction)
                            logger.info(f"✅ Transazione aggiunta: {transaction}")
                
                except Exception as e:
                    logger.error(f"❌ Errore nel parsing della riga {index}: {e}")
                    continue
            
            logger.info(f"🎉 Risultato parsing: {len(transactions)} transazioni")
            return transactions
                
        except Exception as e:
            logger.error(f"❌ Errore nel parsing Excel: {e}")
            raise
    
    def _parse_standard_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Parsa CSV in formato standard"""
        transactions = []
        
        # Prova diverse codifiche
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'windows-1252', 'cp1252']
        file_content = None
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    file_content = file.read()
                logger.info(f"File standard letto con successo usando encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue
            except Exception as e:
                logger.warning(f"Errore con encoding {encoding}: {e}")
                continue
        
        if file_content is None:
            raise ValueError("Impossibile leggere il file CSV con nessuna codifica supportata")
        
        # Usa StringIO per creare un file-like object
        from io import StringIO
        file_obj = StringIO(file_content)
        reader = csv.DictReader(file_obj)
        
        # Debug: mostra le prime righe del file
        logger.info(f"Header CSV: {reader.fieldnames}")
        logger.info(f"Prime 3 righe del file:")
        file_obj.seek(0)  # Reset alla posizione iniziale
        for i, row in enumerate(csv.DictReader(StringIO(file_content))):
            if i < 3:
                logger.info(f"Riga {i+1}: {row}")
            else:
                break
        
        for row in reader:
            try:
                # Pulisci e valida i dati
                date = self._parse_date(row.get('date', ''))
                description = row.get('description', '').strip()
                amount = self._parse_amount(row.get('amount', ''))
                transaction_type = row.get('type', 'expense').lower()
                category = row.get('category', '').strip()
                
                if not all([date, description, amount]):
                    continue
                
                # Categorizzazione automatica se non specificata
                if not category:
                    category = self._auto_categorize(description)
                
                transactions.append({
                    'transaction_date': date,
                    'description': description,
                    'amount': amount,
                    'type': transaction_type,
                    'category': category,
                    'original_row': row
                })
                
            except Exception as e:
                logger.warning(f"Errore nel parsing riga: {e}")
                continue
        
        return transactions
    
    def _parse_standard_excel(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parsa un file Excel con formato standard"""
        logger.info(f"Parsing Excel standard. Colonne disponibili: {list(df.columns)}")
        
        # Se tutte le colonne sono Unnamed, prova a usare la prima riga come header
        if all(col.startswith('Unnamed:') for col in df.columns):
            logger.info("Tutte le colonne sono Unnamed, provo a usare la prima riga come header")
            logger.info(f"Prime 3 righe del file:")
            for i in range(min(3, len(df))):
                logger.info(f"Riga {i}: {list(df.iloc[i])}")
            
            # Prova a usare la prima riga come header
            df_with_header = df.copy()
            df_with_header.columns = df.iloc[0]
            df_with_header = df_with_header.iloc[1:].reset_index(drop=True)
            logger.info(f"Nuove colonne dopo header: {list(df_with_header.columns)}")
            
            # Ora prova a parsare con le nuove colonne
            return self._parse_standard_excel_with_headers(df_with_header)
        
        # Altrimenti usa il formato standard
        return self._parse_standard_excel_with_headers(df)
    
    def _parse_standard_excel_with_headers(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parsa un file Excel con header già impostati"""
        logger.info(f"Parsing Excel con header: {list(df.columns)}")
        
        transactions = []
        for index, row in df.iterrows():
            try:
                # Cerca le colonne per data, descrizione, importo
                date_col = None
                desc_col = None
                amount_col = None
                
                # Cerca colonne che potrebbero contenere la data
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(keyword in col_lower for keyword in ['data', 'date', 'giorno']):
                        date_col = col
                        break
                
                # Cerca colonne per la descrizione
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(keyword in col_lower for keyword in ['descrizione', 'dettagli', 'causale', 'note', 'description']):
                        desc_col = col
                        break
                
                # Cerca colonne per l'importo
                for col in df.columns:
                    col_lower = str(col).lower()
                    if any(keyword in col_lower for keyword in ['importo', 'amount', 'euro', '€', 'valore']):
                        amount_col = col
                        break
                
                logger.info(f"Riga {index}: date_col={date_col}, desc_col={desc_col}, amount_col={amount_col}")
                
                if date_col and desc_col and amount_col:
                    date_str = str(row[date_col]) if pd.notna(row[date_col]) else None
                    desc_str = str(row[desc_col]) if pd.notna(row[desc_col]) else None
                    amount_str = str(row[amount_col]) if pd.notna(row[amount_col]) else None
                    
                    logger.info(f"Valori trovati: date='{date_str}', desc='{desc_str}', amount='{amount_str}'")
                    
                    if date_str and desc_str and amount_str:
                        # Parsa la data
                        parsed_date = self._parse_date(date_str)
                        if not parsed_date:
                            logger.warning(f"Data non valida: {date_str}")
                            continue
                        
                        # Parsa l'importo
                        parsed_amount = self._parse_amount(amount_str)
                        if parsed_amount is None:
                            logger.warning(f"Importo non valido: {amount_str}")
                            continue
                        
                        # Determina il tipo di transazione
                        transaction_type = self._determine_transaction_type(parsed_amount, 'standard')
                        
                        # Categorizza automaticamente
                        category = self._auto_categorize(desc_str)
                        
                        transaction = {
                            'transaction_date': parsed_date,
                            'description': desc_str.strip(),
                            'amount': parsed_amount,
                            'type': transaction_type,
                            'category': category,
                            'bank': 'standard'
                        }
                        
                        transactions.append(transaction)
                        logger.info(f"Transazione aggiunta: {transaction}")
                
            except Exception as e:
                logger.error(f"Errore nel parsing della riga {index}: {e}")
                continue
        
        logger.info(f"Risultato parsing: {type(transactions)}, lunghezza: {len(transactions)}")
        return transactions
    
    def _parse_bank_excel(self, df: pd.DataFrame, bank_type: str) -> List[Dict[str, Any]]:
        """Parsa DataFrame Excel di banche specifiche"""
        if bank_type == 'modern_bank':
            return self._parse_modern_bank_excel(df)
        
        transactions = []
        format_config = self.supported_formats[bank_type]
        
        logger.info(f"Parsing Excel banca {bank_type}. Colonne disponibili: {df.columns.tolist()}")
        
        for index, row in df.iterrows():
            try:
                # Estrai i dati secondo il formato della banca
                date = self._parse_date(str(row.get(format_config['date_col'], '')))
                description = str(row.get(format_config['description_col'], '')).strip()
                amount_str = str(row.get(format_config['amount_col'], ''))
                
                # Pulisci l'importo (rimuovi simboli di valuta, spazi, ecc.)
                amount = self._parse_bank_amount(amount_str)
                
                if not all([date, description, amount]):
                    continue
                
                # Determina il tipo dalla banca
                transaction_type = self._determine_transaction_type(amount, bank_type)
                
                # Categorizzazione automatica
                category = self._auto_categorize(description)
                
                transactions.append({
                    'transaction_date': date,
                    'description': description,
                    'amount': abs(amount),  # Salva sempre valore positivo
                    'type': transaction_type,
                    'category': category,
                    'original_row': row.to_dict()
                })
                
            except Exception as e:
                logger.warning(f"Errore nel parsing riga Excel banca {bank_type} {index}: {e}")
                continue
        
        return transactions
    
    def _parse_modern_bank_excel(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Parsa DataFrame Excel in formato modern_bank (formato del tuo file Excel)"""
        transactions = []
        format_config = self.supported_formats['modern_bank']
        
        logger.info(f"Parsing Excel modern_bank. Colonne disponibili: {df.columns.tolist()}")
        
        # Se tutte le colonne sono Unnamed, usa la prima riga come header
        if all(col.startswith('Unnamed:') for col in df.columns):
            logger.info("Colonne Unnamed rilevate, uso la prima riga come header")
            df_with_header = df.copy()
            df_with_header.columns = df.iloc[0]
            df_with_header = df_with_header.iloc[1:].reset_index(drop=True)
            logger.info(f"Nuove colonne dopo header: {list(df_with_header.columns)}")
            df = df_with_header
        else:
            logger.info(f"Colonne già processate: {list(df.columns)}")
        
        for index, row in df.iterrows():
            try:
                # Estrai i dati secondo il formato modern_bank
                date = self._parse_modern_date(str(row.get(format_config['date_col'], '')))
                operation = str(row.get(format_config['operation_col'], '')).strip()
                details = str(row.get(format_config['description_col'], '')).strip()
                amount_str = str(row.get(format_config['amount_col'], ''))
                category = str(row.get(format_config['category_col'], '')).strip()
                account = str(row.get(format_config['account_col'], '')).strip()
                status = str(row.get(format_config['status_col'], '')).strip()
                currency = str(row.get(format_config['currency_col'], '')).strip()
                
                logger.info(f"Riga {index}: date='{date}', operation='{operation}', details='{details}', amount='{amount_str}'")
                
                # Pulisci l'importo
                amount = self._parse_modern_amount(amount_str)
                
                if not all([date, details, amount]):
                    logger.warning(f"Riga Excel {index} saltata: dati mancanti (date={date}, details={details}, amount={amount})")
                    continue
                
                # Combina operazione e dettagli per la descrizione
                description = f"{operation}: {details}" if operation else details
                
                # Determina il tipo (tutti gli importi sono negativi = spese)
                transaction_type = 'expense' if amount < 0 else 'income'
                
                # Usa la categoria del file se presente, altrimenti auto-categorizza
                if not category or category.lower() in ['uncategorized', '']:
                    category = self._auto_categorize(description)
                
                transaction = {
                    'transaction_date': date,
                    'description': description,
                    'amount': abs(amount),  # Salva sempre valore positivo
                    'type': transaction_type,
                    'category': category,
                    'account': account,
                    'status': status,
                    'currency': currency,
                    'original_row': row.to_dict()
                }
                
                transactions.append(transaction)
                logger.info(f"Transazione aggiunta: {transaction}")
                
            except Exception as e:
                logger.warning(f"Errore nel parsing riga Excel modern_bank {index}: {e}")
                continue
        
        logger.info(f"Risultato parsing modern_bank: {len(transactions)} transazioni")
        return transactions
    
    def _parse_bank_csv(self, file_path: str, bank_type: str) -> List[Dict[str, Any]]:
        """Parsa CSV di banche specifiche"""
        if bank_type == 'modern_bank':
            return self._parse_modern_bank_csv(file_path)
        
        transactions = []
        format_config = self.supported_formats[bank_type]
        
        # Prova diverse codifiche
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'windows-1252', 'cp1252']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(file_path, encoding=encoding)
                logger.info(f"File letto con successo usando encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue
            except Exception as e:
                logger.warning(f"Errore con encoding {encoding}: {e}")
                continue
        
        if df is None:
            raise ValueError("Impossibile leggere il file CSV con nessuna codifica supportata")
        
        for _, row in df.iterrows():
            try:
                # Estrai i dati secondo il formato della banca
                date = self._parse_date(str(row.get(format_config['date_col'], '')))
                description = str(row.get(format_config['description_col'], '')).strip()
                amount_str = str(row.get(format_config['amount_col'], ''))
                
                # Pulisci l'importo (rimuovi simboli di valuta, spazi, ecc.)
                amount = self._parse_bank_amount(amount_str)
                
                if not all([date, description, amount]):
                    continue
                
                # Determina il tipo dalla banca
                transaction_type = self._determine_transaction_type(amount, bank_type)
                
                # Categorizzazione automatica
                category = self._auto_categorize(description)
                
                transactions.append({
                    'transaction_date': date,
                    'description': description,
                    'amount': abs(amount),  # Salva sempre valore positivo
                    'type': transaction_type,
                    'category': category,
                    'original_row': row.to_dict()
                })
                
            except Exception as e:
                logger.warning(f"Errore nel parsing riga banca {bank_type}: {e}")
                continue
        
        return transactions
    
    def _parse_modern_bank_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """Parsa CSV in formato modern_bank (formato del tuo file Excel)"""
        transactions = []
        format_config = self.supported_formats['modern_bank']
        
        # Prova diverse codifiche
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'windows-1252', 'cp1252']
        df = None
        
        for encoding in encodings:
            try:
                df = pd.read_csv(file_path, encoding=encoding)
                logger.info(f"File modern_bank letto con successo usando encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue
            except Exception as e:
                logger.warning(f"Errore con encoding {encoding}: {e}")
                continue
        
        if df is None:
            raise ValueError("Impossibile leggere il file CSV con nessuna codifica supportata")
        
        logger.info(f"Colonne trovate: {df.columns.tolist()}")
        
        for index, row in df.iterrows():
            try:
                # Estrai i dati secondo il formato modern_bank
                date = self._parse_modern_date(str(row.get(format_config['date_col'], '')))
                operation = str(row.get(format_config['operation_col'], '')).strip()
                details = str(row.get(format_config['description_col'], '')).strip()
                amount_str = str(row.get(format_config['amount_col'], ''))
                category = str(row.get(format_config['category_col'], '')).strip()
                account = str(row.get(format_config['account_col'], '')).strip()
                status = str(row.get(format_config['status_col'], '')).strip()
                currency = str(row.get(format_config['currency_col'], '')).strip()
                
                # Pulisci l'importo
                amount = self._parse_modern_amount(amount_str)
                
                if not all([date, details, amount]):
                    logger.warning(f"Riga {index} saltata: dati mancanti (date={date}, details={details}, amount={amount})")
                    continue
                
                # Combina operazione e dettagli per la descrizione
                description = f"{operation}: {details}" if operation else details
                
                # Determina il tipo (tutti gli importi sono negativi = spese)
                transaction_type = 'expense' if amount < 0 else 'income'
                
                # Usa la categoria del file se presente, altrimenti auto-categorizza
                if not category or category.lower() in ['uncategorized', '']:
                    category = self._auto_categorize(description)
                
                transactions.append({
                    'transaction_date': date,
                    'description': description,
                    'amount': abs(amount),  # Salva sempre valore positivo
                    'type': transaction_type,
                    'category': category,
                    'account': account,
                    'status': status,
                    'currency': currency,
                    'original_row': row.to_dict()
                })
                
            except Exception as e:
                logger.warning(f"Errore nel parsing riga modern_bank {index}: {e}")
                continue
        
        return transactions
    
    def _parse_date(self, date_str: str) -> Optional[str]:
        """Converte stringa data in formato ISO"""
        if not date_str or date_str.strip() == '':
            return None
            
        date_str = date_str.strip()
        
        # Prova diversi formati di data
        date_formats = [
            '%Y-%m-%d',
            '%d/%m/%Y',
            '%d-%m-%Y',
            '%d/%m/%y',
            '%d-%m-%y',
            '%Y/%m/%d'
        ]
        
        for fmt in date_formats:
            try:
                date_obj = datetime.strptime(date_str, fmt)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        logger.warning(f"Formato data non riconosciuto: {date_str}")
        return None
    
    def _parse_modern_date(self, date_str: str) -> Optional[str]:
        """Converte stringa data in formato modern_bank (MM/GG/AAAA) in formato ISO"""
        if not date_str or date_str.strip() == '':
            return None
            
        date_str = date_str.strip()
        
        # Formato specifico del tuo file: MM/GG/AAAA
        try:
            date_obj = datetime.strptime(date_str, '%m/%d/%Y')
            return date_obj.strftime('%Y-%m-%d')
        except ValueError:
            # Fallback ai formati standard
            return self._parse_date(date_str)
    
    def _parse_amount(self, amount_str: str) -> Optional[float]:
        """Converte stringa importo in float"""
        if not amount_str or amount_str.strip() == '':
            return None
            
        try:
            # Rimuovi simboli di valuta e spazi
            cleaned = re.sub(r'[€$£¥\s]', '', amount_str.strip())
            # Sostituisci virgola con punto per decimali
            cleaned = cleaned.replace(',', '.')
            return float(cleaned)
        except ValueError:
            logger.warning(f"Importo non valido: {amount_str}")
            return None
    
    def _parse_bank_amount(self, amount_str: str) -> Optional[float]:
        """Parsa importo da formato bancario"""
        if not amount_str or amount_str.strip() == '':
            return None
            
        try:
            # Rimuovi simboli di valuta, spazi e caratteri non numerici
            cleaned = re.sub(r'[€$£¥\s]', '', amount_str.strip())
            
            # Gestisci formati con parentesi (addebiti)
            if '(' in cleaned and ')' in cleaned:
                cleaned = cleaned.replace('(', '-').replace(')', '')
            
            # Sostituisci virgola con punto per decimali
            cleaned = cleaned.replace(',', '.')
            
            return float(cleaned)
        except ValueError:
            logger.warning(f"Importo bancario non valido: {amount_str}")
            return None
    
    def _parse_modern_amount(self, amount_str: str) -> Optional[float]:
        """Parsa importo da formato modern_bank (gestisce importi negativi)"""
        if not amount_str or amount_str.strip() == '':
            return None
            
        try:
            # Rimuovi simboli di valuta, spazi e caratteri non numerici
            cleaned = re.sub(r'[€$£¥\s]', '', amount_str.strip())
            
            # Gestisci formati con parentesi (addebiti)
            if '(' in cleaned and ')' in cleaned:
                cleaned = cleaned.replace('(', '-').replace(')', '')
            
            # Sostituisci virgola con punto per decimali
            cleaned = cleaned.replace(',', '.')
            
            return float(cleaned)
        except ValueError:
            logger.warning(f"Importo modern_bank non valido: {amount_str}")
            return None
    
    def _determine_transaction_type(self, amount: float, bank_type: str) -> str:
        """Determina il tipo di transazione dal segno dell'importo"""
        if amount > 0:
            return 'income'
        else:
            return 'expense'
    
    def _auto_categorize(self, description: str) -> str:
        """Categorizza automaticamente la transazione basandosi sulla descrizione"""
        description_lower = description.lower()
        
        for category, keywords in self.category_keywords.items():
            for keyword in keywords:
                if keyword.lower() in description_lower:
                    return category
        
        return 'Altro'  # Categoria di default
    
    def validate_transactions(self, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Valida le transazioni parsate e restituisce statistiche"""
        if not transactions:
            return {
                'valid': False,
                'error': 'Nessuna transazione trovata',
                'stats': {}
            }
        
        valid_transactions = []
        errors = []
        
        for i, trans in enumerate(transactions):
            # Controlla sia 'date' che 'transaction_date' per compatibilità
            date = trans.get('date') or trans.get('transaction_date')
            if not date:
                errors.append(f"Riga {i+1}: Data mancante")
                continue
            if not trans.get('description'):
                errors.append(f"Riga {i+1}: Descrizione mancante")
                continue
            if not trans.get('amount') or trans['amount'] == 0:
                errors.append(f"Riga {i+1}: Importo mancante o zero")
                continue
            
            valid_transactions.append(trans)
        
        # Calcola statistiche
        total_income = sum(t['amount'] for t in valid_transactions if t['type'] == 'income')
        total_expenses = sum(t['amount'] for t in valid_transactions if t['type'] == 'expense')
        
        stats = {
            'total_transactions': len(valid_transactions),
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_amount': total_income - total_expenses,
            'errors_count': len(errors),
            'errors': errors,
            'categories': list(set(t['category'] for t in valid_transactions))
        }
        
        return {
            'valid': len(errors) == 0,
            'transactions': valid_transactions,
            'stats': stats
        }
    
    def convert_excel_to_csv(self, excel_file_path: str, csv_file_path: str = None) -> str:
        """Converte un file Excel in CSV"""
        try:
            if not csv_file_path:
                # Genera automaticamente il nome del file CSV
                base_name = excel_file_path.rsplit('.', 1)[0]
                csv_file_path = f"{base_name}.csv"
            
            # Legge il file Excel
            df = pd.read_excel(excel_file_path)
            
            # Salva come CSV senza indici
            df.to_csv(csv_file_path, index=False, encoding='utf-8')
            
            logger.info(f"Conversione completata! File salvato come: {csv_file_path}")
            return csv_file_path
            
        except Exception as e:
            logger.error(f"Errore nella conversione Excel to CSV: {e}")
            raise
