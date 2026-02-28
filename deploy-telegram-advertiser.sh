#!/bin/bash

# Скрипт для деплоя Telegram Advertiser бота на сервер
#
# ИСПОЛЬЗОВАНИЕ:
#   1. Укажите IP сервера в SERVER_HOST ниже
#   2. Если нужен пароль для SSH:
#      - Установите sshpass: sudo apt install sshpass
#      - Установите переменную: export SSHPASS='ваш-пароль'
#      - Или просто вводите пароль при каждом запросе
#   3. Запустите: ./deploy-telegram-advertiser.sh

# ===== НАСТРОЙКИ =====
# Измените эти значения под ваш сервер
SERVER_USER="root"
SERVER_HOST="212.116.115.112"  # ЗАМЕНИТЕ на IP вашего сервера
SERVER_PATH="/root"
BOT_DIR="${SERVER_PATH}/telegram_advertiser"
VENV_NAME="telegram_advertiser_env"

# Использовать виртуальное окружение? (true/false)
# Если false - зависимости будут установлены глобально
USE_VENV=false  # Измените на true, если хотите использовать venv

# ===== ПРОВЕРКА ФАЙЛОВ =====
echo "🤖 Деплой Telegram Advertiser на сервер..."
echo ""

# Проверяем наличие необходимых файлов
if [ ! -f "telegram_advertiser.py" ]; then
    echo "❌ Файл telegram_advertiser.py не найден!"
    exit 1
fi

if [ ! -f "requirements.txt" ]; then
    echo "❌ Файл requirements.txt не найден!"
    exit 1
fi

if [ ! -f "fleamarkets_list.txt" ]; then
    echo "⚠️  Файл fleamarkets_list.txt не найден! Бот может не работать без списка чатов."
    read -p "Продолжить? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Проверяем настройки сервера
if [ "$SERVER_HOST" == "ваш-сервер-ip" ]; then
    echo "⚠️  ВНИМАНИЕ: Необходимо указать IP адрес сервера!"
    echo "Откройте файл deploy-telegram-advertiser.sh и измените SERVER_HOST"
    exit 1
fi

# ===== ПРОВЕРКА ДОСТУПНОСТИ СЕРВЕРА =====
echo "🔍 Проверяю доступность сервера ${SERVER_HOST}..."
if ! ping -c 1 -W 2 ${SERVER_HOST} &> /dev/null; then
    echo "⚠️  Сервер не отвечает на ping, но продолжаю попытку подключения..."
else
    echo "✅ Сервер доступен"
fi

# Проверяем наличие sshpass (для автоматической передачи пароля)
USE_SSHPASS=false
if command -v sshpass &> /dev/null; then
    USE_SSHPASS=true
    echo "💡 Обнаружен sshpass - можно использовать пароль автоматически"
    echo "   Для использования пароля установите переменную: export SSHPASS='ваш-пароль'"
fi

echo ""
echo "🔐 Подключение к серверу ${SERVER_USER}@${SERVER_HOST}"
echo "   Если потребуется пароль, введите его при запросе"
echo ""

# ===== ПОДГОТОВКА ФАЙЛОВ =====
echo ""
echo "📦 Подготавливаю файлы для деплоя..."

# Создаем временную директорию
TMP_DIR=$(mktemp -d)
cp telegram_advertiser.py "$TMP_DIR/"
cp requirements.txt "$TMP_DIR/"

# Копируем список чатов, если он есть
if [ -f "fleamarkets_list.txt" ]; then
    cp fleamarkets_list.txt "$TMP_DIR/"
fi

echo ""
echo "📤 Загружаю файлы на сервер ${SERVER_USER}@${SERVER_HOST}..."

# Функция для выполнения SSH команд
ssh_cmd() {
    if [ "$USE_SSHPASS" = true ] && [ -n "$SSHPASS" ]; then
        sshpass -e ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "$@"
    else
        ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "$@"
    fi
}

# Функция для выполнения SCP команд
scp_cmd() {
    if [ "$USE_SSHPASS" = true ] && [ -n "$SSHPASS" ]; then
        sshpass -e scp -o StrictHostKeyChecking=no "$@"
    else
        scp -o StrictHostKeyChecking=no "$@"
    fi
}

# Создаем директорию на сервере
echo "   Создаю директорию на сервере..."
if ! ssh_cmd "mkdir -p ${BOT_DIR}" 2>&1; then
    echo "❌ Не удалось создать директорию на сервере!"
    echo "   Проверьте подключение и права доступа"
    rm -rf "$TMP_DIR"
    exit 1
fi

# Копируем файлы
echo "   Копирую telegram_advertiser.py..."
if ! scp_cmd "$TMP_DIR/telegram_advertiser.py" ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/telegram_advertiser.py 2>&1; then
    echo "❌ Не удалось скопировать telegram_advertiser.py!"
    echo "   Возможно, требуется ввести пароль вручную"
    rm -rf "$TMP_DIR"
    exit 1
fi

echo "   Копирую requirements.txt..."
if ! scp_cmd "$TMP_DIR/requirements.txt" ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/ 2>&1; then
    echo "❌ Не удалось скопировать requirements.txt!"
    rm -rf "$TMP_DIR"
    exit 1
fi

