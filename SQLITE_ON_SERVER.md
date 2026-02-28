# SQLite на сервере - важная информация

## ⚠️ ВАЖНО: SQLite файл НЕ должен создаваться на сервере!

На сервере должна использоваться **MySQL** из docker-compose, а не SQLite.

## Как это работает

### Локально (разработка):
- Если переменные окружения **НЕ** установлены → используется SQLite
- SQLite файл создается автоматически в `./data/cargodb.sqlite`
- Это нормально для локальной разработки

### На сервере (продакшн):
- Переменные окружения **ОБЯЗАТЕЛЬНО** должны быть установлены в docker-compose.yml
- Если переменные установлены → используется MySQL
- SQLite файл **НЕ** создается
- Если переменные **НЕ** установлены → SQLite файл создастся автоматически (это плохо!)

## Проверка конфигурации

### 1. Проверьте docker-compose.yml на сервере:

```bash
# На сервере
cd /opt/fluvion  # или где у вас docker-compose.yml
cat docker-compose.yml | grep -A 10 "environment:"
```

Должны быть установлены:
```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/CargoDB?...
  - SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
  - HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
```

### 2. Проверьте логи приложения:

```bash
# На сервере
docker-compose logs backend | grep -i "datasource\|mysql\|sqlite"
```

Должно показать подключение к MySQL, а не SQLite.

### 3. Проверьте, не создался ли SQLite файл:

```bash
# На сервере
find /opt/fluvion -name "*.sqlite" -o -name "*.db"
# Должно вернуть пустой результат
```

## Что делать, если SQLite файл создался на сервере

### Проблема:
SQLite файл создался на сервере, значит переменные окружения не работают.

### Решение:

1. **Проверьте docker-compose.yml:**
   ```bash
   # Убедитесь, что переменные установлены
   cat docker-compose.yml | grep SPRING_DATASOURCE_URL
   ```

2. **Перезапустите контейнер:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Проверьте логи:**
   ```bash
   docker-compose logs backend | tail -50
   ```
   
   Должно быть:
   ```
   HikariPool-1 - Starting...
   HikariPool-1 - Start completed.
   ```
   
   И НЕ должно быть:
   ```
   SQLite database created
   ```

4. **Удалите SQLite файл (если создался):**
   ```bash
   # На сервере, если SQLite файл все-таки создался
   find /opt/fluvion -name "*.sqlite" -delete
   ```

## Конфигурация в application.yml

В `application.yml` используется такой синтаксис:

```yaml
url: ${SPRING_DATASOURCE_URL:jdbc:sqlite:./data/cargodb.sqlite}
```

Это означает:
- **Если** `SPRING_DATASOURCE_URL` установлена → используется она (MySQL)
- **Если нет** → используется SQLite (только для разработки!)

## На сервере ОБЯЗАТЕЛЬНО:

✅ Установить переменные окружения в docker-compose.yml  
✅ Использовать MySQL, а не SQLite  
✅ Проверить логи при запуске  
✅ Убедиться, что SQLite файл НЕ создается  

## Проверка после деплоя

После деплоя проверьте:

```bash
# 1. Проверьте переменные окружения в контейнере
docker exec backend env | grep SPRING_DATASOURCE

# 2. Проверьте логи подключения
docker-compose logs backend | grep -i "datasource\|connected\|mysql"

# 3. Проверьте, что SQLite файл НЕ создался
docker exec backend ls -la /root/data/ 2>/dev/null || echo "Директория data не существует - хорошо!"
```

## Итог

- ✅ **SQLite файл НЕ должен создаваться на сервере**
- ✅ **На сервере используется MySQL из docker-compose**
- ✅ **Переменные окружения в docker-compose.yml переопределяют SQLite на MySQL**
- ⚠️ **Если переменные не установлены, SQLite создастся автоматически (это плохо!)**






























