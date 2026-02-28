# Инструкция по миграции на сервере: Удаление колонок balance

## ⚠️ ВАЖНО: Перед выполнением миграции

1. **Обязательно создайте резервную копию базы данных**
2. **Остановите приложение** перед выполнением миграции
3. **Проверьте**, что у вас есть доступ к серверу и права на выполнение SQL

---

## Способ 1: Автоматическая миграция (рекомендуется)

### Шаги:

1. **Подключитесь к серверу:**
   ```bash
   ssh root@fluvion.vm
   # или
   ssh ваш_пользователь@ваш_сервер
   ```

2. **Перейдите в директорию приложения:**
   ```bash
   cd /path/to/your/application
   # Например: cd /opt/fluvion
   ```

3. **Остановите приложение:**
   ```bash
   systemctl stop fluvion
   # или
   ./stop.sh
   # или используйте ваш способ остановки
   ```

4. **Сделайте резервную копию базы данных вручную:**
   ```bash
   # Найдите путь к базе данных (обычно в application.yml указан)
   # Например: ./data/cargo.sqlite
   
   cp ./data/cargo.sqlite ./data/cargo.sqlite.backup.$(date +%Y%m%d_%H%M%S)
   
   # Или если база данных в другом месте:
   cp /path/to/cargo.sqlite /path/to/cargo.sqlite.backup.$(date +%Y%m%d_%H%M%S)
   ```

5. **Скопируйте скрипт миграции на сервер:**
   ```bash
   # Если вы уже на сервере, просто скачайте файл migrate_remove_balance_server.sh
   # Или скопируйте его через scp:
   # scp migrate_remove_balance_server.sh root@fluvion.vm:/path/to/application/
   ```

6. **Сделайте скрипт исполняемым:**
   ```bash
   chmod +x migrate_remove_balance_server.sh
   ```

7. **Установите переменную окружения (если нужно):**
   ```bash
   export DB_PATH="./data/cargo.sqlite"
   # или путь к вашей базе данных
   ```

8. **Запустите миграцию:**
   ```bash
   ./migrate_remove_balance_server.sh
   ```

9. **Проверьте результат:**
   - Скрипт автоматически проверит количество записей до и после миграции
   - Убедитесь, что все данные сохранены

10. **Запустите приложение:**
    ```bash
    systemctl start fluvion
    # или
    ./start.sh
    ```

---

## Способ 2: Ручная миграция через SQL

Если автоматический скрипт не подходит, выполните миграцию вручную:

### Шаги:

1. **Подключитесь к серверу и остановите приложение** (см. шаги 1-3 выше)

2. **Создайте резервную копию:**
   ```bash
   cp ./data/cargo.sqlite ./data/cargo.sqlite.backup.$(date +%Y%m%d_%H%M%S)
   ```

3. **Подключитесь к базе данных SQLite:**
   ```bash
   sqlite3 ./data/cargo.sqlite
   ```

4. **Проверьте текущее состояние:**
   ```sql
   -- Проверьте наличие колонок
   PRAGMA table_info(users);
   PRAGMA table_info(orders);
   
   -- Подсчитайте записи
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM orders;
   ```

5. **Выполните миграцию:**
   
   Скопируйте и выполните SQL из файла `remove_balance_columns.sql`:
   
   ```sql
   BEGIN TRANSACTION;
   
   -- Удаление колонок из users
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
   
   -- Удаление balance_amount из orders (если существует)
   CREATE TABLE orders_new AS 
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
   FROM orders
   WHERE 1=0;
   
   INSERT INTO orders_new 
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
   
   CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);
   CREATE INDEX IF NOT EXISTS idx_user_email ON orders(user_email);
   CREATE INDEX IF NOT EXISTS idx_status ON orders(status);
   CREATE INDEX IF NOT EXISTS idx_tracking_number ON orders(tracking_number);
   CREATE INDEX IF NOT EXISTS idx_date_created ON orders(date_created);
   
   COMMIT;
   ```

6. **Проверьте результат:**
   ```sql
   -- Проверьте, что колонки удалены
   PRAGMA table_info(users);
   PRAGMA table_info(orders);
   
   -- Проверьте количество записей
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM orders;
   ```

7. **Выйдите из SQLite:**
   ```sql
   .quit
   ```

8. **Запустите приложение:**
   ```bash
   systemctl start fluvion
   ```

---

## Проверка после миграции

После выполнения миграции проверьте:

1. **Количество записей не изменилось:**
   ```bash
   sqlite3 ./data/cargo.sqlite "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM orders;"
   ```

2. **Колонки balance удалены:**
   ```bash
   sqlite3 ./data/cargo.sqlite "PRAGMA table_info(users);" | grep balance
   # Должно быть пусто
   
   sqlite3 ./data/cargo.sqlite "PRAGMA table_info(orders);" | grep balance
   # Должно быть пусто
   ```

3. **Приложение запускается без ошибок:**
   ```bash
   systemctl status fluvion
   # или проверьте логи
   journalctl -u fluvion -f
   ```

4. **Попробуйте зарегистрировать нового пользователя** - ошибка `NOT NULL constraint failed: users.balance` больше не должна появляться

---

## Откат миграции (если что-то пошло не так)

Если миграция прошла неудачно:

1. **Остановите приложение:**
   ```bash
   systemctl stop fluvion
   ```

2. **Восстановите из резервной копии:**
   ```bash
   cp ./data/cargo.sqlite.backup.YYYYMMDD_HHMMSS ./data/cargo.sqlite
   # Замените YYYYMMDD_HHMMSS на дату вашей резервной копии
   ```

3. **Запустите приложение:**
   ```bash
   systemctl start fluvion
   ```

---

## Дополнительные замечания

- **Время выполнения:** Миграция обычно занимает несколько секунд, в зависимости от размера базы данных
- **Простой:** Приложение должно быть остановлено на время миграции (обычно 1-2 минуты)
- **Безопасность:** Все данные сохраняются, только удаляются колонки balance
- **Hibernate:** После миграции Hibernate с `ddl-auto=update` не будет пытаться создать эти колонки снова, так как они удалены из Java-классов

---

## Поддержка

Если возникли проблемы:
1. Проверьте логи приложения: `journalctl -u fluvion -n 100`
2. Убедитесь, что резервная копия создана
3. Проверьте права доступа к файлу базы данных
4. Убедитесь, что приложение остановлено перед миграцией










