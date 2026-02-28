#!/bin/bash

# Скрипт для создания systemd сервиса для Telegram Advertiser бота

# ===== НАСТРОЙКИ =====
SERVER_USER="root"
SERVER_HOST="212.116.115.112"  # ЗАМЕНИТЕ на IP вашего сервера
BOT_DIR="/root/telegram_advertiser"
VENV_PATH="${BOT_DIR}/telegram_advertiser_env"
SERVICE_NAME="telegram-advertiser"

# Использовать виртуальное окружение? (должно совпадать с deploy-telegram-advertiser.sh)
USE_VENV=false  # Измените на true, если используете venv

# Проверка настроек
if [ "$SERVER_HOST" == "ваш-сервер-ip" ]; then
    echo "⚠️  ВНИМАНИЕ: Необходимо указать IP адрес сервера!"
    echo "Откройте файл deploy-telegram-advertiser-service.sh и измените SERVER_HOST"
    exit 1
fi

echo "🔧 Создание systemd сервиса для Telegram Advertiser..."
echo ""

# Создаем unit файл
UNIT_FILE=$(mktemp)

if [ "$USE_VENV" = true ]; then
    # С виртуальным окружением
    cat > "$UNIT_FILE" << EOF
[Unit]
Description=Telegram Advertiser Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=${BOT_DIR}
# Используем Python из виртуального окружения
ExecStart=${VENV_PATH}/bin/python3 ${BOT_DIR}/telegram_advertiser.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PATH=${VENV_PATH}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF
else
    # Без виртуального окружения
    cat > "$UNIT_FILE" << EOF
[Unit]
Description=Telegram Advertiser Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=${BOT_DIR}
# Используем системный Python3
ExecStart=/usr/bin/python3 ${BOT_DIR}/telegram_advertiser.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
EOF
fi

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
echo ""
echo "⚠️  ВАЖНО: Если это первый запуск, убедитесь, что:"
echo "   1. Бот был запущен вручную хотя бы раз для авторизации"
echo "   2. Файл my_session.session создан в ${BOT_DIR}"
echo "   3. Файл fleamarkets_list.txt существует и содержит список чатов"
echo ""
if [ "$USE_VENV" = false ]; then
    echo "💡 Используется режим БЕЗ виртуального окружения"
    echo "   Зависимости установлены глобально"
else
    echo "💡 Используется виртуальное окружение: ${VENV_PATH}"
fi

