#!/bin/bash

# Скрипт для настройки SQLite базы данных на сервере (без Docker)

echo "🔧 Настройка SQLite базы данных на сервере..."
echo ""

# Определяем рабочую директорию (где будет запускаться Spring Boot)
WORK_DIR="${1:-/opt/fluvion}"
DB_DIR="${WORK_DIR}/data"
DB_FILE="${DB_DIR}/cargodb.sqlite"

echo "📂 Рабочая директория: $WORK_DIR"
echo "📂 Директория базы данных: $DB_DIR"
echo "📄 Файл базы данных: $DB_FILE"
echo ""

# Создаем директорию для базы данных
echo "1. Создаю директорию для базы данных..."
mkdir -p "$DB_DIR"

if [ $? -eq 0 ]; then
    echo "   ✅ Директория создана: $DB_DIR"
else
    echo "   ❌ Ошибка создания директории!"
    exit 1
fi

# Проверяем, существует ли уже файл базы данных
if [ -f "$DB_FILE" ]; then
    echo ""
    echo "2. Файл базы данных уже существует: $DB_FILE"
    echo "   Размер: $(ls -lh "$DB_FILE" | awk '{print $5}')"
    echo "   ⚠️  Если хотите создать новую базу, удалите этот файл: rm $DB_FILE"
else
    echo ""
    echo "2. Создаю пустой файл базы данных..."
    touch "$DB_FILE"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Файл создан: $DB_FILE"
    else
        echo "   ❌ Ошибка создания файла!"
        exit 1
    fi
fi

# Устанавливаем права доступа
echo ""
echo "3. Устанавливаю права доступа..."
chmod 664 "$DB_FILE"
chmod 755 "$DB_DIR"

# Определяем пользователя, который будет запускать Spring Boot
SPRING_USER="${2:-www-data}"

if id "$SPRING_USER" &>/dev/null; then
    chown -R "$SPRING_USER:$SPRING_USER" "$DB_DIR"
    echo "   ✅ Права установлены для пользователя: $SPRING_USER"
else
    echo "   ⚠️  Пользователь $SPRING_USER не найден, права не изменены"
    echo "   Установите права вручную: chown -R <user>:<group> $DB_DIR"
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📝 Важно:"
echo "   - Spring Boot должен запускаться из директории: $WORK_DIR"
echo "   - База данных будет в: $DB_FILE"
echo "   - При первом запуске Spring Boot создаст таблицы автоматически (ddl-auto: update)"
echo ""
echo "🚀 Запуск Spring Boot:"
echo "   cd $WORK_DIR"
echo "   java -jar backend.jar"
echo ""
echo "💡 Если база данных не создается автоматически, проверьте:"
echo "   1. Права доступа на директорию $DB_DIR"
echo "   2. Что Spring Boot запускается из правильной директории"
echo "   3. Логи Spring Boot: journalctl -u ваш-сервис или логи приложения"






























