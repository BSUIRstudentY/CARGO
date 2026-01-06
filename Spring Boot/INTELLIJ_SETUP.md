# Настройка переменных окружения в IntelliJ IDEA

## Проблема
Spring Boot не читает `.env` файлы автоматически. Нужно настроить переменные окружения в Run Configuration.

## Решение 1: Настроить в Run Configuration (Рекомендуется)

1. Откройте **Run → Edit Configurations...**
2. Найдите вашу конфигурацию (например, `DemoApplication`)
3. В разделе **"Environment variables"** нажмите на значок папки 📁
4. Добавьте следующие переменные (или используйте кнопку "Load from file" если доступна):

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=CargoDB
DB_USERNAME=fluvion_user
DB_PASSWORD=1206_1105timaZ
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=fluvion-secure-jwt-secret-key-for-production-minimum-32-chars-long
JWT_EXPIRATION=86400000
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=fluvionbiz@gmail.com
MAIL_PASSWORD=luww omad mrqz qlyx
BEPAID_SHOP_ID=33276
BEPAID_SECRET_KEY=7129e87495f7bb387ed05351dcccaa8631e883d8b2e936e07f3b10e2f04e659b
BEPAID_CHECKOUT_URL=https://checkout.bepaid.by/ctp/api/checkouts
BEPAID_RETURN_URL=https://fluvion.by/thanks
BEPAID_FAIL_URL=https://fluvion.by/badResponse
BEPAID_CALLBACK_URL=https://fluvion.by/api/payment/webhook
BEPAID_TEST_MODE=true
EUPOST_API_URL=https://api.eurotorg.by:10352/Json
EUPOST_SERVICE_NUMBER=134C9258-5EC7-4C29-B1E4-5A385385AE8F
EUPOST_LOGIN=693299414_Kovalevsky
EUPOST_PASSWORD=JLOHVQET4U12O1F
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://fluvion.by
SERVER_PORT=8080
HIBERNATE_DDL_AUTO=update
SHOW_SQL=false
```

5. Нажмите **OK** и **Apply**

## Решение 2: Использовать плагин EnvFile

1. Установите плагин **EnvFile**:
   - Settings → Plugins
   - Поиск: "EnvFile"
   - Установите плагин

2. В Run Configuration:
   - Нажмите на "+" внизу
   - Выберите "EnvFile"
   - Укажите путь к `.env` файлу: `.env`
   - Сохраните

## Решение 3: Использовать скрипт run.sh

Можно запускать приложение через терминал:

```bash
cd "/home/itmaibenben/Рабочий стол/Cursor/CargoSite/Spring Boot"
./run.sh
```

## Проверка

После настройки переменных окружения, в логах при запуске НЕ должно быть ошибки:
```
Access denied for user 'fluvion_user'@'localhost' (using password: NO)
```

Вместо этого должно быть успешное подключение к базе данных.




