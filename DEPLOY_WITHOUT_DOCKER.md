# Деплой Spring Boot с SQLite на сервере (без Docker)

## Структура на сервере

```
/opt/fluvion/              # Рабочая директория Spring Boot
├── backend.jar            # JAR файл приложения
├── data/                  # Директория для SQLite базы данных
│   └── cargodb.sqlite     # SQLite база данных (создается автоматически)
└── logs/                  # Логи приложения (опционально)
```

## Шаг 1: Подготовка сервера

### 1.1 Создайте рабочую директорию:

```bash
# На сервере
sudo mkdir -p /opt/fluvion/data
sudo chown -R www-data:www-data /opt/fluvion
```

### 1.2 Настройте SQLite базу данных:

```bash
# На вашем компьютере
cd "Spring Boot"
scp setup-sqlite-server.sh root@ваш-сервер:/tmp/

# На сервере
ssh root@ваш-сервер
chmod +x /tmp/setup-sqlite-server.sh
/tmp/setup-sqlite-server.sh /opt/fluvion www-data
```

Или вручную:

```bash
# На сервере
mkdir -p /opt/fluvion/data
touch /opt/fluvion/data/cargodb.sqlite
chmod 664 /opt/fluvion/data/cargodb.sqlite
chmod 755 /opt/fluvion/data
chown -R www-data:www-data /opt/fluvion
```

## Шаг 2: Деплой JAR файла

### 2.1 Соберите и загрузите JAR:

```bash
# На вашем компьютере
cd "Spring Boot"
./mvnw clean package -DskipTests

# Проверьте, что SQLite НЕ в JAR
./verify-jar.sh target/demo-0.0.1-SNAPSHOT.jar

# Загрузите на сервер
scp target/demo-0.0.1-SNAPSHOT.jar root@ваш-сервер:/opt/fluvion/backend.jar
```

### 2.2 Установите права:

```bash
# На сервере
chmod 755 /opt/fluvion/backend.jar
chown www-data:www-data /opt/fluvion/backend.jar
```

## Шаг 3: Настройка systemd сервиса (рекомендуется)

### 3.1 Создайте файл сервиса:

```bash
# На сервере
sudo nano /etc/systemd/system/fluvion-backend.service
```

### 3.2 Содержимое файла:

```ini
[Unit]
Description=Fluvion Backend Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/fluvion
ExecStart=/usr/bin/java -jar /opt/fluvion/backend.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Переменные окружения (если нужны)
Environment="SPRING_PROFILES_ACTIVE=production"
Environment="SERVER_PORT=8080"

[Install]
WantedBy=multi-user.target
```

### 3.3 Запустите сервис:

```bash
# На сервере
sudo systemctl daemon-reload
sudo systemctl enable fluvion-backend
sudo systemctl start fluvion-backend
sudo systemctl status fluvion-backend
```

## Шаг 4: Проверка

### 4.1 Проверьте, что база данных создалась:

```bash
# На сервере
ls -lh /opt/fluvion/data/cargodb.sqlite
```

Если файл существует и имеет размер больше 0 - база создана.

### 4.2 Проверьте логи:

```bash
# На сервере
sudo journalctl -u fluvion-backend -f
```

Или если запускаете вручную:

```bash
# На сервере
cd /opt/fluvion
java -jar backend.jar
```

### 4.3 Проверьте подключение к базе:

В логах должно быть:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

И НЕ должно быть ошибок подключения к базе данных.

## Важные моменты

### Путь к базе данных:

В `application.yml` указан путь:
```yaml
url: jdbc:sqlite:./data/cargodb.sqlite
```

Это означает:
- Путь **относительный** к рабочей директории
- Если Spring Boot запускается из `/opt/fluvion`, база будет в `/opt/fluvion/data/cargodb.sqlite`
- **ВАЖНО**: Spring Boot должен запускаться из правильной директории!

### Автоматическое создание таблиц:

В `application.yml` установлено:
```yaml
hibernate:
  ddl-auto: update
```

Это означает:
- При первом запуске Spring Boot создаст таблицы автоматически
- При последующих запусках таблицы будут обновляться
- **Не нужно** создавать таблицы вручную

### Права доступа:

```bash
# Директория должна быть доступна для записи
chmod 755 /opt/fluvion/data
chmod 664 /opt/fluvion/data/cargodb.sqlite
chown -R www-data:www-data /opt/fluvion/data
```

## Troubleshooting

### Проблема: База данных не создается

**Решение:**
1. Проверьте права доступа на директорию `data/`
2. Убедитесь, что Spring Boot запускается из `/opt/fluvion`
3. Проверьте логи на ошибки

### Проблема: Ошибка "database is locked"

**Решение:**
1. Убедитесь, что только один экземпляр Spring Boot запущен
2. Проверьте права доступа на файл базы данных
3. Перезапустите сервис: `sudo systemctl restart fluvion-backend`

### Проблема: Таблицы не создаются

**Решение:**
1. Проверьте логи на ошибки Hibernate
2. Убедитесь, что `ddl-auto: update` в application.yml
3. Попробуйте временно изменить на `ddl-auto: create` (осторожно - удалит данные!)

## Резервное копирование

### Создание бэкапа:

```bash
# На сервере
cp /opt/fluvion/data/cargodb.sqlite /opt/fluvion/data/cargodb.sqlite.backup.$(date +%Y%m%d_%H%M%S)
```

### Восстановление из бэкапа:

```bash
# На сервере
sudo systemctl stop fluvion-backend
cp /opt/fluvion/data/cargodb.sqlite.backup.20250112_120000 /opt/fluvion/data/cargodb.sqlite
sudo systemctl start fluvion-backend
```

## Итог

- ✅ SQLite файл создается автоматически при первом запуске Spring Boot
- ✅ Расположение: `/opt/fluvion/data/cargodb.sqlite` (если рабочая директория `/opt/fluvion`)
- ✅ Таблицы создаются автоматически благодаря `ddl-auto: update`
- ✅ Нужно только создать директорию `data/` и установить права доступа






























