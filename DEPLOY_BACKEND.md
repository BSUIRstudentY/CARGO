# Деплой Backend (Spring Boot) без SQLite

## ⚠️ ВАЖНО: SQLite база данных НЕ копируется на сервер!

Это сделано специально, чтобы:
- ✅ Локальная база данных разработки не перезаписывала продакшн базу
- ✅ На сервере использовалась MySQL из docker-compose
- ✅ Избежать потери данных на продакшене

## Автоматический деплой

### 1. Используйте скрипт деплоя:

```bash
cd "Spring Boot"
./deploy.sh
```

Скрипт:
- ✅ Собирает JAR файл
- ✅ **ПРОВЕРЯЕТ, что SQLite НЕ попал в JAR** (критично!)
- ✅ Копирует ТОЛЬКО JAR на сервер
- ✅ НЕ копирует директорию `data/` с SQLite
- ✅ Проверяет целостность файла

### 2. Проверка JAR перед деплоем (опционально):

```bash
cd "Spring Boot"
./verify-jar.sh target/demo-0.0.1-SNAPSHOT.jar
```

Этот скрипт покажет, есть ли SQLite файлы внутри JAR.

### 2. На сервере используйте docker-compose

Убедитесь, что в `docker-compose.yml` настроен MySQL:

```yaml
services:
  backend:
    environment:
      # MySQL для продакшена
      - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/CargoDB?useSSL=false&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=fluvion_user
      - SPRING_DATASOURCE_PASSWORD=your_password
      - SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.mysql.cj.jdbc.Driver
      - HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
```

### 3. Перезапустите контейнер

```bash
# На сервере
cd /opt/fluvion  # или где у вас docker-compose.yml
docker-compose restart backend
```

## Ручной деплой

Если нужно задеплоить вручную:

```bash
# 1. Соберите JAR
cd "Spring Boot"
./mvnw clean package -DskipTests

# 2. Найдите JAR файл
JAR_FILE=$(find target -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" | head -1)

# 3. Скопируйте ТОЛЬКО JAR (НЕ копируйте data/!)
scp "$JAR_FILE" root@93.125.114.252:/opt/fluvion/backend.jar
```

## Проверка что SQLite не копируется

### В .gitignore уже есть:
```
*.sqlite
*.sqlite3
*.db
Spring Boot/data/
```

### В pom.xml настроены исключения:
- ❌ `**/*.sqlite` - исключены из ресурсов
- ❌ `**/*.db` - исключены из ресурсов
- ❌ `**/data/**` - исключена директория data
- ✅ Maven не включает SQLite в JAR при сборке

### Скрипт deploy.sh:
- ✅ **Проверяет JAR на наличие SQLite** перед отправкой
- ✅ Останавливает деплой, если SQLite найден в JAR
- ❌ НЕ копирует `data/` директорию
- ❌ НЕ копирует `*.sqlite` файлы

### Копируется только:
- ✅ `backend.jar` - собранное приложение (БЕЗ SQLite внутри!)

## Конфигурация базы данных

### Для разработки (локально):
- Используется SQLite: `./data/cargodb.sqlite`
- Настройки в `application.yml`

### Для продакшена (на сервере):
- Используется MySQL из docker-compose
- Переменные окружения переопределяют SQLite
- `application.yml` автоматически переключается на MySQL при наличии переменных

## Переменные окружения для MySQL

В docker-compose.yml должны быть установлены:

```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/CargoDB?useSSL=false&serverTimezone=UTC
  - SPRING_DATASOURCE_USERNAME=fluvion_user
  - SPRING_DATASOURCE_PASSWORD=your_password
  - SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.mysql.cj.jdbc.Driver
  - HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
```

## Troubleshooting

### Проблема: Приложение все еще использует SQLite на сервере

**Решение:**
1. Проверьте переменные окружения в docker-compose.yml
2. Убедитесь, что MySQL контейнер запущен
3. Проверьте логи: `docker-compose logs backend`

### Проблема: Ошибка подключения к MySQL

**Решение:**
1. Проверьте, что MySQL контейнер запущен: `docker-compose ps`
2. Проверьте переменные окружения: `docker-compose config`
3. Проверьте логи MySQL: `docker-compose logs mysql`

### Проблема: JAR файл не найден после деплоя

**Решение:**
1. Проверьте путь на сервере: `ls -la /opt/fluvion/backend.jar`
2. Проверьте права доступа: `chmod 755 /opt/fluvion/backend.jar`
3. Проверьте docker-compose.yml - путь к JAR должен совпадать

## Безопасность

✅ SQLite база данных остается только на локальной машине  
✅ На сервере используется изолированная MySQL база  
✅ Локальные данные разработки не влияют на продакшн  
✅ Каждая среда имеет свою базу данных  

