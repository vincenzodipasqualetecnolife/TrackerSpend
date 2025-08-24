import mysql.connector
from mysql.connector import Error
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TransactionService:
    """Servizio per la gestione delle transazioni nel database"""
    
    def __init__(self, db_config: Dict[str, Any]):
        self.db_config = db_config
    
    def get_db_connection(self):
        """Crea connessione al database"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            return connection
        except Error as e:
            logger.error(f"Errore connessione MySQL: {e}")
            return None
    
    def create_transactions_table(self):
        """Crea la tabella transazioni se non esiste"""
        connection = self.get_db_connection()
        if not connection:
            return False
        
        try:
            cursor = connection.cursor()
            
            # Crea tabella transazioni
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS transactions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    transaction_date DATE NOT NULL,
                    description VARCHAR(255) NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    type ENUM('income', 'expense') NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_user_date (user_id, transaction_date),
                    INDEX idx_category (category),
                    INDEX idx_type (type),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            # Aggiungi colonna category se non esiste (migrazione)
            try:
                cursor.execute("ALTER TABLE transactions ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Altro'")
                logger.info("Colonna 'category' aggiunta alla tabella transactions")
            except Error as e:
                if "Duplicate column name" in str(e):
                    logger.info("Colonna 'category' già esistente")
                else:
                    logger.warning(f"Errore aggiunta colonna category: {e}")
            
            # Crea tabella categorie personalizzate
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    color VARCHAR(7) DEFAULT '#3B82F6',
                    icon VARCHAR(50) DEFAULT 'tag',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_user_category (user_id, name),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            
            connection.commit()
            cursor.close()
            connection.close()
            return True
            
        except Error as e:
            logger.error(f"Errore creazione tabelle: {e}")
            if connection:
                connection.close()
            return False
    
    def save_transactions(self, user_id: int, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Salva le transazioni nel database"""
        connection = self.get_db_connection()
        if not connection:
            return {
                'success': False,
                'error': 'Errore connessione database',
                'saved_count': 0
            }
        
        try:
            cursor = connection.cursor()
            
            # Prepara la query di inserimento
            insert_query = """
                INSERT INTO transactions (user_id, transaction_date, description, amount, type, category)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            
            saved_count = 0
            errors = []
            
            for i, transaction in enumerate(transactions):
                try:
                    # Valida i dati
                    if not all(key in transaction for key in ['transaction_date', 'description', 'amount', 'type', 'category']):
                        errors.append(f"Transazione {i+1}: Dati mancanti")
                        continue
                    
                    # Esegui l'inserimento
                    cursor.execute(insert_query, (
                        user_id,
                        transaction['transaction_date'],
                        transaction['description'][:255],  # Limita lunghezza
                        transaction['amount'],
                        transaction['type'],
                        transaction['category'][:100]  # Limita lunghezza
                    ))
                    saved_count += 1
                    
                except Error as e:
                    errors.append(f"Transazione {i+1}: {str(e)}")
                    continue
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return {
                'success': True,
                'saved_count': saved_count,
                'total_count': len(transactions),
                'errors': errors
            }
            
        except Error as e:
            logger.error(f"Errore salvataggio transazioni: {e}")
            if connection:
                connection.close()
            return {
                'success': False,
                'error': str(e),
                'saved_count': 0
            }
    
    def get_user_transactions(self, user_id: int, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Recupera le transazioni di un utente con filtri opzionali"""
        connection = self.get_db_connection()
        if not connection:
            return []
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Costruisci la query base
            query = "SELECT * FROM transactions WHERE user_id = %s"
            params = [user_id]
            
            # Aggiungi filtri
            if filters:
                if filters.get('start_date'):
                    query += " AND transaction_date >= %s"
                    params.append(filters['start_date'])
                
                if filters.get('end_date'):
                    query += " AND transaction_date <= %s"
                    params.append(filters['end_date'])
                
                if filters.get('type'):
                    query += " AND type = %s"
                    params.append(filters['type'])
                
                if filters.get('category'):
                    query += " AND category = %s"
                    params.append(filters['category'])
                
                if filters.get('min_amount'):
                    query += " AND amount >= %s"
                    params.append(filters['min_amount'])
                
                if filters.get('max_amount'):
                    query += " AND amount <= %s"
                    params.append(filters['max_amount'])
            
            # Aggiungi ordinamento
            query += " ORDER BY transaction_date DESC, created_at DESC"
            
            # Aggiungi limite se specificato
            if filters and filters.get('limit'):
                query += " LIMIT %s"
                params.append(filters['limit'])
            
            cursor.execute(query, params)
            transactions = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            return transactions
            
        except Error as e:
            logger.error(f"Errore recupero transazioni: {e}")
            if connection:
                connection.close()
            return []
    
    def get_transaction_stats(self, user_id: int, period: str = 'month') -> Dict[str, Any]:
        """Recupera statistiche delle transazioni"""
        connection = self.get_db_connection()
        if not connection:
            return {}
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Query per statistiche generali
            stats_query = """
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                    AVG(CASE WHEN type = 'expense' THEN amount ELSE NULL END) as avg_expense,
                    MIN(transaction_date) as first_transaction,
                    MAX(transaction_date) as last_transaction
                FROM transactions 
                WHERE user_id = %s
            """
            
            cursor.execute(stats_query, (user_id,))
            general_stats = cursor.fetchone()
            
            # Query per statistiche per categoria
            category_query = """
                SELECT 
                    category,
                    COUNT(*) as count,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
                FROM transactions 
                WHERE user_id = %s
                GROUP BY category
                ORDER BY expenses DESC
            """
            
            cursor.execute(category_query, (user_id,))
            category_stats = cursor.fetchall()
            
            # Query per statistiche mensili
            monthly_query = """
                SELECT 
                    DATE_FORMAT(transaction_date, '%Y-%m') as month,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
                FROM transactions 
                WHERE user_id = %s
                GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            """
            
            cursor.execute(monthly_query, (user_id,))
            monthly_stats = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            # Calcola statistiche derivate
            net_amount = (general_stats['total_income'] or 0) - (general_stats['total_expenses'] or 0)
            
            return {
                'general': {
                    'total_transactions': general_stats['total_transactions'] or 0,
                    'total_income': general_stats['total_income'] or 0,
                    'total_expenses': general_stats['total_expenses'] or 0,
                    'net_amount': net_amount,
                    'avg_expense': general_stats['avg_expense'] or 0,
                    'first_transaction': general_stats['first_transaction'],
                    'last_transaction': general_stats['last_transaction']
                },
                'categories': category_stats,
                'monthly': monthly_stats
            }
            
        except Error as e:
            logger.error(f"Errore recupero statistiche: {e}")
            if connection:
                connection.close()
            return {}
    
    def delete_user_transactions(self, user_id: int, transaction_ids: Optional[List[int]] = None) -> bool:
        """Elimina transazioni di un utente"""
        connection = self.get_db_connection()
        if not connection:
            return False
        
        try:
            cursor = connection.cursor()
            
            if transaction_ids:
                # Elimina transazioni specifiche
                placeholders = ','.join(['%s'] * len(transaction_ids))
                query = f"DELETE FROM transactions WHERE user_id = %s AND id IN ({placeholders})"
                params = [user_id] + transaction_ids
            else:
                # Elimina tutte le transazioni dell'utente
                query = "DELETE FROM transactions WHERE user_id = %s"
                params = [user_id]
            
            cursor.execute(query, params)
            deleted_count = cursor.rowcount
            
            connection.commit()
            cursor.close()
            connection.close()
            
            logger.info(f"Eliminate {deleted_count} transazioni per utente {user_id}")
            return True
            
        except Error as e:
            logger.error(f"Errore eliminazione transazioni: {e}")
            if connection:
                connection.close()
            return False
    
    def update_transaction(self, user_id: int, transaction_id: int, updates: Dict[str, Any]) -> bool:
        """Aggiorna una transazione specifica"""
        connection = self.get_db_connection()
        if not connection:
            return False
        
        try:
            cursor = connection.cursor()
            
            # Costruisci query di aggiornamento
            set_clauses = []
            params = []
            
            allowed_fields = ['description', 'amount', 'type', 'category']
            for field, value in updates.items():
                if field in allowed_fields:
                    set_clauses.append(f"{field} = %s")
                    params.append(value)
            
            if not set_clauses:
                return False
            
            query = f"UPDATE transactions SET {', '.join(set_clauses)} WHERE id = %s AND user_id = %s"
            params.extend([transaction_id, user_id])
            
            cursor.execute(query, params)
            updated = cursor.rowcount > 0
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return updated
            
        except Error as e:
            logger.error(f"Errore aggiornamento transazione: {e}")
            if connection:
                connection.close()
            return False
    
    def get_general_stats(self, user_id: int) -> Dict[str, Any]:
        """Get general statistics (all time totals) for a user"""
        connection = self.get_db_connection()
        if not connection:
            return {}
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get total income, expenses, and transaction count
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                    AVG(CASE WHEN type = 'expense' THEN amount END) as avg_expense,
                    MIN(transaction_date) as first_transaction,
                    MAX(transaction_date) as last_transaction
                FROM transactions 
                WHERE user_id = %s
            """, (user_id,))
            
            stats = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            if not stats:
                return {
                    'total_transactions': 0,
                    'total_income': 0,
                    'total_expenses': 0,
                    'net_amount': 0,
                    'avg_expense': 0,
                    'first_transaction': None,
                    'last_transaction': None
                }
            
            # Calculate net amount
            net_amount = (stats['total_income'] or 0) - (stats['total_expenses'] or 0)
            
            return {
                'total_transactions': stats['total_transactions'] or 0,
                'total_income': float(stats['total_income'] or 0),
                'total_expenses': float(stats['total_expenses'] or 0),
                'net_amount': float(net_amount),
                'avg_expense': float(stats['avg_expense'] or 0),
                'first_transaction': stats['first_transaction'].isoformat() if stats['first_transaction'] else None,
                'last_transaction': stats['last_transaction'].isoformat() if stats['last_transaction'] else None
            }
            
        except Error as e:
            logger.error(f"Error getting general stats for user {user_id}: {e}")
            if connection:
                connection.close()
            return {}
