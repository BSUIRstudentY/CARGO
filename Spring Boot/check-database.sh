#!/bin/bash

# Скрипт для проверки, какая база данных используется на сервере

echo "🔍 Проверка конфигурации базы данных..."
echo ""

# Проверяем переменные окружения в docker-compose
if [ -f "../docker-compose.yml" ]; then
    echo "1. Проверка docker-compose.yml:"
    
    # Проверяем наличие MySQL переменных
    if grep -q "SPRING_DATASOURCE_URL.*mysql" ../docker-compose.yml; then
        echo "   ✅ MySQL URL настроен в docker-compose.yml"
        MYSQL_URL=$(grep "SPRING_DATASOURCE_URL.*mysql" ../docker-compose.yml | head -1 | sed 's/.*SPRING_DATASOURCE_URL=//' | sed 's/ *$//')
        echo "      URL: $MYSQL_URL"
    else
        echo "   ⚠️  MySQL URL НЕ найден в docker-compose.yml"
    fi
    
    if grep -q "SPRING_DATASOURCE_DRIVER_CLASS_NAME.*mysql" ../docker-compose.yml; then
        echo "   ✅ MySQL драйвер настроен"
    else
        echo "   ⚠️  MySQL драйвер НЕ настроен"
    fi
    
    if grep -q "HIBERNATE_DIALECT.*MySQL" ../docker-compose.yml; then
        echo "   ✅ MySQL диалект Hibernate настроен"
    else
        echo "   ⚠️  MySQL диалект Hibernate НЕ настроен"
    fi
else
    echo "   ⚠️  docker-compose.yml не найден"
fi

echo ""
echo "2. Проверка application.yml:"
if grep -q "SPRING_DATASOURCE_URL" src/main/resources/application.yml; then
    echo "   ✅ Используются переменные окружения для базы данных"
    echo "   📝 Если переменные не установлены, будет использован SQLite"
else
    echo "   ⚠️  Переменные окружения не настроены в application.yml"
fi

echo ""
echo "3. Рекомендации:"
echo "   ✅ Убедитесь, что в docker-compose.yml установлены:"
echo "      - SPRING_DATASOURCE_URL=jdbc:mysql://..."
echo "      - SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver"
echo "      - HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect"
echo ""
echo "   ⚠️  Если эти переменные НЕ установлены, SQLite файл создастся автоматически"
echo "      в директории ./data/cargodb.sqlite относительно рабочей директории приложения"






























