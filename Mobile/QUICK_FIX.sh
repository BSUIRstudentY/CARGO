#!/bin/bash

# Скрипт для быстрого исправления проблем с установкой

echo "🧹 Очистка старых зависимостей..."
rm -rf node_modules package-lock.json

echo "📦 Установка зависимостей..."
npm install

echo "✅ Готово! Теперь запустите:"
echo "   npm start"
echo ""
echo "Или используйте:"
echo "   npx expo start"




