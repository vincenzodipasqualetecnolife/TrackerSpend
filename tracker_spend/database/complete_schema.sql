-- TrackerSpend - Complete Database Schema
-- Questo file contiene tutto lo schema del database per l'applicazione TrackerSpend

USE tracker_spend;

-- ============================================================================
-- 1. USERS (Utenti)
-- ============================================================================
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
);

-- ============================================================================
-- 2. CATEGORIES (Categorie)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('income', 'expense') NOT NULL,
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    user_id INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. TRANSACTIONS (Transazioni)
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    payment_method VARCHAR(50),
    location VARCHAR(100),
    tags JSON,
    bank_source VARCHAR(100),
    original_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. BUDGETS (Budget)
-- ============================================================================
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(10,2) NOT NULL,
    period ENUM('daily', 'weekly', 'monthly', 'yearly') DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ============================================================================
-- 5. GOALS (Obiettivi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    deadline DATE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 6. USER_SESSIONS (Sessioni Utente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. USER_PREFERENCES (Preferenze Utente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    language VARCHAR(5) DEFAULT 'it',
    timezone VARCHAR(50) DEFAULT 'Europe/Rome',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 8. LINKED_ACCOUNTS (Conti Collegati)
-- ============================================================================
CREATE TABLE IF NOT EXISTS linked_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('checking', 'savings', 'credit', 'investment') NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'EUR',
    institution VARCHAR(100),
    account_number VARCHAR(50),
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 9. EMERGENCY_FUNDS (Fondi di Emergenza)
-- ============================================================================
CREATE TABLE IF NOT EXISTS emergency_funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    monthly_contribution DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 10. INSURANCE (Assicurazioni)
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('health', 'auto', 'home', 'life', 'disability') NOT NULL,
    provider VARCHAR(100) NOT NULL,
    monthly_premium DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(10,2),
    expiry_date DATE,
    status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 11. ALERTS (Avvisi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('low_balance', 'high_spending', 'budget_exceeded', 'unusual_transaction', 'goal_reminder') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    action_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 12. TIPS (Consigli)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('budget', 'savings', 'investment', 'debt', 'insurance') NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 13. BADGES (Badge)
-- ============================================================================
CREATE TABLE IF NOT EXISTS badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    category ENUM('savings', 'consistency', 'budget', 'achievement') NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP NULL,
    progress INT DEFAULT 0,
    max_progress INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 14. REPORTS (Report)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    period VARCHAR(100) NOT NULL,
    summary TEXT,
    insights JSON,
    recommendations JSON,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDICI PER PERFORMANCE
-- ============================================================================
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, period);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX idx_badges_user_unlocked ON badges(user_id, is_unlocked);

-- ============================================================================
-- DATI DI DEFAULT - CATEGORIE PREDEFINITE
-- ============================================================================
INSERT IGNORE INTO categories (name, description, type, color, icon, is_default) VALUES
-- Entrate
('Stipendio', 'Stipendio o salario', 'income', '#4CAF50', 'work', TRUE),
('Bonus', 'Bonus e premi', 'income', '#8BC34A', 'star', TRUE),
('Investimenti', 'Rendimenti da investimenti', 'income', '#FFC107', 'trending_up', TRUE),
('Altri Redditi', 'Altri tipi di reddito', 'income', '#9C27B0', 'attach_money', TRUE),

-- Spese
('Alimentazione', 'Spese per cibo e bevande', 'expense', '#FF5722', 'restaurant', TRUE),
('Trasporti', 'Carburante, mezzi pubblici, taxi', 'expense', '#2196F3', 'directions_car', TRUE),
('Casa', 'Affitto, bollette, manutenzione', 'expense', '#795548', 'home', TRUE),
('Intrattenimento', 'Cinema, ristoranti, hobby', 'expense', '#E91E63', 'movie', TRUE),
('Salute', 'Medicinali, visite mediche', 'expense', '#F44336', 'local_hospital', TRUE),
('Abbigliamento', 'Vestiti e accessori', 'expense', '#9E9E9E', 'checkroom', TRUE),
('Educazione', 'Corsi, libri, formazione', 'expense', '#3F51B5', 'school', TRUE),
('Viaggi', 'Vacanze e viaggi', 'expense', '#00BCD4', 'flight', TRUE),
('Shopping', 'Acquisti vari', 'expense', '#FF9800', 'shopping_cart', TRUE),
('Altri', 'Altre spese', 'expense', '#607D8B', 'more_horiz', TRUE);

-- ============================================================================
-- VISTE UTILI
-- ============================================================================

-- Vista per le statistiche mensili
CREATE OR REPLACE VIEW monthly_stats AS
SELECT 
    user_id,
    YEAR(transaction_date) as year,
    MONTH(transaction_date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_amount,
    COUNT(*) as transaction_count
FROM transactions 
GROUP BY user_id, YEAR(transaction_date), MONTH(transaction_date);

-- Vista per le statistiche per categoria
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    t.user_id,
    c.name as category_name,
    c.type as category_type,
    c.color as category_color,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(t.amount) as avg_amount
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, c.id, c.name, c.type, c.color;

-- ============================================================================
-- STORED PROCEDURES UTILI
-- ============================================================================

-- Procedura per ottenere le statistiche del dashboard
DELIMITER //
CREATE PROCEDURE GetDashboardStats(IN user_id_param INT, IN year_param INT, IN month_param INT)
BEGIN
    SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_amount,
        COUNT(*) as transaction_count
    FROM transactions 
    WHERE user_id = user_id_param 
        AND YEAR(transaction_date) = year_param 
        AND MONTH(transaction_date) = month_param;
END //
DELIMITER ;

-- Procedura per ottenere le transazioni mensili
DELIMITER //
CREATE PROCEDURE GetMonthlyTransactions(IN user_id_param INT, IN year_param INT, IN month_param INT)
BEGIN
    SELECT 
        t.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = user_id_param 
        AND YEAR(t.transaction_date) = year_param 
        AND MONTH(t.transaction_date) = month_param
    ORDER BY t.transaction_date DESC, t.created_at DESC;
END //
DELIMITER ;

-- Procedura per pulire le sessioni scadute
DELIMITER //
CREATE PROCEDURE CleanExpiredSessions()
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END //
DELIMITER ;
