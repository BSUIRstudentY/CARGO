-- SQL скрипт для удаления колонок balance и reservedBalance из таблицы users
-- и balance_amount из таблицы orders
-- SQLite не поддерживает ALTER TABLE DROP COLUMN, поэтому пересоздаем таблицы

-- ВАЖНО: Сделайте резервную копию базы данных перед выполнением!

BEGIN TRANSACTION;

-- 1. Удаляем колонки balance и reserved_balance из таблицы users
-- Создаем временную таблицу users_new без колонок balance и reserved_balance
CREATE TABLE users_new (
    email VARCHAR(255) PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(255) NOT NULL,
    referral_code VARCHAR(255),
    referral_count INTEGER NOT NULL DEFAULT 0,
    discount_percent FLOAT NOT NULL DEFAULT 0.0,
    temporary_discount_percent FLOAT NOT NULL DEFAULT 0.0,
    temporary_discount_expired TIMESTAMP,
    created_at TIMESTAMP,
    money_spent FLOAT,
    notifications_enabled BOOLEAN NOT NULL DEFAULT 0,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT 0,
    avatar_url VARCHAR(255),
    email_verified BOOLEAN NOT NULL DEFAULT 0,
    phone VARCHAR(255),
    phone_verified BOOLEAN NOT NULL DEFAULT 0,
    telegram VARCHAR(255),
    telegram_verified BOOLEAN NOT NULL DEFAULT 0,
    referred_by_email VARCHAR(255),
    FOREIGN KEY (referred_by_email) REFERENCES users(email)
);

-- Копируем данные из старой таблицы (исключая balance и reserved_balance)
INSERT INTO users_new (
    email, username, password, company, role, referral_code, referral_count,
    discount_percent, temporary_discount_percent, temporary_discount_expired,
    created_at, money_spent, notifications_enabled, two_factor_enabled,
    avatar_url, email_verified, phone, phone_verified, telegram, telegram_verified, referred_by_email
)
SELECT 
    email, username, password, company, role, referral_code, referral_count,
    discount_percent, temporary_discount_percent, temporary_discount_expired,
    created_at, money_spent, notifications_enabled, two_factor_enabled,
    avatar_url, email_verified, phone, phone_verified, telegram, telegram_verified, referred_by_email
FROM users;

-- Удаляем старую таблицу
DROP TABLE users;

-- Переименовываем новую таблицу
ALTER TABLE users_new RENAME TO users;

-- 2. Удаляем колонку balance_amount из таблицы orders
-- Сначала получаем полную структуру таблицы orders
-- Создаем временную таблицу orders_new без колонки balance_amount
-- (используем структуру из Hibernate, но без balance_amount)

-- Получаем все колонки кроме balance_amount
CREATE TABLE orders_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email VARCHAR(255) NOT NULL,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    reason_refusal TEXT,
    date_created TIMESTAMP NOT NULL,
    status VARCHAR(255) NOT NULL,
    total_client_price FLOAT NOT NULL,
    supplier_cost FLOAT,
    customs_duty FLOAT,
    shipping_cost FLOAT,
    shipping_rate_fixed DOUBLE,
    insurance_cost FLOAT,
    insurance BOOLEAN DEFAULT 0,
    payment_method VARCHAR(255),
    discount_applied FLOAT,
    user_discount_applied FLOAT,
    discount_type VARCHAR(255),
    discount_value FLOAT,
    delivery_address VARCHAR(500),
    phone VARCHAR(255),
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    middle_name VARCHAR(255),
    tracking_number VARCHAR(255),
    china_tracking_number VARCHAR(255),
    international_tracking_number VARCHAR(255),
    local_tracking_number VARCHAR(255),
    weight FLOAT,
    volume_weight FLOAT,
    chargeable_weight FLOAT,
    customs_declaration_number VARCHAR(255),
    customs_status VARCHAR(255),
    customs_clearance_date TIMESTAMP,
    customs_value FLOAT,
    shipped_from_china_date TIMESTAMP,
    arrived_at_customs_date TIMESTAMP,
    estimated_delivery_date TIMESTAMP,
    actual_delivery_date TIMESTAMP,
    carrier_name VARCHAR(255),
    carrier_service VARCHAR(255),
    promocode_id INTEGER,
    batch_cargo_id INTEGER,
    FOREIGN KEY (user_email) REFERENCES users(email),
    FOREIGN KEY (promocode_id) REFERENCES promocodes(id),
    FOREIGN KEY (batch_cargo_id) REFERENCES batch_cargos(id)
);

-- Копируем данные из старой таблицы (исключая balance_amount)
-- Используем явное указание всех колонок кроме balance_amount
INSERT INTO orders_new (
    id, user_email, order_number, reason_refusal, date_created, status,
    total_client_price, supplier_cost, customs_duty, shipping_cost,
    shipping_rate_fixed, insurance_cost, insurance, payment_method,
    discount_applied, user_discount_applied, discount_type, discount_value,
    delivery_address, phone, last_name, first_name, middle_name,
    tracking_number, china_tracking_number, international_tracking_number,
    local_tracking_number, weight, volume_weight, chargeable_weight,
    customs_declaration_number, customs_status, customs_clearance_date,
    customs_value, shipped_from_china_date, arrived_at_customs_date,
    estimated_delivery_date, actual_delivery_date, carrier_name, carrier_service,
    promocode_id, batch_cargo_id
)
SELECT 
    id, user_email, order_number, reason_refusal, date_created, status,
    total_client_price, supplier_cost, customs_duty, shipping_cost,
    shipping_rate_fixed, insurance_cost, insurance, payment_method,
    discount_applied, user_discount_applied, discount_type, discount_value,
    delivery_address, phone, last_name, first_name, middle_name,
    tracking_number, china_tracking_number, international_tracking_number,
    local_tracking_number, weight, volume_weight, chargeable_weight,
    customs_declaration_number, customs_status, customs_clearance_date,
    customs_value, shipped_from_china_date, arrived_at_customs_date,
    estimated_delivery_date, actual_delivery_date, carrier_name, carrier_service,
    promocode_id, batch_cargo_id
FROM orders;

-- Удаляем старую таблицу
DROP TABLE orders;

-- Переименовываем новую таблицу
ALTER TABLE orders_new RENAME TO orders;

-- Восстанавливаем индексы
CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_date_created ON orders(date_created);

COMMIT;
