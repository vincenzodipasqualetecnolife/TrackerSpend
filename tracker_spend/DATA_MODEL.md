# TrackerSpend - Data Model Documentation

## Overview
Questo documento definisce il modello dati completo per l'applicazione TrackerSpend, includendo tutte le tabelle, relazioni e campi necessari per gestire le finanze personali degli utenti.

## Database Schema

### 1. USERS (Utenti)
**Tabella principale per gli utenti dell'applicazione**

```sql
CREATE TABLE users (
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
```

**Relazioni:**
- `users` → `categories` (1:N)
- `users` → `transactions` (1:N)
- `users` → `budgets` (1:N)
- `users` → `goals` (1:N)
- `users` → `user_sessions` (1:N)
- `users` → `user_preferences` (1:1)
- `users` → `linked_accounts` (1:N)
- `users` → `emergency_funds` (1:N)
- `users` → `insurance` (1:N)
- `users` → `alerts` (1:N)
- `users` → `tips` (1:N)
- `users` → `badges` (1:N)
- `users` → `reports` (1:N)

### 2. CATEGORIES (Categorie)
**Categorie personalizzate per le transazioni**

```sql
CREATE TABLE categories (
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
```

**Relazioni:**
- `categories` → `transactions` (1:N)
- `categories` → `budgets` (1:N)

### 3. TRANSACTIONS (Transazioni)
**Transazioni finanziarie degli utenti**

```sql
CREATE TABLE transactions (
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
    bank_source VARCHAR(100), -- Es: 'Intesa Sanpaolo', 'UniCredit'
    original_data JSON, -- Dati originali dal file importato
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

**Relazioni:**
- `transactions` ← `users` (N:1)
- `transactions` ← `categories` (N:1)

### 4. BUDGETS (Budget)
**Budget mensili/periodici per categoria**

```sql
CREATE TABLE budgets (
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
```

### 5. GOALS (Obiettivi)
**Obiettivi di risparmio degli utenti**

```sql
CREATE TABLE goals (
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
```

### 6. USER_SESSIONS (Sessioni Utente)
**Gestione delle sessioni di autenticazione**

```sql
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 7. USER_PREFERENCES (Preferenze Utente)
**Preferenze personalizzate degli utenti**

```sql
CREATE TABLE user_preferences (
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
```

### 8. LINKED_ACCOUNTS (Conti Collegati)
**Conti bancari collegati dagli utenti**

```sql
CREATE TABLE linked_accounts (
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
```

### 9. EMERGENCY_FUNDS (Fondi di Emergenza)
**Fondi di emergenza degli utenti**

```sql
CREATE TABLE emergency_funds (
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
```

### 10. INSURANCE (Assicurazioni)
**Polizze assicurative degli utenti**

```sql
CREATE TABLE insurance (
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
```

### 11. ALERTS (Avvisi)
**Sistema di avvisi e notifiche**

```sql
CREATE TABLE alerts (
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
```

### 12. TIPS (Consigli)
**Consigli finanziari personalizzati**

```sql
CREATE TABLE tips (
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
```

### 13. BADGES (Badge)
**Sistema di achievement e badge**

```sql
CREATE TABLE badges (
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
```

### 14. REPORTS (Report)
**Report finanziari generati**

```sql
CREATE TABLE reports (
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
```

## Indici per Performance

```sql
-- Indici principali per le query più frequenti
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, period);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_alerts_user_read ON alerts(user_id, is_read);
CREATE INDEX idx_badges_user_unlocked ON badges(user_id, is_unlocked);
```

## Dati di Default

### Categorie Predefinite
```sql
INSERT INTO categories (name, description, type, color, icon, is_default) VALUES
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
```

## Note Implementative

1. **Multi-tenancy**: Tutte le tabelle principali hanno `user_id` per isolare i dati per utente
2. **Soft Delete**: Considerare l'aggiunta di `deleted_at` per eliminazioni soft
3. **Audit Trail**: I campi `created_at` e `updated_at` forniscono tracciabilità
4. **JSON Fields**: Utilizzati per dati flessibili come `tags`, `original_data`, `insights`
5. **Enums**: Utilizzati per valori predefiniti e validazione a livello DB
6. **Foreign Keys**: Tutte le relazioni sono protette da foreign key constraints

## Query di Esempio

### Transazioni Mensili
```sql
SELECT 
    t.*,
    c.name as category_name,
    c.color as category_color
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = ? 
    AND t.transaction_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
    AND t.transaction_date < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH)
ORDER BY t.transaction_date DESC;
```

### Statistiche Dashboard
```sql
SELECT 
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
    COUNT(*) as transaction_count
FROM transactions 
WHERE user_id = ? 
    AND transaction_date >= DATE_FORMAT(NOW(), '%Y-%m-01')
    AND transaction_date < DATE_ADD(DATE_FORMAT(NOW(), '%Y-%m-01'), INTERVAL 1 MONTH);
```
