#!/bin/bash

# Простой и надежный скрипт деплоя React приложения
# Использует rsync для более надежной синхронизации

SERVER_USER="root"
SERVER_HOST="93.125.114.252"
SERVER_PATH="/var/www/fluvion.by/html"

echo "🔨 Собираю production build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке!"
    exit 1
fi

echo "📦 Сборка завершена успешно"

# Проверяем наличие rsync, если нет - используем scp
if command -v rsync &> /dev/null; then
    echo "📤 Загружаю файлы на сервер (rsync)..."
    
    # Создаем backup старой версии
    ssh ${SERVER_USER}@${SERVER_HOST} "
        if [ -d ${SERVER_PATH} ] && [ \"\$(ls -A ${SERVER_PATH})\" ]; then
            mv ${SERVER_PATH} ${SERVER_PATH}.backup.\$(date +%Y%m%d_%H%M%S)
        fi
        mkdir -p ${SERVER_PATH}
    "
    
    # Используем rsync для синхронизации
    rsync -avz --delete --progress \
        dist/ \
        ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
    
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка при загрузке файлов!"
        exit 1
    fi
else
    echo "📤 Загружаю файлы на сервер (scp)..."
    
    # Создаем временную директорию
    ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}.new && rm -rf ${SERVER_PATH}.new/*"
    
    # Загружаем всю директорию целиком (без звездочки!)
    scp -r dist/. ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}.new/
    
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка при загрузке файлов!"
        exit 1
    fi
    
    # Заменяем старую директорию
    ssh ${SERVER_USER}@${SERVER_HOST} "
        if [ -d ${SERVER_PATH} ]; then
            mv ${SERVER_PATH} ${SERVER_PATH}.backup.\$(date +%Y%m%d_%H%M%S)
        fi
        mv ${SERVER_PATH}.new ${SERVER_PATH}
    "
fi

# Устанавливаем правильные права доступа
echo "🔐 Устанавливаю права доступа..."
ssh ${SERVER_USER}@${SERVER_HOST} "chown -R www-data:www-data ${SERVER_PATH} && chmod -R 755 ${SERVER_PATH}"

# Проверяем главный JS файл
MAIN_JS=$(ls -t dist/assets/index-*.js 2>/dev/null | head -1)
if [ -n "$MAIN_JS" ]; then
    LOCAL_SIZE=$(stat -f%z "$MAIN_JS" 2>/dev/null || stat -c%s "$MAIN_JS" 2>/dev/null)
    JS_FILENAME=$(basename "$MAIN_JS")
    REMOTE_SIZE=$(ssh ${SERVER_USER}@${SERVER_HOST} "stat -f%z ${SERVER_PATH}/assets/${JS_FILENAME} 2>/dev/null || stat -c%s ${SERVER_PATH}/assets/${JS_FILENAME} 2>/dev/null")
    
    if [ "$LOCAL_SIZE" = "$REMOTE_SIZE" ]; then
        echo "✅ Главный JS файл загружен корректно ($LOCAL_SIZE bytes)"
    else
        echo "⚠️  ВНИМАНИЕ: Размеры не совпадают! Локальный: $LOCAL_SIZE, Удаленный: ${REMOTE_SIZE:-не найден}"
        echo "   Попробуйте перезапустить деплой"
    fi
fi

echo "✅ Деплой завершен успешно!"
echo "🌐 Приложение доступно по адресу: https://fluvion.by"
echo "💡 Если видите ошибки, очистите кеш браузера (Ctrl+Shift+R)"






