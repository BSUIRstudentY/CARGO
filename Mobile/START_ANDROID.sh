#!/bin/bash

# Скрипт для запуска Android эмулятора и приложения

# Загружаем переменные окружения
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "🔍 Проверка Android SDK..."
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK не найден в $ANDROID_HOME"
    exit 1
fi

echo "✅ Android SDK найден: $ANDROID_HOME"
echo ""

echo "📱 Доступные эмуляторы:"
AVDS=$($ANDROID_HOME/emulator/emulator -list-avds 2>&1)
if [ -z "$AVDS" ] || echo "$AVDS" | grep -q "error"; then
    echo "⚠️  Эмуляторы не найдены!"
    echo ""
    echo "Создайте эмулятор в Android Studio:"
    echo "  1. Откройте Android Studio"
    echo "  2. Tools → Device Manager"
    echo "  3. Create Device"
    echo "  4. Выберите устройство и системный образ"
    exit 1
else
    echo "$AVDS"
fi

echo ""
echo "📱 Подключенные устройства:"
$ANDROID_HOME/platform-tools/adb devices

echo ""
echo "🚀 Инструкции:"
echo ""
echo "1. Запустите эмулятор одним из способов:"
echo "   - Из Android Studio: Device Manager → Play (▶️)"
echo "   - Или из командной строки:"
echo "     $ANDROID_HOME/emulator/emulator -avd <имя_эмулятора> &"
echo ""
echo "2. Дождитесь полной загрузки эмулятора"
echo ""
echo "3. Запустите приложение:"
echo "   cd Mobile"
echo "   npm run android"
echo ""
echo "   Или если сервер уже запущен, нажмите 'a' в терминале"




