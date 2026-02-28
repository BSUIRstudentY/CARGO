# Быстрая настройка SQLite на сервере

## Короткий ответ:

**SQLite файл создастся автоматически** при первом запуске Spring Boot, но нужно:

1. Создать директорию `data/` в рабочей директории Spring Boot
2. Установить права доступа
3. Запустить Spring Boot из правильной директории

## Быстрая настройка:

### На сервере:

```bash
# 1. Создайте рабочую директорию (если еще нет)
mkdir -p /opt/fluvion/data

# 2. Установите права доступа
chmod 755 /opt/fluvion/data
chown -R www-data:www-data /opt/fluvion/data  # или ваш пользователь

# 3. Запустите Spring Boot из /opt/fluvion
cd /opt/fluvion
java -jar backend.jar
```

**Всё!** SQLite файл создастся автоматически в `/opt/fluvion/data/cargodb.sqlite`

## Где создастся SQLite файл?

Путь в `application.yml`:
```yaml
url: jdbc:sqlite:./data/cargodb.sqlite
```

Это означает:
- **Относительный путь** от рабочей директории Spring Boot
- Если запускаете из `/opt/fluvion` → файл будет в `/opt/fluvion/data/cargodb.sqlite`
- Если запускаете из `/home/user/app` → файл будет в `/home/user/app/data/cargodb.sqlite`

## Важно:

✅ **Создайте директорию `data/` заранее**  
✅ **Установите права доступа** (755 для директории, 664 для файла)  
✅ **Запускайте Spring Boot из правильной директории**  
✅ **Таблицы создадутся автоматически** (благодаря `ddl-auto: update`)  

## Проверка:

```bash
# После запуска Spring Boot проверьте:
ls -lh /opt/fluvion/data/cargodb.sqlite

# Должен быть файл с размером > 0
```

## Если файл не создается:

1. Проверьте права: `ls -la /opt/fluvion/data/`
2. Проверьте логи Spring Boot на ошибки
3. Убедитесь, что запускаете из правильной директории






























