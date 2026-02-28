# Ответ: SQLite на сервере

## Короткий ответ:

**SQLite файл НЕ должен создаваться на сервере автоматически**, потому что в `docker-compose.yml` установлены переменные окружения для MySQL, которые переопределяют SQLite.

## Как это работает:

### В application.yml:
```yaml
url: ${SPRING_DATASOURCE_URL:jdbc:sqlite:./data/cargodb.sqlite}
```

Это означает:
- **Если** `SPRING_DATASOURCE_URL` установлена → используется она (MySQL)
- **Если нет** → используется SQLite и файл создается автоматически

### В docker-compose.yml (на сервере):
```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/CargoDB?...
  - SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
  - HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
```

✅ Переменные **установлены**, поэтому используется MySQL, а не SQLite.

## Что происходит на сервере:

1. **При запуске контейнера:**
   - Docker устанавливает переменные окружения из docker-compose.yml
   - Spring Boot читает `SPRING_DATASOURCE_URL`
   - Видит, что это MySQL, а не SQLite
   - Подключается к MySQL
   - **SQLite файл НЕ создается**

2. **Если переменные НЕ установлены (ошибка конфигурации):**
   - Spring Boot не находит `SPRING_DATASOURCE_URL`
   - Использует значение по умолчанию (SQLite)
   - SQLite файл создается автоматически в `./data/cargodb.sqlite`
   - ⚠️ Это плохо! Нужно исправить конфигурацию.

## Проверка на сервере:

### 1. Проверьте переменные окружения:

```bash
# На сервере
docker exec backend env | grep SPRING_DATASOURCE
```

Должно показать:
```
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/CargoDB?...
SPRING_DATASOURCE_USERNAME=fluvion_user
SPRING_DATASOURCE_PASSWORD=1206_1105timaZ
SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver
```

### 2. Проверьте логи подключения:

```bash
# На сервере
docker-compose logs backend | grep -i "datasource\|mysql\|connected"
```

Должно показать подключение к MySQL, а не SQLite.

### 3. Проверьте, не создался ли SQLite файл:

```bash
# На сервере
docker exec backend ls -la /root/data/ 2>/dev/null || echo "Директория data не существует - отлично!"
```

Если директория не существует - это хорошо! Значит SQLite не используется.

## Итог:

- ✅ **SQLite файл НЕ создается на сервере**, если переменные окружения установлены правильно
- ✅ **На сервере используется MySQL** из docker-compose
- ✅ **Ничего создавать вручную не нужно** - всё работает автоматически
- ⚠️ **Если SQLite файл все-таки создался** - значит переменные окружения не работают, нужно проверить docker-compose.yml

## Если SQLite файл все-таки создался:

1. Проверьте docker-compose.yml на сервере
2. Убедитесь, что переменные окружения установлены
3. Перезапустите контейнер: `docker-compose restart backend`
4. Удалите SQLite файл (если создался): `docker exec backend rm -rf /root/data/`






























