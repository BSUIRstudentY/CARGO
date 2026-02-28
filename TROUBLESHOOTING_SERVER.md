# Решение проблем на сервере

## 🔴 Ошибка 1: "Unable to connect to Redis"

### Проблема:
```
Cannot set user authentication: Unable to connect to Redis
```

### Решение:

#### Вариант A: Redis запущен в Docker
Если используете docker-compose, проверьте что Redis контейнер запущен:
```bash
docker ps | grep redis
# Если нет, запустите:
docker-compose up -d redis
```

#### Вариант B: Redis на хосте
Если Redis установлен на сервере:
```bash
# Проверьте статус
sudo systemctl status redis
# Если не запущен:
sudo systemctl start redis
sudo systemctl enable redis
```

#### Вариант C: Установите переменные окружения
```bash
# Если Redis на другом хосте/порту:
export REDIS_HOST=localhost  # или IP адрес
export REDIS_PORT=6379
export REDIS_PASSWORD=your_password_if_needed
```

#### Вариант D: Отключить Redis (временно для тестирования)
Если Redis не критичен, можно отключить кеширование в `application.yml`:
```yaml
spring:
  cache:
    type: simple  # Вместо redis
```

---

## 🔴 Ошибка 2: EuropePost API - пустой ServiceNumber

### Проблема:
```
Fetching JWT token for ServiceNumber: 
JWT not found in response
```

### Решение:
Установите переменные окружения для EuropePost API:

```bash
export EUPOST_SERVICE_NUMBER=your_service_number
export EUPOST_LOGIN=your_login
export EUPOST_PASSWORD=your_password
export EUPOST_API_URL=https://api.eurotorg.by:10352/Json
```

Проверьте в логах, что значения загрузились:
```bash
# После установки переменных перезапустите приложение
# В логах должно быть:
# Fetching JWT token for ServiceNumber: your_service_number (не пусто!)
```

---

## 🔴 Ошибка 3: bePaid 401 Unauthorized

### Проблема:
```
bePaid error for order 3: Status=401 UNAUTHORIZED
```

### Решение:
Установите правильные credentials для bePaid:

```bash
export BEPAID_SHOP_ID=your_shop_id
export BEPAID_SECRET_KEY=your_secret_key
export BEPAID_TEST_MODE=true  # или false для production
```

**ВАЖНО:** 
- Убедитесь, что `shop-id` и `secret-key` правильные
- В тестовом режиме используйте тестовые credentials
- В production используйте реальные credentials

---

## 🚀 БЫСТРОЕ РЕШЕНИЕ - Установка всех переменных

Создайте файл `.env` на сервере в директории с приложением:

```bash
# Перейдите в директорию с приложением
cd /path/to/your/app

# Создайте .env файл
nano .env
```

Добавьте все необходимые переменные:

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CargoDB
DB_USERNAME=fluvion_user
DB_PASSWORD=your_db_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars

# bePaid
BEPAID_SHOP_ID=your_shop_id
BEPAID_SECRET_KEY=your_secret_key
BEPAID_TEST_MODE=true

# EuropePost
EUPOST_SERVICE_NUMBER=your_service_number
EUPOST_LOGIN=your_login
EUPOST_PASSWORD=your_password
EUPOST_API_URL=https://api.eurotorg.by:10352/Json

# Server
SERVER_PORT=8080
```

Загрузите переменные:
```bash
export $(cat .env | xargs)
```

Перезапустите приложение.

---

## 🔍 Проверка переменных окружения

Проверьте, что переменные установлены:

```bash
# Проверить все переменные
env | grep -E "REDIS|BEPAID|EUPOST|DB_"

# Проверить конкретную переменную
echo $BEPAID_SHOP_ID
echo $EUPOST_SERVICE_NUMBER
echo $REDIS_HOST
```

---

## 🐳 Если используете Docker

В `docker-compose.yml` добавьте переменные окружения:

```yaml
services:
  backend:
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - BEPAID_SHOP_ID=${BEPAID_SHOP_ID}
      - BEPAID_SECRET_KEY=${BEPAID_SECRET_KEY}
      - EUPOST_SERVICE_NUMBER=${EUPOST_SERVICE_NUMBER}
      - EUPOST_LOGIN=${EUPOST_LOGIN}
      - EUPOST_PASSWORD=${EUPOST_PASSWORD}
    env_file:
      - .env  # Или укажите путь к .env файлу
```

---

## 📝 Чеклист

- [ ] Redis запущен и доступен
- [ ] `REDIS_HOST` и `REDIS_PORT` установлены
- [ ] `EUPOST_SERVICE_NUMBER` установлен (не пустой!)
- [ ] `EUPOST_LOGIN` и `EUPOST_PASSWORD` установлены
- [ ] `BEPAID_SHOP_ID` установлен
- [ ] `BEPAID_SECRET_KEY` установлен и правильный
- [ ] Все переменные загружены в окружение
- [ ] Приложение перезапущено после установки переменных

---

## ⚠️ Безопасность

**НИКОГДА не коммитьте .env файл в git!**

Используйте:
- `.env.example` для документации (без реальных значений)
- `.gitignore` должен содержать `.env`
- На сервере храните `.env` с реальными значениями






