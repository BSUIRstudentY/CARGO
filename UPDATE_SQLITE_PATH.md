# Обновление пути к SQLite базе данных

## Изменения

Путь к SQLite базе данных изменен в `application.yml`:

**Было:**
```yaml
url: jdbc:sqlite:./data/cargodb.sqlite
```

**Стало:**
```yaml
url: jdbc:sqlite:./data/cargo.sqlite
```

## Что это означает

- SQLite файл теперь называется `cargo.sqlite` (вместо `cargodb.sqlite`)
- Файл находится в директории `data/` относительно рабочей директории Spring Boot
- Если Spring Boot запускается из `/root/`, файл будет в `/root/data/cargo.sqlite`

## На сервере

Если у вас уже есть файл `cargo.sqlite` в папке `data/`, он будет использоваться автоматически.

Если файл называется по-другому, переименуйте его:

```bash
# На сервере
cd /root
mv data/cargodb.sqlite data/cargo.sqlite  # если нужно переименовать
```

## После обновления

1. Пересоберите JAR:
```bash
cd "Spring Boot"
./mvnw clean package -DskipTests
```

2. Загрузите на сервер:
```bash
scp target/demo-0.0.1-SNAPSHOT.jar root@ваш-сервер:/root/backend.jar
```

3. Перезапустите Spring Boot на сервере

## Проверка

После запуска Spring Boot проверьте:

```bash
# На сервере
ls -lh /root/data/cargo.sqlite
```

Файл должен существовать и использоваться приложением.






























