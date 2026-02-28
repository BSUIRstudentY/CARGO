#!/usr/bin/env bash
set -e

# Деплой фронта (React) и бэка (Spring Boot) на сервер
# Использование: ./deploy.sh [сервер]
# Пример: ./deploy.sh root@93.125.114.252

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVER="${1:-root@93.125.114.252}"
FRONTEND_DEST="/var/www/fluvion.by/html/"
BACKEND_DEST="/root/"

echo "=== 1. Сборка фронта (React) ==="
cd React
npm run build
cd ..

echo "=== 2. Сборка бэка (Spring Boot) ==="
cd "Spring Boot"
mvn -q package -DskipTests
# Имя JAR из pom.xml: demo-0.0.1-SNAPSHOT.jar
JAR_NAME="target/demo-0.0.1-SNAPSHOT.jar"
if [ ! -f "$JAR_NAME" ]; then
  echo "Ошибка: JAR не найден: $JAR_NAME"
  exit 1
fi
cp "$JAR_NAME" "$SCRIPT_DIR/backend.jar"
cd ..

echo "=== 3. Отправка фронта на сервер ==="
scp -r React/dist/* "$SERVER:$FRONTEND_DEST"

echo "=== 4. Отправка бэка на сервер ==="
scp backend.jar "$SERVER:$BACKEND_DEST"

echo "=== Готово ==="
echo "Фронт: $FRONTEND_DEST"
echo "Бэк:   $BACKEND_DEST/backend.jar"
echo "Перезапуск приложения на сервере (если нужно): ssh $SERVER 'systemctl restart your-service'"
