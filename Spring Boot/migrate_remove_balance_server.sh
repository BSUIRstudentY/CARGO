#!/bin/bash

# Скрипт для безопасного удаления колонок balance на сервере
# ВАЖНО: Выполняйте этот скрипт только после создания резервной копии!

set -e  # Остановка при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Миграция: Удаление колонок balance из базы данных ===${NC}"
echo ""

# Определяем путь к базе данных
DB_PATH="${DB_PATH:-./data/cargo.sqlite}"

if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}ОШИБКА: База данных не найдена: $DB_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}Найдена база данных: $DB_PATH${NC}"

# Создаем резервную копию
BACKUP_PATH="${DB_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Создаю резервную копию: $BACKUP_PATH${NC}"
cp "$DB_PATH" "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Резервная копия создана успешно!${NC}"
else
    echo -e "${RED}ОШИБКА: Не удалось создать резервную копию!${NC}"
    exit 1
fi

# Проверяем наличие колонок balance
echo ""
echo -e "${YELLOW}Проверяю наличие колонок balance...${NC}"

HAS_BALANCE=$(sqlite3 "$DB_PATH" "PRAGMA table_info(users);" | grep -c "balance" || echo "0")
HAS_RESERVED_BALANCE=$(sqlite3 "$DB_PATH" "PRAGMA table_info(users);" | grep -c "reserved_balance" || echo "0")
HAS_BALANCE_AMOUNT=$(sqlite3 "$DB_PATH" "PRAGMA table_info(orders);" | grep -c "balance_amount" || echo "0")

if [ "$HAS_BALANCE" -eq 0 ] && [ "$HAS_RESERVED_BALANCE" -eq 0 ] && [ "$HAS_BALANCE_AMOUNT" -eq 0 ]; then
    echo -e "${GREEN}Колонки balance уже удалены. Миграция не требуется.${NC}"
    exit 0
fi

echo -e "${YELLOW}Найдены колонки для удаления:${NC}"
[ "$HAS_BALANCE" -gt 0 ] && echo "  - users.balance"
[ "$HAS_RESERVED_BALANCE" -gt 0 ] && echo "  - users.reserved_balance"
[ "$HAS_BALANCE_AMOUNT" -gt 0 ] && echo "  - orders.balance_amount"

# Подсчитываем количество записей
USER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
ORDER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM orders;" 2>/dev/null || echo "0")

echo ""
echo -e "${GREEN}Текущее состояние базы данных:${NC}"
echo "  Пользователей: $USER_COUNT"
echo "  Заказов: $ORDER_COUNT"

echo ""
read -p "Продолжить миграцию? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${YELLOW}Миграция отменена.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Начинаю миграцию...${NC}"

# Выполняем миграцию
sqlite3 "$DB_PATH" <<'EOF'
BEGIN TRANSACTION;

-- 1. Удаляем колонки balance и reserved_balance из таблицы users
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

-- Копируем данные (исключая balance и reserved_balance)
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

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- 2. Удаляем колонку balance_amount из таблицы orders (если существует)
-- Создаем новую таблицу без balance_amount
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

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;

-- Восстанавливаем индексы
CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_date_created ON orders(date_created);

COMMIT;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Миграция выполнена успешно!${NC}"
    
    # Проверяем результат
    NEW_USER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
    NEW_ORDER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM orders;" 2>/dev/null || echo "0")
    
    echo ""
    echo -e "${GREEN}Проверка данных после миграции:${NC}"
    echo "  Пользователей: $NEW_USER_COUNT (было: $USER_COUNT)"
    echo "  Заказов: $NEW_ORDER_COUNT (было: $ORDER_COUNT)"
    
    if [ "$NEW_USER_COUNT" -eq "$USER_COUNT" ] && [ "$NEW_ORDER_COUNT" -eq "$ORDER_COUNT" ]; then
        echo -e "${GREEN}✓ Все данные сохранены!${NC}"
    else
        echo -e "${RED}⚠ ВНИМАНИЕ: Количество записей изменилось!${NC}"
        echo -e "${YELLOW}Восстановите из резервной копии: $BACKUP_PATH${NC}"
    fi
    
    # Проверяем, что колонки удалены
    echo ""
    echo -e "${YELLOW}Проверяю удаление колонок...${NC}"
    REMAINING_BALANCE=$(sqlite3 "$DB_PATH" "PRAGMA table_info(users);" | grep -c "balance" || echo "0")
    REMAINING_BALANCE_AMOUNT=$(sqlite3 "$DB_PATH" "PRAGMA table_info(orders);" | grep -c "balance_amount" || echo "0")
    
    if [ "$REMAINING_BALANCE" -eq 0 ] && [ "$REMAINING_BALANCE_AMOUNT" -eq 0 ]; then
        echo -e "${GREEN}✓ Все колонки balance успешно удалены!${NC}"
    else
        echo -e "${RED}⚠ ОШИБКА: Некоторые колонки не удалены!${NC}"
        echo -e "${YELLOW}Восстановите из резервной копии: $BACKUP_PATH${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}Резервная копия сохранена: $BACKUP_PATH${NC}"
    echo -e "${YELLOW}Рекомендуется сохранить её в безопасном месте перед удалением.${NC}"
else
    echo -e "${RED}ОШИБКА при выполнении миграции!${NC}"
    echo -e "${YELLOW}Восстанавливаю из резервной копии...${NC}"
    cp "$BACKUP_PATH" "$DB_PATH"
    echo -e "${GREEN}База данных восстановлена из резервной копии.${NC}"
    exit 1
fi

