# Исправленный docker-compose.yml для сервера

## Проблемы в текущем файле:

1. ❌ Отсутствуют переменные для bePaid → ошибка 401
2. ❌ Отсутствуют переменные для EuropePost → пустой ServiceNumber
3. ❌ Неправильные имена переменных для Redis → ошибка подключения
4. ❌ Нет restart policy для backend

## Исправленный docker-compose.yml:

```yaml
version: '3.8'

services:
  backend:
    image: openjdk:21-jdk-slim
    container_name: backend
    volumes:
      - ./backend.jar:/root/backend.jar
    command: ["java", "-jar", "/root/backend.jar"]
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      kafka:
        condition: service_healthy
    environment:
      # Database
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=CargoDB
      - DB_USERNAME=fluvion_user
      - DB_PASSWORD=1206_1105timaZ
      
      # Redis (ВАЖНО: используйте REDIS_HOST, не SPRING_REDIS_HOST)
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=
      
      # Kafka
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
      
      # Mail
      - MAIL_HOST=smtp.gmail.com
      - MAIL_PORT=587
      - MAIL_USERNAME=fluvionbiz@gmail.com
      - MAIL_PASSWORD=1206_1105timaZ
      
      # JWT
      - JWT_SECRET=your-very-secure-secret-key-32-chars-long-minimum
      - JWT_EXPIRATION=86400000
      
      # ⚠️ КРИТИЧНО: bePaid (замените на реальные значения!)
      - BEPAID_SHOP_ID=your_shop_id
      - BEPAID_SECRET_KEY=your_secret_key
      - BEPAID_CHECKOUT_URL=https://checkout.bepaid.by/ctp/api/checkouts
      - BEPAID_RETURN_URL=https://fluvion.by/thanks
      - BEPAID_FAIL_URL=https://fluvion.by/badResponse
      - BEPAID_CALLBACK_URL=https://fluvion.by/api/payment/webhook
      - BEPAID_TEST_MODE=true
      
      # ⚠️ КРИТИЧНО: EuropePost API (замените на реальные значения!)
      - EUPOST_API_URL=https://api.eurotorg.by:10352/Json
      - EUPOST_SERVICE_NUMBER=your_service_number
      - EUPOST_LOGIN=your_login
      - EUPOST_PASSWORD=your_password
      
      # Server
      - SERVER_PORT=8080
      
      # Hibernate
      - HIBERNATE_DDL_AUTO=update
      - SHOW_SQL=false
    networks:
      - app-network
    restart: unless-stopped  # ← Добавьте это!

  mysql:
    image: mysql:8.0
    container_name: mysql
    environment:
      MYSQL_DATABASE: CargoDB
      MYSQL_USER: fluvion_user
      MYSQL_PASSWORD: 1206_1105timaZ
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7.0
    container_name: redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - app-network
    restart: unless-stopped

  zookeeper:
    image: confluentinc/cp-zookeeper:7.3.0
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
      ZOOKEEPER_INIT_LIMIT: 10
      ZOOKEEPER_SYNC_LIMIT: 5
      ZOOKEEPER_MAX_CLIENT_CNXNS: 60
      JVMFLAGS: "-Xms512M -Xmx1G"
    ports:
      - "2181:2181"
    healthcheck:
      test: ["CMD", "bash", "-c", "echo ruok | nc localhost 2181"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 60s
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-log:/var/lib/zookeeper/log
    networks:
      - app-network
    restart: unless-stopped

  kafka:
    image: confluentinc/cp-kafka:7.3.0
    container_name: kafka
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_NUM_PARTITIONS: 1
      KAFKA_DEFAULT_REPLICATION_FACTOR: 1
      KAFKA_ZOOKEEPER_CONNECTION_TIMEOUT_MS: 60000
      KAFKA_ZOOKEEPER_SESSION_TIMEOUT_MS: 18000
      KAFKA_HEAP_OPTS: "-Xms1G -Xmx2G"
    healthcheck:
      test: ["CMD", "kafka-topics", "--list", "--bootstrap-server", "localhost:9092"]
      interval: 10s
      timeout: 10s
      retries: 20
      start_period: 120s
    volumes:
      - kafka-data:/var/lib/kafka/data
    networks:
      - app-network
    restart: unless-stopped

volumes:
  mysql-data:
  zookeeper-data:
  zookeeper-log:
  kafka-data:

networks:
  app-network:
    driver: bridge
```

## Что изменить:

### 1. Замените имена переменных Redis:
```yaml
# БЫЛО:
- SPRING_REDIS_HOST=redis

# ДОЛЖНО БЫТЬ:
- REDIS_HOST=redis
- REDIS_PORT=6379
```

### 2. Добавьте переменные bePaid:
```yaml
- BEPAID_SHOP_ID=your_shop_id        # ← Замените на реальное значение!
- BEPAID_SECRET_KEY=your_secret_key  # ← Замените на реальное значение!
```

### 3. Добавьте переменные EuropePost:
```yaml
- EUPOST_SERVICE_NUMBER=your_service_number  # ← Замените на реальное значение!
- EUPOST_LOGIN=your_login                    # ← Замените на реальное значение!
- EUPOST_PASSWORD=your_password              # ← Замените на реальное значение!
```

### 4. Добавьте restart policy:
```yaml
restart: unless-stopped
```

## После исправления:

```bash
# На сервере:
docker-compose down
docker-compose up -d

# Проверьте логи:
docker-compose logs -f backend
```

## Проверка:

После запуска проверьте логи - не должно быть:
- ❌ "Unable to connect to Redis"
- ❌ "ServiceNumber: " (пустое)
- ❌ "401 UNAUTHORIZED" от bePaid

Должно быть:
- ✅ "Redis connection established"
- ✅ "Fetching JWT token for ServiceNumber: your_service_number"
- ✅ bePaid запросы проходят успешно






