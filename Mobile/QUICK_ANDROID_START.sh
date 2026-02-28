#!/bin/bash

# Скрипт для быстрого запуска Android эмулятора и приложения

echo "🔍 Проверка Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME не установлен!"
    echo "Выполните: source ~/.bashrc"
    exit 1
fi

echo "✅ ANDROID_HOME: $ANDROID_HOME"

echo ""
echo "📱 Список доступных эмуляторов:"
emulator -list-avds

echo ""
echo "📱 Проверка подключенных устройств:"
adb devices

echo ""
echo "🚀 Для запуска приложения:"
echo "   1. Запустите эмулятор из Android Studio (Device Manager → Play)"
echo "   2. Или запустите: emulator -avd <имя_эмулятора> &"
echo "   3. Затем выполните: npm run android"
echo ""
echo "💡 Или просто нажмите 'a' в терминале где запущен 'npm start'"




