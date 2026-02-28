#!/bin/bash

# Скрипт для копирования файлов на сервер

SERVER_USER="root"
SERVER_HOST="212.116.115.112"
BOT_DIR="/root/telegram_advertiser"

echo "📤 Копирую файлы на сервер..."

# Проверяем наличие файлов
if [ ! -f "fleamarkets_list.txt" ]; then
    echo "⚠️  Файл fleamarkets_list.txt не найден!"
    exit 1
fi

if [ ! -f "my_session.session" ]; then
    echo "⚠️  Файл my_session.session не найден!"
    echo "   Этот файл создается при первой авторизации в Telegram"
    read -p "Продолжить без сессии? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Копируем файл с чатами
echo "   Копирую fleamarkets_list.txt..."
scp fleamarkets_list.txt ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/

# Копируем сессию, если она есть
if [ -f "my_session.session" ]; then
    echo "   Копирую my_session.session..."
    scp my_session.session ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/
    echo "   ⚠️  ВАЖНО: Файл сессии содержит ваши учетные данные!"
    echo "   Убедитесь, что права доступа установлены правильно на сервере"
fi

echo ""
echo "✅ Файлы скопированы!"
echo ""
echo "📝 На сервере выполните:"
echo "   chmod 600 ${BOT_DIR}/my_session.session"
echo "   chmod 644 ${BOT_DIR}/fleamarkets_list.txt"
























