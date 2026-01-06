# Миграция с MySQL на SQLite

## ✅ Выполненные изменения

### 1. Зависимости (pom.xml)
- ❌ Удалено: `mysql-connector-j` (версия 8.4.0)
- ✅ Добавлено: `sqlite-jdbc` (версия 3.44.1.0)
- ✅ Добавлено: `hibernate-community-dialects` (для SQLite диалекта)

### 2. Конфигурация (application.yml)
- **URL базы данных:**
  - Было: `jdbc:mysql://localhost:3306/CargoDB?...`
  - Стало: `jdbc:sqlite:./data/cargodb.sqlite`
  
- **Драйвер:**
  - Было: `com.mysql.cj.jdbc.Driver`
  - Стало: `org.sqlite.JDBC`
  
- **Hibernate диалект:**
  - Было: `org.hibernate.dialect.MySQLDialect`
  - Стало: `org.hibernate.community.dialect.SQLiteDialect`
  
- **HikariCP pool:**
  - Изменено: `maximum-pool-size: 1` (SQLite не поддерживает множественные соединения одновременно)
  - Изменено: `minimum-idle: 1`

- **Добавлено:**
  - `globally_quoted_identifiers: true` (для совместимости с SQLite)

### 3. Тестовая конфигурация (application-test.yml)
- **URL:** `jdbc:sqlite::memory:` (in-memory база для тестов)
- **Диалект:** `org.hibernate.community.dialect.SQLiteDialect`

### 4. .gitignore
- Добавлены исключения для SQLite файлов:
  - `*.sqlite`
  - `*.sqlite3`
  - `*.db`
  - `Spring Boot/data/`

## 📝 Важные замечания

### Отличия SQLite от MySQL:

1. **Типы данных:**
   - SQLite использует динамическую типизацию
   - Все типы конвертируются в: TEXT, INTEGER, REAL, BLOB, NULL
   - Hibernate автоматически обрабатывает конвертацию

2. **Ограничения:**
   - SQLite не поддерживает множественные одновременные записи
   - Connection pool должен быть минимальным (1 соединение)
   - Нет поддержки некоторых MySQL функций (FIND_IN_SET, DATE_FORMAT и т.д.)

3. **JPQL запросы:**
   - `CONCAT()` в JPQL должен работать (Hibernate конвертирует автоматически)
   - Если используются нативные SQL запросы, может потребоваться замена на `||` для конкатенации

4. **Путь к базе данных:**
   - По умолчанию: `./data/cargodb.sqlite`
   - Можно изменить через переменную окружения: `DB_PATH=/path/to/database.sqlite`
   - Папка `data/` создается автоматически при первом запуске

## 🚀 Использование

### Запуск приложения:
```bash
cd "Spring Boot"
mvn spring-boot:run
```

База данных будет создана автоматически в `./data/cargodb.sqlite` при первом запуске.

### Переменные окружения:
```bash
# Путь к базе данных (опционально)
export DB_PATH=./data/cargodb.sqlite

# Hibernate DDL режим (опционально)
export HIBERNATE_DDL_AUTO=update
```

## ⚠️ Миграция существующих данных

Если у вас есть данные в MySQL, их нужно мигрировать:

1. Экспорт из MySQL:
```bash
mysqldump -u username -p CargoDB > cargodb.sql
```

2. Конвертация в SQLite формат (требуются дополнительные инструменты):
   - Используйте инструменты типа `mysql2sqlite` или вручную адаптируйте SQL

3. Импорт в SQLite:
```bash
sqlite3 cargodb.sqlite < converted.sql
```

## 🔍 Проверка работы

После запуска проверьте:
1. ✅ Приложение запускается без ошибок
2. ✅ База данных создается в `./data/cargodb.sqlite`
3. ✅ Таблицы создаются автоматически (если `ddl-auto=update`)
4. ✅ API работает корректно

## 📚 Дополнительная информация

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Hibernate SQLite Dialect](https://github.com/hibernate/hibernate-orm/tree/main/hibernate-community-dialects)
- [SQLite JDBC Driver](https://github.com/xerial/sqlite-jdbc)


