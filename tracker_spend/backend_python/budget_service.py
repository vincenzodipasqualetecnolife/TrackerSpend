import mysql.connector
from mysql.connector import Error
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date

logger = logging.getLogger(__name__)

class BudgetService:
    def __init__(self, db_config: Dict[str, Any]):
        self.db_config = db_config

    def get_db_connection(self):
        """Create database connection"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            return connection
        except Error as e:
            logger.error(f"Error connecting to MySQL: {e}")
            return None

    def create_budgets_table(self):
        """Create budgets table if it doesn't exist"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()
            
            # Create budgets table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS budgets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    category_id INT,
                    amount DECIMAL(10,2) NOT NULL,
                    period ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE,
                    description TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
                )
            """)

            connection.commit()
            cursor.close()
            connection.close()
            logger.info("Budgets table created successfully")
            return True

        except Error as e:
            logger.error(f"Error creating budgets table: {e}")
            if connection:
                connection.close()
            return False

    def get_budgets(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all budgets for a user"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.user_id = %s
                ORDER BY b.created_at DESC
            """, (user_id,))

            budgets = cursor.fetchall()
            cursor.close()
            connection.close()
            
            return budgets

        except Error as e:
            logger.error(f"Error getting budgets for user {user_id}: {e}")
            if connection:
                connection.close()
            return []

    def get_budget(self, budget_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific budget by ID"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = %s AND b.user_id = %s
            """, (budget_id, user_id))
            
            budget = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return budget

        except Error as e:
            logger.error(f"Error getting budget {budget_id}: {e}")
            if connection:
                connection.close()
            return None

    def create_budget(self, budget_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new budget"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                INSERT INTO budgets (user_id, name, category_id, amount, period, start_date, end_date, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                budget_data['user_id'],
                budget_data['name'],
                budget_data.get('category_id'),
                budget_data['amount'],
                budget_data['period'],
                budget_data['start_date'],
                budget_data.get('end_date'),
                budget_data.get('description')
            ))
            
            budget_id = cursor.lastrowid
            connection.commit()
            
            # Get the created budget with category info
            cursor.execute("""
                SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = %s
            """, (budget_id,))
            
            budget = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return budget

        except Error as e:
            logger.error(f"Error creating budget: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def update_budget(self, budget_id: int, user_id: int, budget_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing budget"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Build update query dynamically
            update_fields = []
            values = []
            
            for field in ['name', 'category_id', 'amount', 'period', 'start_date', 'end_date', 'description', 'is_active']:
                if field in budget_data:
                    update_fields.append(f"{field} = %s")
                    values.append(budget_data[field])
            
            if not update_fields:
                cursor.close()
                connection.close()
                return None
            
            values.extend([budget_id, user_id])
            
            query = f"""
                UPDATE budgets 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """
            
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                cursor.close()
                connection.close()
                return None
            
            connection.commit()
            
            # Get the updated budget with category info
            cursor.execute("""
                SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.id = %s
            """, (budget_id,))
            
            budget = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return budget

        except Error as e:
            logger.error(f"Error updating budget {budget_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def delete_budget(self, budget_id: int, user_id: int) -> bool:
        """Delete a budget"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM budgets WHERE id = %s AND user_id = %s", (budget_id, user_id))
            
            if cursor.rowcount == 0:
                cursor.close()
                connection.close()
                return False
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return True

        except Error as e:
            logger.error(f"Error deleting budget {budget_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return False

    def get_budget_progress(self, budget_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get budget progress with spent amount and remaining"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get budget info
            cursor.execute("""
                SELECT * FROM budgets WHERE id = %s AND user_id = %s
            """, (budget_id, user_id))
            
            budget = cursor.fetchone()
            if not budget:
                cursor.close()
                connection.close()
                return None
            
            # Calculate spent amount
            if budget['category_id']:
                # Budget for specific category
                cursor.execute("""
                    SELECT COALESCE(SUM(amount), 0) as spent_amount
                    FROM transactions 
                    WHERE user_id = %s AND category_id = %s AND type = 'expense'
                    AND transaction_date BETWEEN %s AND %s
                """, (user_id, budget['category_id'], budget['start_date'], budget['end_date']))
            else:
                # General budget (all expenses)
                cursor.execute("""
                    SELECT COALESCE(SUM(amount), 0) as spent_amount
                    FROM transactions 
                    WHERE user_id = %s AND type = 'expense'
                    AND transaction_date BETWEEN %s AND %s
                """, (user_id, budget['start_date'], budget['end_date']))
            
            spent_result = cursor.fetchone()
            spent_amount = float(spent_result['spent_amount']) if spent_result else 0
            
            # Calculate remaining and percentage
            remaining_amount = budget['amount'] - spent_amount
            percentage_used = (spent_amount / budget['amount']) * 100 if budget['amount'] > 0 else 0
            
            cursor.close()
            connection.close()
            
            return {
                'budget': budget,
                'spent_amount': spent_amount,
                'remaining_amount': remaining_amount,
                'percentage_used': percentage_used
            }

        except Error as e:
            logger.error(f"Error getting budget progress {budget_id}: {e}")
            if connection:
                connection.close()
            return None

    def get_active_budgets(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all active budgets for a user with progress"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get active budgets
            cursor.execute("""
                SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                WHERE b.user_id = %s AND b.is_active = TRUE
                ORDER BY b.created_at DESC
            """, (user_id,))

            budgets = cursor.fetchall()
            
            # Calculate progress for each budget
            for budget in budgets:
                if budget['category_id']:
                    cursor.execute("""
                        SELECT COALESCE(SUM(amount), 0) as spent_amount
                        FROM transactions 
                        WHERE user_id = %s AND category_id = %s AND type = 'expense'
                        AND transaction_date BETWEEN %s AND %s
                    """, (user_id, budget['category_id'], budget['start_date'], budget['end_date']))
                else:
                    cursor.execute("""
                        SELECT COALESCE(SUM(amount), 0) as spent_amount
                        FROM transactions 
                        WHERE user_id = %s AND type = 'expense'
                        AND transaction_date BETWEEN %s AND %s
                    """, (user_id, budget['start_date'], budget['end_date']))
                
                spent_result = cursor.fetchone()
                spent_amount = float(spent_result['spent_amount']) if spent_result else 0
                
                budget['spent_amount'] = spent_amount
                budget['remaining_amount'] = budget['amount'] - spent_amount
                budget['percentage_used'] = (spent_amount / budget['amount']) * 100 if budget['amount'] > 0 else 0
            
            cursor.close()
            connection.close()
            
            return budgets

        except Error as e:
            logger.error(f"Error getting active budgets for user {user_id}: {e}")
            if connection:
                connection.close()
            return []
