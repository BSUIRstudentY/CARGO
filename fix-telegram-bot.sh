#!/bin/bash

# Скрипт для исправления проблем с Telegram ботом на сервере

SERVER_USER="root"
SERVER_HOST="93.125.114.252"
BOT_DIR="/root/telegram_bot"
VENV_PATH="${BOT_DIR}/telegram_bot_env"

echo "🔧 Исправление проблем с Telegram ботом..."
echo ""

# Подключаемся к серверу и исправляем проблемы
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /root/telegram_bot

echo "1. Проверяю виртуальное окружение..."
if [ ! -d "telegram_bot_env" ]; then
    echo "   ❌ Виртуальное окружение не найдено, создаю..."
    python3 -m venv telegram_bot_env
else
    echo "   ✅ Виртуальное окружение существует"
fi

echo ""
echo "2. Активирую виртуальное окружение и проверяю Python..."
source telegram_bot_env/bin/activate
which python3
python3 --version

echo ""
echo "3. Обновляю pip..."
pip install --upgrade pip --quiet

echo ""
echo "4. Устанавливаю зависимости..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
else
    echo "   ⚠️  requirements.txt не найден, устанавливаю базовые зависимости..."
    pip install python-telegram-bot==20.7 requests==2.31.0 aiohttp==3.9.1
fi

echo ""
echo "5. Проверяю установку модуля telegram..."
python3 -c "import telegram; print('✅ Модуль telegram установлен:', telegram.__version__)" || echo "❌ Модуль telegram не установлен!"

echo ""
echo "6. Проверяю путь к Python в виртуальном окружении..."
ls -la telegram_bot_env/bin/python*

echo ""
echo "✅ Исправление завершено!"
ENDSSH

echo ""
echo "📝 Теперь обновите systemd сервис:"
echo "   ./deploy-telegram-bot-service.sh"
echo ""
echo "Или вручную на сервере:"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl restart telegram-bot"






























