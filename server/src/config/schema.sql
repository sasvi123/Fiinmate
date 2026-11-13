-- FinWise Database Schema for Aiven MySQL

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    monthly_budget DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(50) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) DEFAULT 'wallet',
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    title VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Category-Wise Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    allocated_amount DECIMAL(10, 2) NOT NULL,
    month TINYINT NOT NULL,
    year SMALLINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY user_category_period (user_id, category_id, month, year)
) ENGINE=InnoDB;

-- Seed default categories for student finances if not present
INSERT IGNORE INTO categories (id, user_id, name, type, icon, is_default) VALUES
(1, NULL, 'Tuition & Books', 'expense', 'book', TRUE),
(2, NULL, 'Food & Dining', 'expense', 'restaurant', TRUE),
(3, NULL, 'Housing & Rent', 'expense', 'home', TRUE),
(4, NULL, 'Transportation', 'expense', 'bus', TRUE),
(5, NULL, 'Entertainment & Social', 'expense', 'game-controller', TRUE),
(6, NULL, 'Groceries', 'expense', 'cart', TRUE),
(7, NULL, 'Healthcare', 'expense', 'medkit', TRUE),
(8, NULL, 'Allowance / Pocket Money', 'income', 'cash', TRUE),
(9, NULL, 'Part-time Job / Salary', 'income', 'briefcase', TRUE),
(10, NULL, 'Scholarship / Financial Aid', 'income', 'school', TRUE);

