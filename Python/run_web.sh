#!/bin/bash

# Скрипт для запуска веб-приложения управления списком рассылки

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_PATH="$PROJECT_ROOT/telegram_bot_env"

cd "$SCRIPT_DIR" || exit 1

echo "🚀 Запуск веб-приложения для управления списком рассылки..."
echo ""

# Проверяем наличие виртуального окружения
if [ -d "$VENV_PATH" ]; then
    echo "📦 Активация виртуального окружения..."
    # Используем source с правильным экранированием
    . "$VENV_PATH/bin/activate"
    PYTHON_CMD="$VENV_PATH/bin/python"
    PIP_CMD="$VENV_PATH/bin/pip"
else
    echo "⚠️  Виртуальное окружение не найдено. Использую системный Python."
    PYTHON_CMD="python3"
    PIP_CMD="pip3"
fi

# Проверяем установлены ли зависимости
if ! "$PYTHON_CMD" -c "import flask" 2>/dev/null; then
    echo "⚠️  Flask не установлен. Устанавливаю зависимости..."
    "$PIP_CMD" install -r requirements_web.txt
fi

echo "✅ Запуск веб-приложения на http://localhost:5000"
echo ""

"$PYTHON_CMD" web_app.py

