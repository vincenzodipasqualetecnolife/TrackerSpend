from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime, timedelta
import os
import tempfile
import logging
from csv_parser import CSVTransactionParser
from transaction_service import TransactionService
from category_service import CategoryService
from budget_service import BudgetService
from goal_service import GoalService
from dashboard_service import DashboardService
from railway_config import get_database_config, get_jwt_config, get_cors_config

app = Flask(__name__)

# Configurazione CORS per Railway
cors_config = get_cors_config()
CORS(app, resources={
    r"/api/*": {
        "origins": cors_config['origins'],
        "methods": cors_config['methods'],
        "allow_headers": cors_config['allow_headers']
    }
})

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration per Railway
DB_CONFIG = get_database_config()

# Inizializza servizi
csv_parser = CSVTransactionParser()
transaction_service = TransactionService(DB_CONFIG)
category_service = CategoryService(DB_CONFIG)
budget_service = BudgetService(DB_CONFIG)
goal_service = GoalService(DB_CONFIG)
dashboard_service = DashboardService(DB_CONFIG)

# Crea tabelle se non esistono
transaction_service.create_transactions_table()
category_service.create_categories_table()
budget_service.create_budgets_table()
goal_service.create_goals_table()



# Crea tabelle per autenticazione e preferenze
def create_auth_tables():
    """Create authentication and user preference tables"""
    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        
        # Create users table first
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                role ENUM('user', 'admin') DEFAULT 'user'
            )
        """)
        
        # Create user_sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Create user_preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL UNIQUE,
                timezone VARCHAR(50) DEFAULT 'UTC',
                notifications_enabled BOOLEAN DEFAULT TRUE,
                currency VARCHAR(3) DEFAULT 'EUR',
                language VARCHAR(5) DEFAULT 'it',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        connection.commit()
        cursor.close()
        connection.close()
        logger.info("Authentication tables created successfully")
        return True

    except Error as e:
        logger.error(f"Error creating authentication tables: {e}")
        if connection:
            connection.close()
        return False

@app.before_request
def handle_preflight():
    """Gestisce le richieste OPTIONS preflight"""
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Crea tabelle per autenticazione e preferenze
create_auth_tables()

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint per Railway"""
    try:
        # Test connessione database
        connection = get_db_connection()
        if connection:
            connection.close()
            db_status = 'connected'
        else:
            db_status = 'disconnected'
    except Exception as e:
        db_status = f'error: {str(e)}'
    
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'database': db_status,
        'environment': os.environ.get('NODE_ENV', 'development')
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        logger.info(f"Registration request received: {data}")
        
        # Validate required fields
        if not all(key in data for key in ['username', 'email', 'password']):
            logger.error(f"Missing required fields in registration: {data}")
            return jsonify({'error': 'Username, email and password are required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if user already exists
        cursor.execute(
            "SELECT id FROM users WHERE username = %s OR email = %s",
            (data['username'], data['email'])
        )
        
        existing_user = cursor.fetchone()
        if existing_user:
            logger.error(f"User already exists: {data['username']} or {data['email']}")
            cursor.close()
            connection.close()
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Insert new user
        insert_data = (
            data['username'],
            data['email'],
            data['password'],  # TODO: implement proper hashing
            data.get('first_name', ''),
            data.get('last_name', ''),
            data.get('phone', '')
        )
        logger.info(f"Inserting user with data: {insert_data}")
        
        cursor.execute("""
            INSERT INTO users (username, email, password_hash, first_name, last_name, phone, is_active) 
            VALUES (%s, %s, %s, %s, %s, %s, 1)
        """, insert_data)
        
        user_id = cursor.lastrowid
        logger.info(f"User created with ID: {user_id}")
        
        # Create user session
        token = f"token_{user_id}_{datetime.now().timestamp()}"
        expires_at = datetime.now() + timedelta(days=30)
        
        cursor.execute("""
            INSERT INTO user_sessions (user_id, token, expires_at)
            VALUES (%s, %s, %s)
        """, (user_id, token, expires_at))
        
        # Get user data
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user,
            'message': 'User registered successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'password' not in data:
            return jsonify({'error': 'Password is required'}), 400
        
        # Handle both 'email' and 'identifier' fields
        email = data.get('email') or data.get('identifier')
        if not email:
            return jsonify({'error': 'Email or identifier is required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Check user credentials
        cursor.execute("""
            SELECT * FROM users 
            WHERE (email = %s OR username = %s) AND password_hash = %s AND is_active = 1
        """, (email, email, data['password']))
        
        user = cursor.fetchone()
        if not user:
            cursor.close()
            connection.close()
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Create or update user session
        token = f"token_{user['id']}_{datetime.now().timestamp()}"
        expires_at = datetime.now() + timedelta(days=30)
        
        cursor.execute("""
            INSERT INTO user_sessions (user_id, token, expires_at)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)
        """, (user['id'], token, expires_at))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'success': True,
            'token': token,
            'user': user,
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Delete user session
        cursor.execute("DELETE FROM user_sessions WHERE token = %s", (token,))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'data': { 'message': 'Logout successful' },
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current user information"""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Get user data
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'data': user}), 200
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['PUT'])
def update_user_profile():
    """Update user profile information"""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Update user profile
        cursor.execute("""
            UPDATE users 
            SET first_name = %s, last_name = %s, phone = %s, email = %s
            WHERE id = %s
        """, (
            data.get('first_name', ''),
            data.get('last_name', ''),
            data.get('phone', ''),
            data.get('email', ''),
            user_id
        ))
        
        # Get updated user data
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        connection.commit()
        cursor.close()
        connection.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'data': user, 'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/preferences', methods=['PUT'])
def update_user_preferences():
    """Update user preferences"""
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        # Update or create user preferences
        cursor.execute("""
            INSERT INTO user_preferences (user_id, timezone, notifications_enabled, currency, language)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                timezone = VALUES(timezone),
                notifications_enabled = VALUES(notifications_enabled),
                currency = VALUES(currency),
                language = VALUES(language),
                updated_at = CURRENT_TIMESTAMP
        """, (
            user_id,
            data.get('timezone', 'UTC'),
            data.get('notifications_enabled', True),
            data.get('currency', 'EUR'),
            data.get('language', 'it')
        ))
        
        # Get updated preferences
        cursor.execute("SELECT * FROM user_preferences WHERE user_id = %s", (user_id,))
        preferences = cursor.fetchone()
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({'data': preferences}), 200
        
    except Exception as e:
        logger.error(f"Update preferences error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/upload', methods=['POST', 'OPTIONS'])
def upload_transactions():
    """Endpoint per l'upload di file CSV e Excel di estratti conto"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verifica autenticazione
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token di autenticazione richiesto'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Token non valido'}), 401
        
        # Verifica presenza del file
        if 'file' not in request.files:
            return jsonify({'error': 'Nessun file caricato'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nessun file selezionato'}), 400
        
        # Verifica estensione
        file_extension = file.filename.lower()
        if not (file_extension.endswith('.csv') or file_extension.endswith('.xlsx') or file_extension.endswith('.xls')):
            return jsonify({'error': 'Solo file CSV e Excel (.csv, .xlsx, .xls) sono supportati'}), 400
        
        # Determina l'estensione per il file temporaneo
        temp_suffix = '.csv' if file_extension.endswith('.csv') else '.xlsx'
        
        # Salva file temporaneo
        with tempfile.NamedTemporaryFile(delete=False, suffix=temp_suffix) as temp_file:
            file.save(temp_file.name)
            temp_file_path = temp_file.name
        
        try:
            logger.info("=== INIZIO PROCESSING UPLOAD ===")
            logger.info(f"File ricevuto: {file.filename}")
            logger.info(f"Tipo file: {temp_suffix}")
            logger.info(f"Path temporaneo: {temp_file_path}")
            
            # Parsa il file (CSV o Excel)
            logger.info(f"1. Parsing file: {file.filename} (tipo: {temp_suffix})")
            try:
                transactions = csv_parser.parse_file(temp_file_path)
                logger.info(f"2. Transazioni parsate: {len(transactions)}")
                if transactions:
                    logger.info(f"3. Prima transazione: {transactions[0]}")
                    logger.info(f"3b. Chiavi prima transazione: {list(transactions[0].keys())}")
                else:
                    logger.warning("3. Nessuna transazione parsata!")
            except Exception as parse_error:
                logger.error(f"Errore durante il parsing: {parse_error}")
                return jsonify({
                    'error': 'Errore durante il parsing del file',
                    'details': [str(parse_error)]
                }), 400
            
            # Valida le transazioni
            logger.info("4. Inizio validazione transazioni")
            validation_result = csv_parser.validate_transactions(transactions)
            logger.info(f"5. Risultato validazione: {validation_result}")
            logger.info(f"6. Tipo risultato validazione: {type(validation_result)}")
            logger.info(f"7. Chiavi risultato validazione: {validation_result.keys() if isinstance(validation_result, dict) else 'Non è un dict'}")
            
            if not validation_result['valid']:
                logger.error(f"8. Validazione fallita: {validation_result}")
                logger.info(f"9. Stats: {validation_result.get('stats', 'Stats non trovato')}")
                logger.info(f"9b. Errori: {validation_result.get('stats', {}).get('errors', 'Errori non trovati')}")
                return jsonify({
                    'error': 'Errore nella validazione del file',
                    'details': validation_result.get('stats', {}).get('errors', ['Errore sconosciuto'])
                }), 400
            
            logger.info("10. Validazione completata con successo")
            
            # Salva nel database
            logger.info("11. Inizio salvataggio nel database")
            save_result = transaction_service.save_transactions(user_id, validation_result['transactions'])
            logger.info(f"12. Risultato salvataggio: {save_result}")
            
            if not save_result['success']:
                logger.error(f"13. Salvataggio fallito: {save_result}")
                return jsonify({
                    'error': 'Errore nel salvataggio delle transazioni',
                    'details': save_result.get('error', 'Errore sconosciuto')
                }), 500
            
            logger.info("14. Salvataggio completato con successo")
            
            # Prepara risposta
            logger.info("15. Preparazione risposta")
            response_data = {
                'success': True,
                'message': f'Caricati {save_result["saved_count"]} transazioni con successo',
                'stats': validation_result['stats'],
                'saved_count': save_result['saved_count'],
                'total_count': save_result['total_count'],
                'errors': save_result.get('errors', [])
            }
            
            logger.info(f"16. Upload completato per utente {user_id}: {save_result['saved_count']} transazioni salvate")
            logger.info("=== FINE PROCESSING UPLOAD ===")
            return jsonify(response_data), 200
            
        finally:
            # Pulisci file temporaneo
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        logger.error(f"Errore upload transazioni: {e}")
        logger.error(f"Tipo di errore: {type(e)}")
        import traceback
        logger.error(f"Traceback completo: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['GET', 'OPTIONS'])
def get_transactions():
    """Endpoint per recuperare le transazioni di un utente"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verifica autenticazione
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token di autenticazione richiesto'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Token non valido'}), 401
        
        # Estrai filtri dalla query string
        filters = {}
        if request.args.get('start_date'):
            filters['start_date'] = request.args.get('start_date')
        if request.args.get('end_date'):
            filters['end_date'] = request.args.get('end_date')
        if request.args.get('type'):
            filters['type'] = request.args.get('type')
        if request.args.get('category'):
            filters['category'] = request.args.get('category')
        if request.args.get('min_amount'):
            filters['min_amount'] = float(request.args.get('min_amount'))
        if request.args.get('max_amount'):
            filters['max_amount'] = float(request.args.get('max_amount'))
        if request.args.get('limit'):
            filters['limit'] = int(request.args.get('limit'))
        
        # Recupera transazioni
        transactions = transaction_service.get_user_transactions(user_id, filters)
        
        return jsonify({
            'success': True,
            'transactions': transactions,
            'count': len(transactions)
        }), 200
        
    except Exception as e:
        logger.error(f"Errore recupero transazioni: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/stats', methods=['GET', 'OPTIONS'])
def get_transaction_stats():
    """Endpoint per recuperare le statistiche delle transazioni"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verifica autenticazione
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token di autenticazione richiesto'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Token non valido'}), 401
        
        # Recupera statistiche
        stats = transaction_service.get_transaction_stats(user_id)
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        logger.error(f"Errore recupero statistiche: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT', 'OPTIONS'])
def update_transaction(transaction_id):
    """Endpoint per aggiornare una transazione specifica"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verifica autenticazione
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token di autenticazione richiesto'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Token non valido'}), 401
        
        # Estrai dati di aggiornamento
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Dati di aggiornamento richiesti'}), 400
        
        # Aggiorna transazione
        success = transaction_service.update_transaction(user_id, transaction_id, data)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Transazione aggiornata con successo'
            }), 200
        else:
            return jsonify({'error': 'Transazione non trovata o errore nell\'aggiornamento'}), 404
        
    except Exception as e:
        logger.error(f"Errore aggiornamento transazione: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transactions', methods=['DELETE', 'OPTIONS'])
def delete_transactions():
    """Endpoint per eliminare transazioni"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verifica autenticazione
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token di autenticazione richiesto'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Token non valido'}), 401
        
        # Estrai ID transazioni da eliminare (opzionale)
        data = request.get_json() or {}
        transaction_ids = data.get('transaction_ids')
        
        # Elimina transazioni
        success = transaction_service.delete_user_transactions(user_id, transaction_ids)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Transazioni eliminate con successo'
            }), 200
        else:
            return jsonify({'error': 'Errore nell\'eliminazione delle transazioni'}), 500
        
    except Exception as e:
        logger.error(f"Errore eliminazione transazioni: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# CATEGORIES ENDPOINTS
# ============================================================================

@app.route('/api/categories', methods=['GET', 'OPTIONS'])
def get_categories():
    """Get all categories for the authenticated user"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get categories
        categories = category_service.get_categories(user_id)
        
        return jsonify({
            'data': categories,
            'total': len(categories)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories/<int:category_id>', methods=['GET', 'OPTIONS'])
def get_category(category_id):
    """Get a specific category"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get category
        category = category_service.get_category(category_id)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        return jsonify({'data': category}), 200
        
    except Exception as e:
        logger.error(f"Error getting category {category_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['POST', 'OPTIONS'])
def create_category():
    """Create a new category"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Add user_id to data
        data['user_id'] = user_id
        
        # Create category
        category = category_service.create_category(data)
        
        if not category:
            return jsonify({'error': 'Failed to create category'}), 500
        
        return jsonify({
            'data': category,
            'message': 'Category created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating category: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories/<int:category_id>', methods=['PUT', 'OPTIONS'])
def update_category(category_id):
    """Update a category"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Update category
        category = category_service.update_category(category_id, data)
        
        if not category:
            return jsonify({'error': 'Category not found or update failed'}), 404
        
        return jsonify({
            'data': category,
            'message': 'Category updated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating category {category_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories/<int:category_id>', methods=['DELETE', 'OPTIONS'])
def delete_category(category_id):
    """Delete a category"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Delete category
        success = category_service.delete_category(category_id)
        
        if not success:
            return jsonify({'error': 'Category not found or cannot be deleted'}), 404
        
        return jsonify({
            'message': 'Category deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting category {category_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories/type/<category_type>', methods=['GET', 'OPTIONS'])
def get_categories_by_type(category_type):
    """Get categories filtered by type"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get categories by type
        categories = category_service.get_categories_by_type(category_type, user_id)
        
        return jsonify({
            'data': categories,
            'total': len(categories)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting categories by type {category_type}: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# BUDGETS ENDPOINTS
# ============================================================================

@app.route('/api/budgets', methods=['GET', 'OPTIONS'])
def get_budgets():
    """Get all budgets for the authenticated user"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get budgets
        budgets = budget_service.get_budgets(user_id)
        
        return jsonify({
            'data': budgets,
            'total': len(budgets)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting budgets: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>', methods=['GET', 'OPTIONS'])
def get_budget(budget_id):
    """Get a specific budget"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get budget
        budget = budget_service.get_budget(budget_id, user_id)
        
        if not budget:
            return jsonify({'error': 'Budget not found'}), 404
        
        return jsonify({'data': budget}), 200
        
    except Exception as e:
        logger.error(f"Error getting budget {budget_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['POST', 'OPTIONS'])
def create_budget():
    """Create a new budget"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Add user_id to data
        data['user_id'] = user_id
        
        # Create budget
        budget = budget_service.create_budget(data)
        
        if not budget:
            return jsonify({'error': 'Failed to create budget'}), 500
        
        return jsonify({
            'data': budget,
            'message': 'Budget created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating budget: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>', methods=['PUT', 'OPTIONS'])
def update_budget(budget_id):
    """Update a budget"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Update budget
        budget = budget_service.update_budget(budget_id, user_id, data)
        
        if not budget:
            return jsonify({'error': 'Budget not found or update failed'}), 404
        
        return jsonify({
            'data': budget,
            'message': 'Budget updated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating budget {budget_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>', methods=['DELETE', 'OPTIONS'])
def delete_budget(budget_id):
    """Delete a budget"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Delete budget
        success = budget_service.delete_budget(budget_id, user_id)
        
        if not success:
            return jsonify({'error': 'Budget not found or cannot be deleted'}), 404
        
        return jsonify({
            'message': 'Budget deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting budget {budget_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>/progress', methods=['GET', 'OPTIONS'])
def get_budget_progress(budget_id):
    """Get budget progress with spent amount and remaining"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get budget progress
        progress = budget_service.get_budget_progress(budget_id, user_id)
        
        if not progress:
            return jsonify({'error': 'Budget not found'}), 404
        
        return jsonify({'data': progress}), 200
        
    except Exception as e:
        logger.error(f"Error getting budget progress {budget_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/active', methods=['GET', 'OPTIONS'])
def get_active_budgets():
    """Get all active budgets with progress"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get active budgets
        budgets = budget_service.get_active_budgets(user_id)
        
        return jsonify({
            'data': budgets,
            'total': len(budgets)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting active budgets: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>/statistics', methods=['GET', 'OPTIONS'])
def get_budget_statistics(budget_id):
    """Get budget statistics (alias for progress)"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get budget progress (same as statistics)
        progress = budget_service.get_budget_progress(budget_id, user_id)
        
        if not progress:
            return jsonify({'error': 'Budget not found'}), 404
        
        return jsonify({'data': progress}), 200
        
    except Exception as e:
        logger.error(f"Error getting budget statistics {budget_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets/<int:budget_id>/recommendations', methods=['GET', 'OPTIONS'])
def get_budget_recommendations(budget_id):
    """Get budget recommendations"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get budget progress for recommendations
        progress = budget_service.get_budget_progress(budget_id, user_id)
        
        if not progress:
            return jsonify({'error': 'Budget not found'}), 404
        
        # Generate recommendations based on progress
        recommendations = []
        percentage_used = progress['percentage_used']
        
        if percentage_used > 90:
            recommendations.append({
                'type': 'warning',
                'message': 'Budget quasi esaurito! Considera di ridurre le spese.',
                'action': 'reduce_spending'
            })
        elif percentage_used > 75:
            recommendations.append({
                'type': 'info',
                'message': 'Budget al 75%. Monitora attentamente le spese.',
                'action': 'monitor_spending'
            })
        elif percentage_used < 25:
            recommendations.append({
                'type': 'success',
                'message': 'Ottimo! Hai ancora molto budget disponibile.',
                'action': 'continue_current_plan'
            })
        
        return jsonify({
            'data': {
                'budget_progress': progress,
                'recommendations': recommendations
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting budget recommendations {budget_id}: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# GOALS ENDPOINTS
# ============================================================================

@app.route('/api/goals', methods=['GET', 'OPTIONS'])
def get_goals():
    """Get all goals for the authenticated user"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get goals
        goals = goal_service.get_goals(user_id)
        
        return jsonify({
            'data': goals,
            'total': len(goals)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting goals: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/<int:goal_id>', methods=['GET', 'OPTIONS'])
def get_goal(goal_id):
    """Get a specific goal"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get goal
        goal = goal_service.get_goal(goal_id, user_id)
        
        if not goal:
            return jsonify({'error': 'Goal not found'}), 404
        
        return jsonify({'data': goal}), 200
        
    except Exception as e:
        logger.error(f"Error getting goal {goal_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals', methods=['POST', 'OPTIONS'])
def create_goal():
    """Create a new goal"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Add user_id to data
        data['user_id'] = user_id
        
        # Create goal
        goal = goal_service.create_goal(data)
        
        if not goal:
            return jsonify({'error': 'Failed to create goal'}), 500
        
        return jsonify({
            'data': goal,
            'message': 'Goal created successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating goal: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/<int:goal_id>', methods=['PUT', 'OPTIONS'])
def update_goal(goal_id):
    """Update a goal"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request data required'}), 400
        
        # Update goal
        goal = goal_service.update_goal(goal_id, user_id, data)
        
        if not goal:
            return jsonify({'error': 'Goal not found or update failed'}), 404
        
        return jsonify({
            'data': goal,
            'message': 'Goal updated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating goal {goal_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/<int:goal_id>', methods=['DELETE', 'OPTIONS'])
def delete_goal(goal_id):
    """Delete a goal"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Delete goal
        success = goal_service.delete_goal(goal_id, user_id)
        
        if not success:
            return jsonify({'error': 'Goal not found or cannot be deleted'}), 404
        
        return jsonify({
            'message': 'Goal deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting goal {goal_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/<int:goal_id>/progress', methods=['GET', 'OPTIONS'])
def get_goal_progress(goal_id):
    """Get goal progress with calculated metrics"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get goal progress
        progress = goal_service.get_goal_progress(goal_id, user_id)
        
        if not progress:
            return jsonify({'error': 'Goal not found'}), 404
        
        return jsonify({'data': progress}), 200
        
    except Exception as e:
        logger.error(f"Error getting goal progress {goal_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/<int:goal_id>/update-progress', methods=['POST', 'OPTIONS'])
def update_goal_progress(goal_id):
    """Update goal progress by adding amount"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get request data
        data = request.get_json()
        if not data or 'amount' not in data:
            return jsonify({'error': 'Amount is required'}), 400
        
        # Update goal progress
        goal = goal_service.update_goal_progress(goal_id, user_id, data['amount'])
        
        if not goal:
            return jsonify({'error': 'Goal not found or update failed'}), 404
        
        return jsonify({
            'data': goal,
            'message': 'Goal progress updated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating goal progress {goal_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/goals/active', methods=['GET', 'OPTIONS'])
def get_active_goals():
    """Get all active goals with progress"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get active goals
        goals = goal_service.get_active_goals(user_id)
        
        return jsonify({
            'data': goals,
            'total': len(goals)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting active goals: {e}")
        return jsonify({'error': str(e)}), 500



# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@app.route('/api/analytics/dashboard-stats', methods=['GET', 'OPTIONS'])
def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        # Get dashboard stats
        if year and month:
            stats = dashboard_service.get_monthly_stats(user_id, year, month)
        else:
            stats = dashboard_service.get_dashboard_stats(user_id)
        
        return jsonify({'data': stats}), 200
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/monthly-stats', methods=['GET', 'OPTIONS'])
def get_monthly_stats():
    """Get statistics for a specific month"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        
        if not year or not month:
            return jsonify({'error': 'Year and month parameters are required'}), 400
        
        # Get monthly stats
        stats = dashboard_service.get_monthly_stats(user_id, year, month)
        
        return jsonify({'data': stats}), 200
        
    except Exception as e:
        logger.error(f"Error getting monthly stats for {year}-{month}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/category-stats', methods=['GET', 'OPTIONS'])
def get_category_stats():
    """Get category statistics for a date range"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Convert string dates to date objects if provided
        start_date_obj = None
        end_date_obj = None
        
        if start_date:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get category stats
        stats = dashboard_service.get_category_stats(user_id, start_date_obj, end_date_obj)
        
        return jsonify({
            'data': stats,
            'total': len(stats)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting category stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard/trends', methods=['GET', 'OPTIONS'])
def get_spending_trends():
    """Get spending trends over the last N months"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get query parameter for number of months
        months = request.args.get('months', 6, type=int)
        
        # Get spending trends
        trends = dashboard_service.get_spending_trends(user_id, months)
        
        return jsonify({
            'data': trends,
            'total': len(trends)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting spending trends: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/general-stats', methods=['GET', 'OPTIONS'])
def get_general_stats():
    """Get general statistics (all time totals)"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Get general stats from transaction service
        from transaction_service import TransactionService
        transaction_service = TransactionService(DB_CONFIG)
        stats = transaction_service.get_general_stats(user_id)
        
        return jsonify({'data': stats}), 200
        
    except Exception as e:
        logger.error(f"Error getting general stats: {e}")
        return jsonify({'error': str(e)}), 500

# ============================================================================
# LEGACY ENDPOINTS (per compatibilità)
# ============================================================================

@app.route('/api/transactions/import', methods=['POST', 'OPTIONS'])
def import_transactions():
    """Legacy endpoint for importing transactions"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    # Redirect to upload endpoint
    return upload_transactions()

@app.route('/api/transactions/export', methods=['GET', 'OPTIONS'])
def export_transactions():
    """Export transactions (placeholder)"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
        
    try:
        # Verify authentication
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication token required'}), 401
        
        token = auth_header[7:]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Placeholder for export functionality
        return jsonify({
            'data': { 'filePath': '/exports/transactions.csv' },
            'message': 'Export functionality not yet implemented'
        }), 200
        
    except Exception as e:
        logger.error(f"Error exporting transactions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics/summary', methods=['GET', 'OPTIONS'])
def get_analytics_summary():
    """Get analytics summary (alias for dashboard stats)"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    # Redirect to dashboard stats
    return get_dashboard_stats()

@app.route('/api/analytics/category-totals', methods=['GET', 'OPTIONS'])
def get_category_totals():
    """Get category totals (alias for category stats)"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    # Redirect to category stats
    return get_category_stats()

@app.route('/api/analytics/monthly-totals', methods=['GET', 'OPTIONS'])
def get_monthly_totals():
    """Get monthly totals (alias for trends)"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    # Redirect to trends
    return get_spending_trends()

def get_user_id_from_token(token):
    """Recupera l'ID utente dal token di sessione"""
    try:
        connection = get_db_connection()
        if not connection:
            return None
        
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id FROM user_sessions 
            WHERE token = %s AND expires_at > NOW()
        """, (token,))
        
        session = cursor.fetchone()
        cursor.close()
        connection.close()
        
        return session['user_id'] if session else None
        
    except Exception as e:
        logger.error(f"Errore recupero utente da token: {e}")
        return None

# Route per servire il frontend buildato
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve il frontend React buildato"""
    if path and os.path.exists(os.path.join('../frontend/dist', path)):
        return send_from_directory('../frontend/dist', path)
    else:
        return send_from_directory('../frontend/dist', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=False)
