#!/bin/bash

# Скрипт для деплоя Spring Boot приложения на сервер
# ВАЖНО: Не копирует SQLite базу данных с локального компьютера

SERVER_USER="root"
SERVER_HOST="93.125.114.252"
SERVER_PATH="/opt/fluvion"
BACKEND_JAR_NAME="backend.jar"

echo "🔨 Собираю Spring Boot приложение..."
cd "$(dirname "$0")"

# Собираем JAR файл
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке!"
    exit 1
fi

# Находим собранный JAR файл
JAR_FILE=$(find target -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo "❌ JAR файл не найден!"
    exit 1
fi

echo "✅ Сборка завершена: $JAR_FILE"

# КРИТИЧНО: Проверяем, что SQLite база НЕ попала в JAR
echo "🔍 Проверяю, что SQLite база данных не попала в JAR..."
SQLITE_IN_JAR=$(jar -tf "$JAR_FILE" 2>/dev/null | grep -i "\.sqlite\|\.db\|data/cargodb" | head -5)

if [ -n "$SQLITE_IN_JAR" ]; then
    echo "❌ КРИТИЧЕСКАЯ ОШИБКА: SQLite база данных обнаружена в JAR файле!"
    echo "   Найденные файлы:"
    echo "$SQLITE_IN_JAR"
    echo ""
    echo "   Это означает, что локальная база данных будет скопирована на сервер!"
    echo "   Пожалуйста, проверьте pom.xml и убедитесь, что SQLite файлы исключены."
    exit 1
else
    echo "✅ SQLite база данных НЕ найдена в JAR - всё в порядке!"
fi

# Проверяем размер файла
LOCAL_SIZE=$(stat -f%z "$JAR_FILE" 2>/dev/null || stat -c%s "$JAR_FILE" 2>/dev/null)
echo "📊 Размер JAR файла: $(numfmt --to=iec-i --suffix=B $LOCAL_SIZE 2>/dev/null || echo "${LOCAL_SIZE} bytes")"

# Создаем временную директорию на сервере
echo "📤 Подготавливаю сервер..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# Копируем ТОЛЬКО JAR файл (НЕ копируем data/ директорию!)
echo "🚀 Загружаю JAR файл на сервер..."
scp "$JAR_FILE" ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/${BACKEND_JAR_NAME}

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при загрузке JAR файла!"
    exit 1
fi

# Проверяем размер файла на сервере
REMOTE_SIZE=$(ssh ${SERVER_USER}@${SERVER_HOST} "stat -f%z ${SERVER_PATH}/${BACKEND_JAR_NAME} 2>/dev/null || stat -c%s ${SERVER_PATH}/${BACKEND_JAR_NAME} 2>/dev/null")

if [ "$LOCAL_SIZE" != "$REMOTE_SIZE" ]; then
    echo "⚠️  ВНИМАНИЕ: Размеры файлов не совпадают!"
    echo "   Локальный: $LOCAL_SIZE bytes"
    echo "   Удаленный: ${REMOTE_SIZE:-не найден} bytes"
    exit 1
fi

echo "✅ JAR файл успешно загружен"

# Устанавливаем права доступа
ssh ${SERVER_USER}@${SERVER_HOST} "chmod 755 ${SERVER_PATH}/${BACKEND_JAR_NAME}"

echo ""
echo "✅ Деплой backend завершен успешно!"
echo "📝 Следующие шаги:"
echo "   1. Убедитесь, что docker-compose.yml настроен правильно"
echo "   2. Убедитесь, что используются переменные окружения для MySQL (не SQLite!)"
echo "   3. Перезапустите контейнер: docker-compose restart backend"
echo ""
echo "⚠️  ВАЖНО: SQLite база данных НЕ была скопирована на сервер"
echo "   На сервере должна использоваться MySQL из docker-compose.yml"