if [ -f "$TMP_DIR/fleamarkets_list.txt" ]; then
    echo "   Копирую fleamarkets_list.txt..."
    if ! scp_cmd "$TMP_DIR/fleamarkets_list.txt" ${SERVER_USER}@${SERVER_HOST}:${BOT_DIR}/ 2>&1; then
        echo "⚠️  Не удалось скопировать fleamarkets_list.txt (продолжаю...)"
    fi
fi

# Удаляем временную директорию
rm -rf "$TMP_DIR"

echo "✅ Файлы загружены"

# ===== НАСТРОЙКА PYTHON И ЗАВИСИМОСТЕЙ =====
echo ""
if [ "$USE_VENV" = true ]; then
    echo "🐍 Настраиваю виртуальное окружение на сервере..."
else
    echo "🐍 Устанавливаю зависимости Python (без виртуального окружения)..."
fi

# Подготавливаем SSH команду для heredoc
SSH_CMD="ssh"
if [ "$USE_SSHPASS" = true ] && [ -n "$SSHPASS" ]; then
    SSH_CMD="sshpass -e ssh"
fi

if [ "$USE_VENV" = true ]; then
    # С виртуальным окружением
    if ! $SSH_CMD -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /root/telegram_advertiser

# Проверяем наличие Python3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не установлен! Устанавливаю..."
    if ! apt update && apt install -y python3 python3-pip python3-venv; then
        echo "❌ Не удалось установить Python3!"
        exit 1
    fi
fi

# Проверяем и устанавливаем python3-venv если нужно
if ! python3 -m venv --help &> /dev/null; then
    echo "   Устанавливаю python3-venv..."
    if ! apt update && apt install -y python3-venv; then
        echo "❌ Не удалось установить python3-venv!"
        exit 1
    fi
fi

# Создаем виртуальное окружение, если его нет
if [ ! -d "telegram_advertiser_env" ]; then
    echo "   Создаю виртуальное окружение..."
    if ! python3 -m venv telegram_advertiser_env; then
        echo "❌ Не удалось создать виртуальное окружение!"
        exit 1
    fi
fi

# Активируем и обновляем pip
echo "   Обновляю pip..."
source telegram_advertiser_env/bin/activate
if ! pip install --upgrade pip --quiet; then
    echo "⚠️  Предупреждение: не удалось обновить pip (продолжаю...)"
fi

# Устанавливаем зависимости
echo "   Устанавливаю зависимости..."
if ! pip install -r requirements.txt --quiet; then
    echo "❌ Не удалось установить зависимости!"
    exit 1
fi

echo "✅ Виртуальное окружение настроено"
ENDSSH
    then
        echo "❌ Ошибка настройки виртуального окружения!"
        echo "   Проверьте логи выше для деталей"
        exit 1
    fi
else
    # Без виртуального окружения - устанавливаем глобально
    if ! $SSH_CMD -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /root/telegram_advertiser

# Проверяем наличие Python3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не установлен! Устанавливаю..."
    if ! apt update && apt install -y python3 python3-pip; then
        echo "❌ Не удалось установить Python3!"
        exit 1
    fi
fi

# Обновляем pip
echo "   Обновляю pip..."
if ! python3 -m pip install --upgrade pip --quiet; then
    echo "⚠️  Предупреждение: не удалось обновить pip (продолжаю...)"
fi

# Устанавливаем зависимости глобально
echo "   Устанавливаю зависимости (глобально)..."
if ! python3 -m pip install -r requirements.txt --quiet; then
    echo "❌ Не удалось установить зависимости!"
    exit 1
fi

echo "✅ Зависимости установлены"
ENDSSH
    then
        echo "❌ Ошибка установки зависимостей!"
        echo "   Проверьте логи выше для деталей"
        exit 1
    fi
fi

# ===== УСТАНОВКА ПРАВ ДОСТУПА =====
echo ""
echo "🔐 Устанавливаю права доступа..."
if ! ssh_cmd "chmod +x ${BOT_DIR}/telegram_advertiser.py && chown -R root:root ${BOT_DIR}" 2>&1; then
    echo "⚠️  Не удалось установить права доступа (продолжаю...)"
fi

# ===== ИТОГОВАЯ ИНФОРМАЦИЯ =====
echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📝 Следующие шаги:"
echo ""
echo "   1. Подключитесь к серверу:"
echo "      ssh ${SERVER_USER}@${SERVER_HOST}"
echo ""
echo "   2. Перейдите в директорию бота:"
echo "      cd ${BOT_DIR}"
echo ""
    echo "   3. Запустите бота вручную для первой авторизации:"
    if [ "$USE_VENV" = true ]; then
        echo "      source telegram_advertiser_env/bin/activate"
        echo "      python telegram_advertiser.py"
    else
        echo "      python3 telegram_advertiser.py"
    fi
echo ""
echo "      При первом запуске:"
echo "      - Введите номер телефона (с кодом страны, например: +375291234567)"
echo "      - Введите код подтверждения из Telegram"
echo "      - Если включена 2FA, введите пароль"
echo ""
echo "   4. После успешной авторизации остановите бота (Ctrl+C)"
echo ""
echo "   5. Создайте systemd сервис для автозапуска:"
echo "      ./deploy-telegram-advertiser-service.sh"
echo ""
echo "💡 Файлы находятся в: ${BOT_DIR}"
echo ""
echo "📖 Подробная инструкция: DEPLOY_TELEGRAM_ADVERTISER.md"

