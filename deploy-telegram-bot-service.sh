#!/bin/bash

# Скрипт для создания systemd сервиса для Telegram бота

SERVER_USER="root"
SERVER_HOST="93.125.114.252"
BOT_DIR="/root/telegram_bot"
VENV_PATH="${BOT_DIR}/telegram_bot_env"
SERVICE_NAME="telegram-bot"

echo "🔧 Создание systemd сервиса для Telegram бота..."
echo ""

# Создаем unit файл
UNIT_FILE=$(mktemp)
cat > "$UNIT_FILE" << EOF
[Unit]
Description=Fluvion Telegram Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=${BOT_DIR}
# КРИТИЧНО: Используем полный путь к Python из виртуального окружения
ExecStart=${VENV_PATH}/bin/python3 ${BOT_DIR}/main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
# Устанавливаем PATH для виртуального окружения
Environment="PATH=${VENV_PATH}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF

echo "📤 Загружаю unit файл на сервер..."
scp "$UNIT_FILE" ${SERVER_USER}@${SERVER_HOST}:/tmp/${SERVICE_NAME}.service

# Устанавливаем и запускаем сервис
echo ""
echo "⚙️  Настраиваю systemd сервис..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
# Копируем unit файл
sudo cp /tmp/${SERVICE_NAME}.service /etc/systemd/system/

# Перезагружаем systemd
sudo systemctl daemon-reload

# Включаем автозапуск
sudo systemctl enable ${SERVICE_NAME}

# Запускаем сервис
sudo systemctl start ${SERVICE_NAME}

# Проверяем статус
echo ""
echo "📊 Статус сервиса:"
sudo systemctl status ${SERVICE_NAME} --no-pager -l

echo ""
echo "📝 Полезные команды:"
echo "   Просмотр логов: sudo journalctl -u ${SERVICE_NAME} -f"
echo "   Перезапуск: sudo systemctl restart ${SERVICE_NAME}"
echo "   Остановка: sudo systemctl stop ${SERVICE_NAME}"
echo "   Статус: sudo systemctl status ${SERVICE_NAME}"
ENDSSH

# Удаляем временный файл
rm -f "$UNIT_FILE"

echo ""
echo "✅ Systemd сервис создан и запущен!"
echo ""
echo "💡 Для просмотра логов:"
echo "   ssh ${SERVER_USER}@${SERVER_HOST} 'journalctl -u ${SERVICE_NAME} -f'"

