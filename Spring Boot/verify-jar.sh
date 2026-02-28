#!/bin/bash

# Скрипт для проверки, что SQLite база данных не попала в JAR

JAR_FILE="${1:-target/demo-0.0.1-SNAPSHOT.jar}"

if [ ! -f "$JAR_FILE" ]; then
    echo "❌ JAR файл не найден: $JAR_FILE"
    echo "   Использование: $0 [путь/к/jar/файлу.jar]"
    exit 1
fi

echo "🔍 Проверяю JAR файл: $JAR_FILE"
echo ""

# Проверяем наличие SQLite файлов
echo "1. Проверка SQLite файлов в JAR..."
SQLITE_FILES=$(jar -tf "$JAR_FILE" 2>/dev/null | grep -iE "\.sqlite|\.sqlite3|\.db" | grep -v "sqlite-jdbc")

if [ -n "$SQLITE_FILES" ]; then
    echo "   ❌ ОБНАРУЖЕНЫ SQLite файлы:"
    echo "$SQLITE_FILES" | sed 's/^/      /'
    echo ""
    echo "   ⚠️  ВНИМАНИЕ: SQLite база данных попала в JAR!"
    echo "   Это означает, что локальная база будет на сервере."
    exit 1
else
    echo "   ✅ SQLite файлы не найдены"
fi

# Проверяем наличие директории data/
echo ""
echo "2. Проверка директории data/ в JAR..."
DATA_DIR=$(jar -tf "$JAR_FILE" 2>/dev/null | grep -i "^data/" | head -5)

if [ -n "$DATA_DIR" ]; then
    echo "   ⚠️  Обнаружена директория data/:"
    echo "$DATA_DIR" | sed 's/^/      /'
    echo ""
    echo "   Проверьте, что это не SQLite база данных"
else
    echo "   ✅ Директория data/ не найдена"
fi

# Проверяем размер JAR
echo ""
echo "3. Информация о JAR файле:"
JAR_SIZE=$(stat -f%z "$JAR_FILE" 2>/dev/null || stat -c%s "$JAR_FILE" 2>/dev/null)
echo "   Размер: $(numfmt --to=iec-i --suffix=B $JAR_SIZE 2>/dev/null || echo "${JAR_SIZE} bytes")"

# Показываем структуру JAR (первые 20 строк)
echo ""
echo "4. Структура JAR (первые 20 файлов):"
jar -tf "$JAR_FILE" 2>/dev/null | head -20 | sed 's/^/      /'

echo ""
echo "✅ Проверка завершена!"
echo ""
echo "💡 Если SQLite файлы найдены, проверьте:"
echo "   1. pom.xml - должны быть исключения для *.sqlite, *.db, data/"
echo "   2. .gitignore - SQLite файлы должны быть исключены"
echo "   3. Убедитесь, что SQLite не находится в src/main/resources"






























