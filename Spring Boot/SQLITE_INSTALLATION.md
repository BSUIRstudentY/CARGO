# Установка SQLite

## ⚠️ Важно о SQLite

**SQLite - это файловая база данных**, которая не требует отдельной установки как сервис. JDBC драйвер уже включен в проект через Maven зависимость.

**SQLite НЕ использует логин и пароль** - это файловая база данных без аутентификации. Логин и пароль в конфигурации добавлены для совместимости, но они не используются.

## 📦 Установка SQLite CLI (опционально)

SQLite CLI нужен только если вы хотите управлять базой данных через командную строку. Для работы приложения это НЕ требуется.

### На Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install sqlite3
```

Проверка установки:
```bash
sqlite3 --version
```

### На сервере (через SSH):

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Установите SQLite
sudo apt update
sudo apt install sqlite3 -y

# Проверьте установку
sqlite3 --version
```

### На Windows:

1. Скачайте с официального сайта: https://www.sqlite.org/download.html
2. Распакуйте в папку (например, `C:\sqlite`)
3. Добавьте путь в переменную окружения PATH
4. Перезапустите командную строку

## 🔧 Использование SQLite CLI

### Подключение к базе данных:

```bash
# Локально
sqlite3 ./data/cargodb.sqlite

# На сервере (если база в /path/to/database.sqlite)
sqlite3 /path/to/cargodb.sqlite
```

### Основные команды:

```sql
-- Показать все таблицы
.tables

-- Показать структуру таблицы
.schema table_name

-- Выполнить SQL запрос
SELECT * FROM users;

-- Выход
.quit
```

## 🚀 Работа приложения

### Для работы Spring Boot приложения:

**SQLite НЕ требует установки!** JDBC драйвер уже включен в проект через:
```xml
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.44.1.0</version>
</dependency>
```

Приложение автоматически:
1. Создаст файл базы данных при первом запуске: `./data/cargodb.sqlite`
2. Создаст все таблицы автоматически (если `ddl-auto=update`)
3. Будет работать без дополнительной настройки

### Запуск приложения:

```bash
cd "Spring Boot"
mvn spring-boot:run
```

База данных будет создана автоматически в `./data/cargodb.sqlite`.

## 🔐 О логине и пароле

**SQLite не поддерживает аутентификацию.** Логин и пароль в конфигурации (`fluvion_user` / `1206_1105timaZ`) добавлены для совместимости, но они **не используются**.

Если вам нужна аутентификация, рассмотрите:
- **SQLCipher** - расширение SQLite с шифрованием (требует дополнительной настройки)
- **MySQL/PostgreSQL** - полноценные СУБД с аутентификацией

## 📁 Расположение базы данных

По умолчанию база данных создается в:
- **Локально:** `./data/cargodb.sqlite` (относительно папки Spring Boot)
- **На сервере:** можно изменить через переменную окружения `DB_PATH`

### Изменение пути к базе данных:

```bash
# Через переменную окружения
export DB_PATH=/var/lib/cargosite/cargodb.sqlite
mvn spring-boot:run

# Или в application.yml напрямую
# url: jdbc:sqlite:/var/lib/cargosite/cargodb.sqlite
```

## ✅ Проверка работы

1. Запустите приложение:
   ```bash
   mvn spring-boot:run
   ```

2. Проверьте, что файл базы создан:
   ```bash
   ls -la data/cargodb.sqlite
   ```

3. (Опционально) Подключитесь через SQLite CLI:
   ```bash
   sqlite3 data/cargodb.sqlite
   .tables
   .quit
   ```

## 🛠️ Резервное копирование

SQLite база - это один файл, поэтому резервное копирование очень простое:

```bash
# Копирование базы данных
cp data/cargodb.sqlite data/cargodb.sqlite.backup

# Или через SQLite
sqlite3 data/cargodb.sqlite ".backup 'data/cargodb.sqlite.backup'"
```

## 📚 Дополнительная информация

- [SQLite Official Website](https://www.sqlite.org/)
- [SQLite JDBC Driver](https://github.com/xerial/sqlite-jdbc)
- [SQLite Documentation](https://www.sqlite.org/docs.html)


