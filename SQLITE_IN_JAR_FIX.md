# Исправление: SQLite база данных в JAR файле

## Проблема
SQLite база данных (`data/cargodb.sqlite`) попадала в JAR файл при сборке Maven, что означало:
- ❌ Локальная база данных копировалась на сервер внутри JAR
- ❌ При каждом деплое локальная база перезаписывала продакшн базу
- ❌ Потеря данных на продакшене

## Решение

### ✅ Что было сделано:

1. **Обновлен `pom.xml`**
   - Добавлен `maven-resources-plugin` с исключениями для SQLite
   - Настроены `<resources>` с исключениями:
     - `**/*.sqlite`
     - `**/*.sqlite3`
     - `**/*.db`
     - `**/data/**`
   - Spring Boot plugin настроен для исключения SQLite

2. **Обновлен скрипт `deploy.sh`**
   - Добавлена проверка JAR на наличие SQLite перед отправкой
   - Скрипт останавливается с ошибкой, если SQLite найден в JAR
   - Показывает, какие файлы найдены

3. **Создан скрипт `verify-jar.sh`**
   - Утилита для проверки JAR файла
   - Показывает структуру JAR
   - Проверяет наличие SQLite файлов

## Как это работает

### Maven исключает SQLite при сборке:

```xml
<resources>
    <resource>
        <directory>src/main/resources</directory>
        <excludes>
            <exclude>**/*.sqlite</exclude>
            <exclude>**/*.db</exclude>
            <exclude>**/data/**</exclude>
        </excludes>
    </resource>
</resources>
```

### Скрипт деплоя проверяет JAR:

```bash
# Проверка перед отправкой
SQLITE_IN_JAR=$(jar -tf "$JAR_FILE" | grep -i "\.sqlite\|\.db")

if [ -n "$SQLITE_IN_JAR" ]; then
    echo "❌ SQLite найден в JAR!"
    exit 1
fi
```

## Использование

### 1. Сборка и проверка:

```bash
cd "Spring Boot"

# Соберите проект
./mvnw clean package -DskipTests

# Проверьте JAR (опционально)
./verify-jar.sh target/demo-0.0.1-SNAPSHOT.jar
```

### 2. Деплой:

```bash
./deploy.sh
```

Скрипт автоматически:
- Соберет JAR
- Проверит, что SQLite НЕ в JAR
- Скопирует JAR на сервер
- Остановится с ошибкой, если SQLite найден

## Проверка

### Вручную проверить JAR:

```bash
# Показать содержимое JAR
jar -tf target/demo-0.0.1-SNAPSHOT.jar | grep -i sqlite

# Должно вернуть пустой результат (SQLite не найден)
```

### Проверить размер JAR:

```bash
# JAR без SQLite должен быть меньше
ls -lh target/demo-0.0.1-SNAPSHOT.jar
```

### Проверить на сервере:

```bash
# На сервере проверьте, что JAR не содержит SQLite
ssh root@93.125.114.252 "jar -tf /opt/fluvion/backend.jar | grep -i sqlite"
# Должно вернуть пустой результат
```

## Структура проекта

### Локально (разработка):
```
Spring Boot/
  ├── data/
  │   └── cargodb.sqlite  ← Только локально, НЕ в JAR!
  ├── src/
  │   └── main/
  │       └── resources/
  │           └── application.yml
  └── pom.xml  ← Исключает SQLite из сборки
```

### В JAR файле:
```
demo-0.0.1-SNAPSHOT.jar
  ├── BOOT-INF/
  │   ├── classes/
  │   │   ├── application.yml  ← Конфигурация
  │   │   └── ... (код приложения)
  │   └── lib/  ← Зависимости
  └── META-INF/
      └── MANIFEST.MF
```

**SQLite файлов НЕТ в JAR!**

## Troubleshooting

### Проблема: SQLite все еще в JAR

**Решение:**
1. Проверьте `pom.xml` - должны быть исключения в `<resources>`
2. Очистите и пересоберите:
   ```bash
   ./mvnw clean
   ./mvnw package -DskipTests
   ```
3. Проверьте JAR: `./verify-jar.sh target/demo-0.0.1-SNAPSHOT.jar`

### Проблема: Скрипт деплоя находит SQLite в JAR

**Решение:**
1. Убедитесь, что `pom.xml` обновлен
2. Удалите старый JAR: `rm -f target/*.jar`
3. Пересоберите проект
4. Проверьте: `./verify-jar.sh target/demo-0.0.1-SNAPSHOT.jar`

### Проблема: Приложение не находит SQLite локально

**Это нормально!** SQLite должен быть в `./data/cargodb.sqlite` относительно рабочей директории, а не внутри JAR.

Для локальной разработки:
```bash
cd "Spring Boot"
./mvnw spring-boot:run
# SQLite будет в ./data/cargodb.sqlite
```

## Важные моменты

### ✅ Что правильно:
- SQLite находится в `Spring Boot/data/` (вне JAR)
- Maven исключает SQLite из сборки
- Скрипт деплоя проверяет JAR перед отправкой
- На сервере используется MySQL из docker-compose

### ❌ Чего избегать:
- НЕ размещайте SQLite в `src/main/resources/`
- НЕ копируйте `data/` директорию на сервер
- НЕ коммитьте SQLite в git
- НЕ используйте SQLite на продакшене

## Итог

Теперь:
- ✅ SQLite НЕ попадает в JAR при сборке
- ✅ Скрипт деплоя проверяет JAR перед отправкой
- ✅ Локальная база остается только локально
- ✅ На сервере используется MySQL
- ✅ Данные продакшена защищены






























