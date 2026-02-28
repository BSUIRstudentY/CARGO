# Использование docker-compose.yml с .env файлом

## Как это работает

Docker Compose автоматически загружает переменные из `.env` файла в той же директории, где находится `docker-compose.yml`.

Синтаксис `${VARIABLE_NAME:-default_value}` означает:
- Использовать значение из `.env` файла, если оно есть
- Если переменной нет, использовать значение по умолчанию после `:-`

## Настройка

### 1. Создайте .env файл на сервере

```bash
# На сервере в директории с docker-compose.yml
nano .env
```

### 2. Добавьте все необходимые переменные:

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CargoDB
DB_USERNAME=fluvion_user
DB_PASSWORD=your_database_password_here
MYSQL_ROOT_PASSWORD=rootpassword

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# Mail
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_password_here

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Server
SERVER_PORT=8080

# Hibernate
HIBERNATE_DDL_AUTO=update
SHOW_SQL=false

# bePaid Payment Gateway
BEPAID_SHOP_ID=your_shop_id
BEPAID_SECRET_KEY=your_secret_key_here
BEPAID_CHECKOUT_URL=https://checkout.bepaid.by/ctp/api/checkouts
BEPAID_RETURN_URL=https://fluvion.by/thanks
BEPAID_FAIL_URL=https://fluvion.by/badResponse
BEPAID_CALLBACK_URL=https://fluvion.by/api/payment/webhook
BEPAID_TEST_MODE=true

# EuropePost API
EUPOST_API_URL=https://api.eurotorg.by:10352/Json
EUPOST_SERVICE_NUMBER=your_service_number
EUPOST_LOGIN=your_login
EUPOST_PASSWORD=your_password
```

### 3. Запустите docker-compose

```bash
docker-compose up -d
```

Docker Compose автоматически загрузит переменные из `.env` файла.

## Преимущества

✅ Секреты не хранятся в docker-compose.yml  
✅ Можно использовать один docker-compose.yml для разных окружений  
✅ Легко менять значения без редактирования docker-compose.yml  
✅ `.env` файл можно добавить в `.gitignore`  

## Безопасность

⚠️ **ВАЖНО:**
- НИКОГДА не коммитьте `.env` файл в git
- Добавьте `.env` в `.gitignore`
- Используйте `.env.example` для документации (без реальных значений)

## Проверка переменных

Проверить, что переменные загружены:

```bash
# Проверить конкретную переменную
docker-compose config | grep BEPAID_SHOP_ID

# Показать все переменные окружения для backend
docker-compose config | grep -A 50 "backend:" | grep "environment:"
```






