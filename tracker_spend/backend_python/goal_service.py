import mysql.connector
from mysql.connector import Error
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, date

logger = logging.getLogger(__name__)

class GoalService:
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

    def create_goals_table(self):
        """Create goals table if it doesn't exist"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()
            
            # Create goals table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS goals (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    target_amount DECIMAL(10,2) NOT NULL,
                    current_amount DECIMAL(10,2) DEFAULT 0.00,
                    deadline DATE,
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    status ENUM('active', 'completed', 'paused', 'cancelled') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            connection.commit()
            cursor.close()
            connection.close()
            logger.info("Goals table created successfully")
            return True

        except Error as e:
            logger.error(f"Error creating goals table: {e}")
            if connection:
                connection.close()
            return False

    def get_goals(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all goals for a user"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT * FROM goals 
                WHERE user_id = %s
                ORDER BY priority DESC, deadline ASC, created_at DESC
            """, (user_id,))

            goals = cursor.fetchall()
            cursor.close()
            connection.close()
            
            return goals

        except Error as e:
            logger.error(f"Error getting goals for user {user_id}: {e}")
            if connection:
                connection.close()
            return []

    def get_goal(self, goal_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific goal by ID"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT * FROM goals 
                WHERE id = %s AND user_id = %s
            """, (goal_id, user_id))
            
            goal = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return goal

        except Error as e:
            logger.error(f"Error getting goal {goal_id}: {e}")
            if connection:
                connection.close()
            return None

    def create_goal(self, goal_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new goal"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                INSERT INTO goals (user_id, name, description, target_amount, current_amount, deadline, priority)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                goal_data['user_id'],
                goal_data['name'],
                goal_data.get('description'),
                goal_data['target_amount'],
                goal_data.get('current_amount', 0.00),
                goal_data.get('deadline'),
                goal_data.get('priority', 'medium')
            ))
            
            goal_id = cursor.lastrowid
            connection.commit()
            
            # Get the created goal
            cursor.execute("SELECT * FROM goals WHERE id = %s", (goal_id,))
            goal = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            return goal

        except Error as e:
            logger.error(f"Error creating goal: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def update_goal(self, goal_id: int, user_id: int, goal_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing goal"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Build update query dynamically
            update_fields = []
            values = []
            
            for field in ['name', 'description', 'target_amount', 'current_amount', 'deadline', 'priority', 'status']:
                if field in goal_data:
                    update_fields.append(f"{field} = %s")
                    values.append(goal_data[field])
            
            if not update_fields:
                cursor.close()
                connection.close()
                return None
            
            values.extend([goal_id, user_id])
            
            query = f"""
                UPDATE goals 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """
            
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                cursor.close()
                connection.close()
                return None
            
            connection.commit()
            
            # Get the updated goal
            cursor.execute("SELECT * FROM goals WHERE id = %s", (goal_id,))
            goal = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            return goal

        except Error as e:
            logger.error(f"Error updating goal {goal_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def delete_goal(self, goal_id: int, user_id: int) -> bool:
        """Delete a goal"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()
            cursor.execute("DELETE FROM goals WHERE id = %s AND user_id = %s", (goal_id, user_id))
            
            if cursor.rowcount == 0:
                cursor.close()
                connection.close()
                return False
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return True

        except Error as e:
            logger.error(f"Error deleting goal {goal_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return False

    def update_goal_progress(self, goal_id: int, user_id: int, amount: float) -> Optional[Dict[str, Any]]:
        """Update goal progress by adding amount to current_amount"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Get current goal
            cursor.execute("""
                SELECT * FROM goals WHERE id = %s AND user_id = %s
            """, (goal_id, user_id))
            
            goal = cursor.fetchone()
            if not goal:
                cursor.close()
                connection.close()
                return None
            
            # Update current amount
            new_amount = goal['current_amount'] + amount
            new_status = 'completed' if new_amount >= goal['target_amount'] else goal['status']
            
            cursor.execute("""
                UPDATE goals 
                SET current_amount = %s, status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND user_id = %s
            """, (new_amount, new_status, goal_id, user_id))
            
            connection.commit()
            
            # Get the updated goal
            cursor.execute("SELECT * FROM goals WHERE id = %s", (goal_id,))
            updated_goal = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            return updated_goal

        except Error as e:
            logger.error(f"Error updating goal progress {goal_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def get_goal_progress(self, goal_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get goal progress with calculated metrics"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT * FROM goals WHERE id = %s AND user_id = %s
            """, (goal_id, user_id))
            
            goal = cursor.fetchone()
            if not goal:
                cursor.close()
                connection.close()
                return None
            
            # Calculate progress metrics
            progress_percentage = (goal['current_amount'] / goal['target_amount']) * 100 if goal['target_amount'] > 0 else 0
            remaining_amount = goal['target_amount'] - goal['current_amount']
            
            # Calculate days remaining
            days_remaining = None
            if goal['deadline']:
                today = date.today()
                deadline = goal['deadline']
                days_remaining = (deadline - today).days
            
            # Calculate required monthly contribution
            monthly_contribution = None
            if days_remaining and days_remaining > 0:
                months_remaining = days_remaining / 30.44  # Average days per month
                monthly_contribution = remaining_amount / months_remaining if months_remaining > 0 else 0
            
            cursor.close()
            connection.close()
            
            return {
                'goal': goal,
                'progress_percentage': progress_percentage,
                'remaining_amount': remaining_amount,
                'days_remaining': days_remaining,
                'monthly_contribution': monthly_contribution
            }

        except Error as e:
            logger.error(f"Error getting goal progress {goal_id}: {e}")
            if connection:
                connection.close()
            return None

    def get_active_goals(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all active goals for a user with progress"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT * FROM goals 
                WHERE user_id = %s AND status = 'active'
                ORDER BY priority DESC, deadline ASC
            """, (user_id,))

            goals = cursor.fetchall()
            
            # Calculate progress for each goal
            for goal in goals:
                progress_percentage = (goal['current_amount'] / goal['target_amount']) * 100 if goal['target_amount'] > 0 else 0
                remaining_amount = goal['target_amount'] - goal['current_amount']
                
                # Calculate days remaining
                days_remaining = None
                if goal['deadline']:
                    today = date.today()
                    deadline = goal['deadline']
                    days_remaining = (deadline - today).days
                
                goal['progress_percentage'] = progress_percentage
                goal['remaining_amount'] = remaining_amount
                goal['days_remaining'] = days_remaining
            
            cursor.close()
            connection.close()
            
            return goals

        except Error as e:
            logger.error(f"Error getting active goals for user {user_id}: {e}")
            if connection:
                connection.close()
            return []

    def get_goals_by_status(self, user_id: int, status: str) -> List[Dict[str, Any]]:
        """Get goals filtered by status"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                SELECT * FROM goals 
                WHERE user_id = %s AND status = %s
                ORDER BY priority DESC, deadline ASC
            """, (user_id, status))

            goals = cursor.fetchall()
            cursor.close()
            connection.close()
            
            return goals

        except Error as e:
            logger.error(f"Error getting goals by status {status} for user {user_id}: {e}")
            if connection:
                connection.close()
            return []
