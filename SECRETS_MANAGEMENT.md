# Управление секретами и переменными окружения

## ⚠️ КРИТИЧЕСКИ ВАЖНО

### Frontend (React) vs Backend (Spring Boot)

**ГЛАВНОЕ ПРАВИЛО:** Все что попадает в билд фронтенда - доступно пользователю!

---

## 🔴 Frontend (React) - ЧТО НЕЛЬЗЯ

### ❌ НИКОГДА не храните в frontend:
- API ключи (bePaid, внешние сервисы)
- Секретные ключи
- Пароли
- JWT секреты
- Токены доступа
- Приватные ключи

### ✅ МОЖНО хранить в frontend:
- Публичные URL (API endpoints)
- Feature flags (включено/выключено)
- Публичные конфигурации
- Версии API
- Настройки UI

---

## 🟢 Backend (Spring Boot) - ГДЕ ХРАНИТЬ СЕКРЕТЫ

### Вариант 1: Переменные окружения на сервере (РЕКОМЕНДУЕТСЯ)

```bash
# На сервере создайте файл /etc/environment или используйте systemd
export DB_PASSWORD=your_secret_password
export JWT_SECRET=your_jwt_secret
export BEPAID_SECRET_KEY=your_bepaid_key
export REDIS_PASSWORD=your_redis_password
```

**Или через systemd service:**
```ini
# /etc/systemd/system/fluvion.service
[Service]
Environment="DB_PASSWORD=your_secret"
Environment="JWT_SECRET=your_jwt_secret"
Environment="BEPAID_SECRET_KEY=your_bepaid_key"
```

### Вариант 2: .env файл (только на сервере!)

```bash
# Создайте .env в корне Spring Boot проекта НА СЕРВЕРЕ
# НИКОГДА не коммитьте в git!

DB_PASSWORD=your_secret
JWT_SECRET=your_jwt_secret
BEPAID_SECRET_KEY=your_bepaid_key
```

**Добавьте в .gitignore:**
```
.env
.env.local
.env.production
```

### Вариант 3: application-production.yml (с переменными)

```yaml
# src/main/resources/application-production.yml
spring:
  datasource:
    password: ${DB_PASSWORD}
jwt:
  secret: ${JWT_SECRET}
bepaid:
  secret-key: ${BEPAID_SECRET_KEY}
```

---

## 📋 ЧТО ДЕЛАТЬ ПРИ БИЛДЕ

### Frontend (React)

#### 1. Создайте .env.example (для документации)
```bash
# CargoSite/React/.env.example
VITE_API_URL=https://fluvion.by/api
VITE_WS_URL=wss://fluvion.by/ws
VITE_ENABLE_ANALYTICS=false
```

#### 2. Обновите код для использования переменных
```javascript
// src/api/axiosInstance.jsx
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fluvion.by/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 3. При билде Vite автоматически подставит переменные
```bash
# В .env файле (НЕ коммитьте!)
VITE_API_URL=https://fluvion.by/api

# При билде
npm run build
# Vite заменит import.meta.env.VITE_API_URL на значение из .env
```

#### 4. Для production используйте переменные окружения CI/CD
```yaml
# GitHub Actions / GitLab CI пример
env:
  VITE_API_URL: ${{ secrets.API_URL }}
```

### Backend (Spring Boot)

#### 1. Используйте переменные окружения (уже настроено)
```yaml
# application.yml уже использует ${VARIABLE_NAME:default}
spring:
  datasource:
    password: ${DB_PASSWORD:}
```

#### 2. При деплое установите переменные на сервере
```bash
# Вариант A: Через systemd
sudo systemctl edit fluvion.service
# Добавьте Environment="DB_PASSWORD=secret"

# Вариант B: Через .env файл
echo "DB_PASSWORD=secret" >> /opt/fluvion/.env
export $(cat /opt/fluvion/.env | xargs)

# Вариант C: Через docker-compose
# docker-compose.yml
environment:
  - DB_PASSWORD=${DB_PASSWORD}
```

---

## 🚀 РЕКОМЕНДУЕМАЯ СТРУКТУРА

### На сервере (production):

```
/opt/fluvion/
├── backend/
│   ├── application.jar
│   └── .env              # ← Секреты здесь (НЕ в git!)
├── frontend/
│   └── dist/             # ← Билд фронтенда
└── nginx/
    └── fluvion.by.conf
```

### В репозитории:

```
CargoSite/
├── React/
│   ├── .env.example      # ← Пример (можно коммитить)
│   └── .gitignore        # ← .env в ignore
├── Spring Boot/
│   ├── .gitignore        # ← .env в ignore
│   └── src/main/resources/
│       └── application.yml  # ← Использует ${VARIABLE}
```

---

## 🔐 BEST PRACTICES

### 1. Разделение секретов по окружениям

```bash
# Development (локально)
.env.development

# Production (на сервере)
.env.production
```

### 2. Используйте секреты менеджеры (для больших проектов)

- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Azure Key Vault**
- **Kubernetes Secrets**

### 3. Ротация секретов

- Регулярно меняйте пароли и ключи
- Используйте разные ключи для dev/prod
- Логируйте доступ к секретам

### 4. Мониторинг

- Отслеживайте утечки секретов (git-secrets, gitguardian)
- Алерты при изменении секретов
- Аудит доступа

---

## 📝 ЧЕКЛИСТ ПЕРЕД ДЕПЛОЕМ

### Frontend:
- [ ] Все секреты удалены из кода
- [ ] Используются только публичные переменные (VITE_*)
- [ ] .env файл в .gitignore
- [ ] .env.example создан для документации

### Backend:
- [ ] Все секреты в переменных окружения
- [ ] application.yml использует ${VARIABLE}
- [ ] .env файл НЕ в git
- [ ] Переменные установлены на сервере
- [ ] Тестирование с реальными переменными

---

## 🛠️ БЫСТРЫЙ СТАРТ

### 1. Создайте .env.example файлы

```bash
# React/.env.example
VITE_API_URL=https://fluvion.by/api
VITE_WS_URL=wss://fluvion.by/ws

# Spring Boot/.env.example
DB_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
BEPAID_SECRET_KEY=your_bepaid_key_here
```

### 2. Добавьте в .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
*.env
```

### 3. На сервере создайте .env

```bash
# Скопируйте .env.example в .env
cp .env.example .env

# Отредактируйте реальными значениями
nano .env

# Загрузите переменные
export $(cat .env | xargs)
```

---

## ⚠️ ЧТО НИКОГДА НЕ ДЕЛАТЬ

1. ❌ Коммитить .env файлы в git
2. ❌ Хранить секреты в коде
3. ❌ Использовать один секрет для dev и prod
4. ❌ Делиться секретами в чатах/email
5. ❌ Хранить секреты в билде фронтенда

---

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_cryptographic_key)
- [12 Factor App - Config](https://12factor.net/config)
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)






