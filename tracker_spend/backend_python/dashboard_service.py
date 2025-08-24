import mysql.connector
from mysql.connector import Error
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta

logger = logging.getLogger(__name__)

class DashboardService:
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

    def get_dashboard_stats(self, user_id: int) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics"""
        connection = self.get_db_connection()
        if not connection:
            return {}

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get current month stats
            current_month = date.today().replace(day=1)
            next_month = (current_month + timedelta(days=32)).replace(day=1)
            
            # Total income and expenses for current month
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
                    COUNT(*) as total_transactions
                FROM transactions 
                WHERE user_id = %s AND transaction_date >= %s AND transaction_date < %s
            """, (user_id, current_month, next_month))
            
            current_month_stats = cursor.fetchone()
            
            # Previous month stats for comparison
            prev_month = (current_month - timedelta(days=1)).replace(day=1)
            prev_month_end = current_month - timedelta(days=1)
            
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
                FROM transactions 
                WHERE user_id = %s AND transaction_date >= %s AND transaction_date <= %s
            """, (user_id, prev_month, prev_month_end))
            
            prev_month_stats = cursor.fetchone()
            
            # Calculate changes
            income_change = 0
            expense_change = 0
            
            if prev_month_stats['total_income'] > 0:
                income_change = ((current_month_stats['total_income'] - prev_month_stats['total_income']) / prev_month_stats['total_income']) * 100
            
            if prev_month_stats['total_expenses'] > 0:
                expense_change = ((current_month_stats['total_expenses'] - prev_month_stats['total_expenses']) / prev_month_stats['total_expenses']) * 100
            
            # Net balance
            net_balance = current_month_stats['total_income'] - current_month_stats['total_expenses']
            
            # Daily average spending
            days_in_month = (next_month - current_month).days
            daily_average = current_month_stats['total_expenses'] / days_in_month if days_in_month > 0 else 0
            
            # Top expense categories
            cursor.execute("""
                SELECT 
                    c.name as category_name,
                    c.color as category_color,
                    c.icon as category_icon,
                    COALESCE(SUM(t.amount), 0) as total_amount,
                    COUNT(*) as transaction_count
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = %s AND t.type = 'expense' 
                AND t.transaction_date >= %s AND t.transaction_date < %s
                GROUP BY c.id, c.name, c.color, c.icon
                ORDER BY total_amount DESC
                LIMIT 5
            """, (user_id, current_month, next_month))
            
            top_expense_categories = cursor.fetchall()
            
            # Recent transactions
            cursor.execute("""
                SELECT 
                    t.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.icon as category_icon
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = %s
                ORDER BY t.transaction_date DESC, t.created_at DESC
                LIMIT 10
            """, (user_id,))
            
            recent_transactions = cursor.fetchall()
            
            # Budget progress
            cursor.execute("""
                SELECT 
                    b.*,
                    c.name as category_name,
                    c.color as category_color,
                    c.icon as category_icon,
                    COALESCE(SUM(t.amount), 0) as spent_amount
                FROM budgets b
                LEFT JOIN categories c ON b.category_id = c.id
                LEFT JOIN transactions t ON t.category_id = b.category_id 
                    AND t.user_id = b.user_id 
                    AND t.type = 'expense'
                    AND t.transaction_date BETWEEN b.start_date AND b.end_date
                WHERE b.user_id = %s AND b.is_active = TRUE
                GROUP BY b.id, b.name, b.amount, b.period, b.start_date, b.end_date, 
                         c.name, c.color, c.icon
                ORDER BY b.created_at DESC
                LIMIT 5
            """, (user_id,))
            
            budget_progress = cursor.fetchall()
            
            # Calculate budget percentages
            for budget in budget_progress:
                budget['percentage_used'] = (budget['spent_amount'] / budget['amount']) * 100 if budget['amount'] > 0 else 0
                budget['remaining_amount'] = budget['amount'] - budget['spent_amount']
            
            cursor.close()
            connection.close()
            
            return {
                'current_month': {
                    'total_income': float(current_month_stats['total_income']),
                    'total_expenses': float(current_month_stats['total_expenses']),
                    'net_balance': float(net_balance),
                    'total_transactions': current_month_stats['total_transactions'],
                    'daily_average': float(daily_average)
                },
                'changes': {
                    'income_change': float(income_change),
                    'expense_change': float(expense_change)
                },
                'top_expense_categories': top_expense_categories,
                'recent_transactions': recent_transactions,
                'budget_progress': budget_progress
            }

        except Error as e:
            logger.error(f"Error getting dashboard stats for user {user_id}: {e}")
            if connection:
                connection.close()
            return {}

    def get_monthly_stats(self, user_id: int, year: int, month: int) -> Dict[str, Any]:
        """Get statistics for a specific month"""
        connection = self.get_db_connection()
        if not connection:
            return {}

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Calculate date range
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            # Monthly totals
            cursor.execute("""
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
                    COUNT(*) as total_transactions
                FROM transactions 
                WHERE user_id = %s AND transaction_date >= %s AND transaction_date < %s
            """, (user_id, start_date, end_date))
            
            monthly_stats = cursor.fetchone()
            
            # Category breakdown
            cursor.execute("""
                SELECT 
                    t.category as category_name,
                    t.type,
                    SUM(t.amount) as total_amount,
                    COUNT(*) as transaction_count
                FROM transactions t
                WHERE t.user_id = %s AND t.transaction_date >= %s AND t.transaction_date < %s
                GROUP BY t.category, t.type
                ORDER BY t.type, total_amount DESC
            """, (user_id, start_date, end_date))
            
            category_stats = cursor.fetchall()
            
            # Daily breakdown
            cursor.execute("""
                SELECT 
                    DATE(transaction_date) as date,
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as daily_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as daily_expenses,
                    COUNT(*) as daily_transactions
                FROM transactions 
                WHERE user_id = %s AND transaction_date >= %s AND transaction_date < %s
                GROUP BY DATE(transaction_date)
                ORDER BY date
            """, (user_id, start_date, end_date))
            
            daily_stats = cursor.fetchall()
            
            cursor.close()
            connection.close()
            
            return {
                'month': month,
                'year': year,
                'total_income': float(monthly_stats['total_income']),
                'total_expenses': float(monthly_stats['total_expenses']),
                'net_balance': float(monthly_stats['total_income'] - monthly_stats['total_expenses']),
                'total_transactions': monthly_stats['total_transactions'],
                'category_stats': category_stats,
                'daily_stats': daily_stats
            }

        except Error as e:
            logger.error(f"Error getting monthly stats for user {user_id}, {year}-{month}: {e}")
            if connection:
                connection.close()
            return {}

    def get_category_stats(self, user_id: int, start_date: date = None, end_date: date = None) -> List[Dict[str, Any]]:
        """Get category statistics for a date range"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Default to current month if no dates provided
            if not start_date:
                start_date = date.today().replace(day=1)
            if not end_date:
                next_month = (start_date + timedelta(days=32)).replace(day=1)
                end_date = next_month
            
            cursor.execute("""
                SELECT 
                    t.category as category_name,
                    t.type,
                    SUM(t.amount) as total_amount,
                    COUNT(*) as transaction_count,
                    AVG(t.amount) as average_amount,
                    MIN(t.amount) as min_amount,
                    MAX(t.amount) as max_amount
                FROM transactions t
                WHERE t.user_id = %s 
                    AND t.transaction_date >= %s 
                    AND t.transaction_date < %s
                GROUP BY t.category, t.type
                ORDER BY t.type, total_amount DESC
            """, (user_id, start_date, end_date))
            
            category_stats = cursor.fetchall()
            
            # Convert decimal values to float and map fields to frontend expectations
            for stat in category_stats:
                stat['total_amount'] = float(stat['total_amount'])
                stat['avg_amount'] = float(stat['average_amount']) if stat['average_amount'] else 0
                stat['category_type'] = stat['type']  # Map 'type' to 'category_type'
                # Remove fields not needed by frontend
                if 'average_amount' in stat:
                    del stat['average_amount']
                if 'min_amount' in stat:
                    del stat['min_amount']
                if 'max_amount' in stat:
                    del stat['max_amount']
            
            cursor.close()
            connection.close()
            
            return category_stats

        except Error as e:
            logger.error(f"Error getting category stats for user {user_id}: {e}")
            if connection:
                connection.close()
            return []

    def get_spending_trends(self, user_id: int, months: int = 6) -> List[Dict[str, Any]]:
        """Get spending trends over the last N months"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            trends = []
            current_date = date.today()
            
            for i in range(months):
                # Calculate month start and end
                if current_date.month - i <= 0:
                    year = current_date.year - 1
                    month = 12 + (current_date.month - i)
                else:
                    year = current_date.year
                    month = current_date.month - i
                
                month_start = date(year, month, 1)
                if month == 12:
                    month_end = date(year + 1, 1, 1)
                else:
                    month_end = date(year, month + 1, 1)
                
                # Get monthly stats
                cursor.execute("""
                    SELECT 
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
                        COUNT(*) as total_transactions
                    FROM transactions 
                    WHERE user_id = %s AND transaction_date >= %s AND transaction_date < %s
                """, (user_id, month_start, month_end))
                
                month_stats = cursor.fetchone()
                
                trends.append({
                    'year': year,
                    'month': month,
                    'month_name': month_start.strftime('%B'),
                    'total_income': float(month_stats['total_income']),
                    'total_expenses': float(month_stats['total_expenses']),
                    'net_balance': float(month_stats['total_income'] - month_stats['total_expenses']),
                    'total_transactions': month_stats['total_transactions']
                })
            
            cursor.close()
            connection.close()
            
            # Reverse to get chronological order
            return list(reversed(trends))

        except Error as e:
            logger.error(f"Error getting spending trends for user {user_id}: {e}")
            if connection:
                connection.close()
            return []
