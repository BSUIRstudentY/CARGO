-- SQL скрипт для удаления колонок balance и reservedBalance из таблицы users
-- Упрощенная версия только для таблицы users

BEGIN TRANSACTION;

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

COMMIT;










