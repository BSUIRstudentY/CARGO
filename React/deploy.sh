#!/bin/bash

# Скрипт для деплоя React приложения на сервер

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

# Проверяем размер главного JS файла
MAIN_JS=$(ls -t dist/assets/index-*.js 2>/dev/null | head -1)
if [ -n "$MAIN_JS" ]; then
    LOCAL_SIZE=$(stat -f%z "$MAIN_JS" 2>/dev/null || stat -c%s "$MAIN_JS" 2>/dev/null)
    echo "📊 Размер главного JS файла: $(numfmt --to=iec-i --suffix=B $LOCAL_SIZE 2>/dev/null || echo "${LOCAL_SIZE} bytes")"
fi

echo "📤 Загружаю файлы на сервер..."

# Создаем временную директорию на сервере для безопасной загрузки
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}.new && rm -rf ${SERVER_PATH}.new/*"

# Более надежный метод: используем tar для архивирования и передачи
echo "📦 Архивирую файлы..."
cd dist
tar czf /tmp/fluvion-build.tar.gz .
cd ..

echo "🚀 Загружаю архив на сервер..."
scp /tmp/fluvion-build.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при загрузке архива!"
    rm -f /tmp/fluvion-build.tar.gz
    exit 1
fi

echo "📂 Распаковываю файлы на сервере..."
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH}.new && tar xzf /tmp/fluvion-build.tar.gz && rm -f /tmp/fluvion-build.tar.gz"

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при распаковке архива!"
    ssh ${SERVER_USER}@${SERVER_HOST} "rm -f /tmp/fluvion-build.tar.gz"
    rm -f /tmp/fluvion-build.tar.gz
    exit 1
fi

rm -f /tmp/fluvion-build.tar.gz

echo "✅ Файлы загружены, проверяю целостность..."

# Проверяем размер файла на сервере
if [ -n "$MAIN_JS" ]; then
    JS_FILENAME=$(basename "$MAIN_JS")
    REMOTE_SIZE=$(ssh ${SERVER_USER}@${SERVER_HOST} "stat -f%z ${SERVER_PATH}.new/assets/${JS_FILENAME} 2>/dev/null || stat -c%s ${SERVER_PATH}.new/assets/${JS_FILENAME} 2>/dev/null")
    
    if [ -z "$REMOTE_SIZE" ] || [ "$LOCAL_SIZE" != "$REMOTE_SIZE" ]; then
        echo "⚠️  ВНИМАНИЕ: Размеры файлов не совпадают!"
        echo "   Локальный: $LOCAL_SIZE bytes"
        echo "   Удаленный: ${REMOTE_SIZE:-не найден} bytes"
        echo "   Повторяю загрузку проблемного файла..."
        
        # Загружаем проблемный файл отдельно
        ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}.new/assets"
        scp "$MAIN_JS" ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}.new/assets/${JS_FILENAME}
        
        # Проверяем снова
        REMOTE_SIZE=$(ssh ${SERVER_USER}@${SERVER_HOST} "stat -f%z ${SERVER_PATH}.new/assets/${JS_FILENAME} 2>/dev/null || stat -c%s ${SERVER_PATH}.new/assets/${JS_FILENAME} 2>/dev/null")
        if [ "$LOCAL_SIZE" != "$REMOTE_SIZE" ]; then
            echo "❌ КРИТИЧНО: Файл все еще не совпадает!"
            exit 1
        else
            echo "✅ Файл исправлен"
        fi
    else
        echo "✅ Размеры файлов совпадают ($LOCAL_SIZE bytes)"
    fi
fi

# Устанавливаем правильные права доступа
echo "🔐 Устанавливаю права доступа..."
ssh ${SERVER_USER}@${SERVER_HOST} "chown -R www-data:www-data ${SERVER_PATH}.new && chmod -R 755 ${SERVER_PATH}.new"

# Атомарная замена старой директории на новую
echo "🔄 Заменяю старую версию на новую..."
ssh ${SERVER_USER}@${SERVER_HOST} "
    if [ -d ${SERVER_PATH} ]; then
        mv ${SERVER_PATH} ${SERVER_PATH}.old
    fi
    mv ${SERVER_PATH}.new ${SERVER_PATH}
    rm -rf ${SERVER_PATH}.old
"

if [ $? -eq 0 ]; then
    echo "✅ Деплой завершен успешно!"
    echo "🌐 Приложение доступно по адресу: https://fluvion.by"
    echo "💡 Если видите ошибки, очистите кеш браузера (Ctrl+Shift+R)"
else
    echo "❌ Ошибка при замене директории!"
    exit 1
fi
