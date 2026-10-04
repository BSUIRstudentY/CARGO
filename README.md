# Fluvion

Доставка товаров из Китая в Минск. Витрина на React, API на Spring Boot. Заказ проходит семь шагов: создание, решение администратора, оплата выкупа, склад в Китае, оплата доставки по весу, путь в Минск, выдача в отделении Европочты. Схема статусов описана в [docs/order-flow-plan.md](docs/order-flow-plan.md).

## Что нужно

- Java 21
- Maven 3.8+
- Node.js 20+ и npm

## Настройка

```bash
cp .env.example .env
```

В `.env` попадают почта, JWT, bePaid и Европочта. Файл не коммитится. Без этих значений локальный запуск на SQLite всё равно стартует: оплата «подтвердит администратор» не требует bePaid.

По умолчанию база — файл `Spring Boot/data/cargo.sqlite`. Для MySQL задайте в `.env`:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/CargoDB?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=fluvion_user
SPRING_DATASOURCE_PASSWORD=
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
```

Docker Compose читает тот же `.env`. Пароли базы задаются переменными `DB_PASSWORD` и `MYSQL_ROOT_PASSWORD`.

## Запуск

```bash
mkdir -p "Spring Boot/data"
cd "Spring Boot"
mvn -B spring-boot:run
```

Во втором терминале:

```bash
cd React
npm ci --legacy-peer-deps
npm run dev
```

Витрина: http://localhost:5173. API: http://localhost:8080/api.

## Проверки

```bash
cd "Spring Boot" && mvn -B test
cd React && npm run lint && npm run build
```
