import os

# Configurazione database per Railway
def get_database_config():
    """Ottiene la configurazione del database da Railway"""
    
    # Railway MySQL Plugin
    if os.environ.get('RAILWAY_MYSQL_URL'):
        # Parse della URL MySQL di Railway
        mysql_url = os.environ.get('RAILWAY_MYSQL_URL')
        # Esempio: mysql://user:pass@host:port/database
        parts = mysql_url.replace('mysql://', '').split('@')
        credentials = parts[0].split(':')
        host_port_db = parts[1].split('/')
        host_port = host_port_db[0].split(':')
        
        return {
            'host': host_port[0],
            'port': int(host_port[1]) if len(host_port) > 1 else 3306,
            'user': credentials[0],
            'password': credentials[1],
            'database': host_port_db[1] if len(host_port_db) > 1 else 'railway'
        }
    
    # Variabili d'ambiente separate
    return {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': int(os.environ.get('DB_PORT', 3306)),
        'user': os.environ.get('DB_USER', 'root'),
        'password': os.environ.get('DB_PASSWORD', ''),
        'database': os.environ.get('DB_NAME', 'tracker_spend')
    }

# Configurazione JWT
def get_jwt_config():
    """Ottiene la configurazione JWT"""
    return {
        'secret': os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production'),
        'algorithm': 'HS256',
        'expires_in': 24 * 60 * 60  # 24 ore
    }

# Configurazione CORS
def get_cors_config():
    """Ottiene la configurazione CORS"""
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    return {
        'origins': [frontend_url, 'https://your-app.railway.app'],
        'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allow_headers': ['Content-Type', 'Authorization']
    }
