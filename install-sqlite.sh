#!/bin/bash

# Скрипт для установки SQLite на сервере
# Использование: ./install-sqlite.sh

echo "=== Установка SQLite на сервере ==="
echo ""

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Запустите скрипт с правами root: sudo ./install-sqlite.sh"
    exit 1
fi

# Обновление списка пакетов
echo "📦 Обновление списка пакетов..."
apt update

# Установка SQLite
echo "📦 Установка SQLite..."
apt install sqlite3 -y

# Проверка установки
echo ""
echo "✅ Проверка установки..."
if command -v sqlite3 &> /dev/null; then
    VERSION=$(sqlite3 --version)
    echo "✅ SQLite успешно установлен: $VERSION"
else
    echo "❌ Ошибка установки SQLite"
    exit 1
fi

echo ""
echo "=== Установка завершена ==="
echo ""
echo "Использование:"
echo "  sqlite3 /path/to/database.sqlite"
echo ""
echo "⚠️  ВАЖНО: SQLite НЕ требует установки для работы Spring Boot приложения!"
echo "   JDBC драйвер уже включен в проект через Maven."
echo "   SQLite CLI нужен только для ручного управления базой данных."


