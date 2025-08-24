import mysql.connector
from mysql.connector import Error
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class CategoryService:
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

    def create_categories_table(self):
        """Create categories table if it doesn't exist"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()
            
            # Create categories table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    type ENUM('income', 'expense') NOT NULL,
                    color VARCHAR(7) DEFAULT '#6B7280',
                    icon VARCHAR(10) DEFAULT '💰',
                    is_default BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)

            # Insert default categories if they don't exist
            default_categories = [
                # Income categories
                ('Stipendio', 'Stipendio mensile', 'income', '#10B981', '💰'),
                ('Bonus', 'Bonus e premi', 'income', '#3B82F6', '🎁'),
                ('Investimenti', 'Rendimenti da investimenti', 'income', '#8B5CF6', '📈'),
                ('Altri', 'Altre entrate', 'income', '#6B7280', '➕'),
                
                # Expense categories
                ('Alimentari', 'Spesa alimentare', 'expense', '#EF4444', '🛒'),
                ('Trasporti', 'Trasporti pubblici e privati', 'expense', '#F59E0B', '🚗'),
                ('Casa', 'Bollette e affitto', 'expense', '#8B5CF6', '🏠'),
                ('Intrattenimento', 'Cinema, ristoranti, hobby', 'expense', '#EC4899', '🎬'),
                ('Salute', 'Medicinali e visite mediche', 'expense', '#10B981', '💊'),
                ('Shopping', 'Abbigliamento e accessori', 'expense', '#F97316', '👕'),
                ('Viaggi', 'Vacanze e viaggi', 'expense', '#06B6D4', '✈️'),
                ('Altri', 'Altre spese', 'expense', '#6B7280', '📝')
            ]

            for name, description, type_, color, icon in default_categories:
                cursor.execute("""
                    INSERT IGNORE INTO categories (name, description, type, color, icon, is_default)
                    VALUES (%s, %s, %s, %s, %s, TRUE)
                """, (name, description, type_, color, icon))

            connection.commit()
            cursor.close()
            connection.close()
            logger.info("Categories table created successfully")
            return True

        except Error as e:
            logger.error(f"Error creating categories table: {e}")
            if connection:
                connection.close()
            return False

    def get_categories(self, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get all categories or user-specific categories"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            if user_id:
                # Get user-specific categories + default categories
                cursor.execute("""
                    SELECT * FROM categories 
                    WHERE user_id = %s OR is_default = TRUE
                    ORDER BY is_default DESC, name ASC
                """, (user_id,))
            else:
                # Get all default categories
                cursor.execute("""
                    SELECT * FROM categories 
                    WHERE is_default = TRUE
                    ORDER BY type, name
                """)

            categories = cursor.fetchall()
            cursor.close()
            connection.close()
            
            return categories

        except Error as e:
            logger.error(f"Error getting categories: {e}")
            if connection:
                connection.close()
            return []

    def get_category(self, category_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific category by ID"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
            category = cursor.fetchone()
            cursor.close()
            connection.close()
            
            return category

        except Error as e:
            logger.error(f"Error getting category {category_id}: {e}")
            if connection:
                connection.close()
            return None

    def create_category(self, category_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new category"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute("""
                INSERT INTO categories (user_id, name, description, type, color, icon)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                category_data.get('user_id'),
                category_data['name'],
                category_data.get('description'),
                category_data['type'],
                category_data.get('color', '#6B7280'),
                category_data.get('icon', '💰')
            ))
            
            category_id = cursor.lastrowid
            connection.commit()
            
            # Get the created category
            cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
            category = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            return category

        except Error as e:
            logger.error(f"Error creating category: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def update_category(self, category_id: int, category_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing category"""
        connection = self.get_db_connection()
        if not connection:
            return None

        try:
            cursor = connection.cursor(dictionary=True)
            
            # Build update query dynamically
            update_fields = []
            values = []
            
            for field in ['name', 'description', 'type', 'color', 'icon']:
                if field in category_data:
                    update_fields.append(f"{field} = %s")
                    values.append(category_data[field])
            
            if not update_fields:
                cursor.close()
                connection.close()
                return None
            
            values.append(category_id)
            
            query = f"""
                UPDATE categories 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """
            
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                cursor.close()
                connection.close()
                return None
            
            connection.commit()
            
            # Get the updated category
            cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
            category = cursor.fetchone()
            
            cursor.close()
            connection.close()
            
            return category

        except Error as e:
            logger.error(f"Error updating category {category_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return None

    def delete_category(self, category_id: int) -> bool:
        """Delete a category"""
        connection = self.get_db_connection()
        if not connection:
            return False

        try:
            cursor = connection.cursor()
            
            # Check if category is default
            cursor.execute("SELECT is_default FROM categories WHERE id = %s", (category_id,))
            category = cursor.fetchone()
            
            if category and category[0]:
                logger.warning(f"Cannot delete default category {category_id}")
                cursor.close()
                connection.close()
                return False
            
            cursor.execute("DELETE FROM categories WHERE id = %s", (category_id,))
            
            if cursor.rowcount == 0:
                cursor.close()
                connection.close()
                return False
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return True

        except Error as e:
            logger.error(f"Error deleting category {category_id}: {e}")
            if connection:
                connection.rollback()
                connection.close()
            return False

    def get_categories_by_type(self, category_type: str, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get categories filtered by type"""
        connection = self.get_db_connection()
        if not connection:
            return []

        try:
            cursor = connection.cursor(dictionary=True)
            
            if user_id:
                cursor.execute("""
                    SELECT * FROM categories 
                    WHERE (user_id = %s OR is_default = TRUE) AND type = %s
                    ORDER BY is_default DESC, name ASC
                """, (user_id, category_type))
            else:
                cursor.execute("""
                    SELECT * FROM categories 
                    WHERE is_default = TRUE AND type = %s
                    ORDER BY name
                """, (category_type,))

            categories = cursor.fetchall()
            cursor.close()
            connection.close()
            
            return categories

        except Error as e:
            logger.error(f"Error getting categories by type {category_type}: {e}")
            if connection:
                connection.close()
            return []
