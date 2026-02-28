#!/bin/bash

# Скрипт для деплоя Telegram бота на сервер

SERVER_USER="root"
SERVER_HOST="93.125.114.252"
SERVER_PATH="/root"
BOT_DIR="${SERVER_PATH}/telegram_bot"
VENV_NAME="telegram_bot_env"

echo "🤖 Деплой Telegram бота на сервер..."
echo ""

# Проверяем наличие файлов
if [ ! -f "main.py" ]; then
    echo "❌ Файл main.py не найден!"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ Файл requirements.txt не найден!"
    exit 1
fi

echo "📦 Подготавливаю файлы для деплоя..."

# Создаем временную директорию
TMP_DIR=$(mktemp -d)
cp main.py "$TMP_DIR/"
cp requirements.txt "$TMP_DIR/"

# Обновляем BACKEND_URL для продакшена (если нужно)
# Можно раскомментировать и изменить при необходимости:
# sed -i 's|BACKEND_URL = "http://localhost:8080/api/telegram"|BACKEND_URL = "http://localhost:8080/api/telegram"|g' "$TMP_DIR/main.py"

echo "📤 Загружаю файлы на сервер..."

# Создаем директорию на сервере
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${BOT_DIR}"

# Копируем файлы
scp "$TMP_DIR/main.py" ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/
scp "$TMP_DIR/requirements.txt" ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/

# Удаляем временную директорию
rm -rf "$TMP_DIR"

echo "✅ Файлы загружены"

# Настраиваем виртуальное окружение на сервере
echo ""
echo "🐍 Настраиваю виртуальное окружение на сервере..."

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /root/telegram_bot

# Проверяем наличие Python3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не установлен!"
    exit 1
fi

# Создаем виртуальное окружение, если его нет
if [ ! -d "telegram_bot_env" ]; then
    echo "   Создаю виртуальное окружение..."
    python3 -m venv telegram_bot_env
fi

# Активируем и обновляем pip
echo "   Обновляю pip..."
source telegram_bot_env/bin/activate
pip install --upgrade pip --quiet

# Устанавливаем зависимости
echo "   Устанавливаю зависимости..."
pip install -r requirements.txt --quiet

echo "✅ Виртуальное окружение настроено"
ENDSSH

if [ $? -ne 0 ]; then
    echo "❌ Ошибка настройки виртуального окружения!"
    exit 1
fi

# Устанавливаем права доступа
echo ""
echo "🔐 Устанавливаю права доступа..."
ssh ${SERVER_USER}@${SERVER_HOST} "chmod +x ${BOT_DIR}/main.py && chown -R root:root ${BOT_DIR}"

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📝 Следующие шаги:"
echo "   1. Проверьте BACKEND_URL в main.py на сервере (должен быть http://localhost:8080/api/telegram)"
echo "   2. Запустите бота вручную для проверки:"
echo "      ssh ${SERVER_USER}@${SERVER_HOST}"
echo "      cd ${BOT_DIR}"
echo "      source telegram_bot_env/bin/activate"
echo "      python main.py"
echo ""
echo "   3. Для автозапуска создайте systemd сервис (см. deploy-telegram-bot-service.sh)"
echo ""
echo "💡 Файлы находятся в: ${BOT_DIR}"






























