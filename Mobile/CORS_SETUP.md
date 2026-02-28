# Настройка CORS для мобильного приложения

Для работы мобильного приложения необходимо обновить настройки CORS в Spring Boot.

## Вариант 1: Обновление application.yml (Рекомендуется)

Откройте файл `Spring Boot/src/main/resources/application.yml` и обновите секцию CORS:

```yaml
app:
  cors:
    allowed-origins: http://localhost:5173,https://fluvion.by,exp://192.168.1.XXX:8081
```

Где `192.168.1.XXX` - IP адрес вашего компьютера в локальной сети.

**Для продакшена** добавьте все необходимые домены:
```yaml
app:
  cors:
    allowed-origins: http://localhost:5173,https://fluvion.by,exp://*,https://*.expo.dev
```

## Вариант 2: Обновление SecurityConfiguration.java

Если вы хотите использовать паттерны для более гибкой настройки, обновите метод `corsConfigurationSource()` в `SecurityConfiguration.java`:

```java
// Добавьте поддержку Expo URL паттернов
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:*",
    "https://*.fluvion.by",
    "exp://*",
    "https://*.expo.dev"
));
```

## Проверка настройки

После обновления конфигурации:

1. Перезапустите Spring Boot сервер
2. Проверьте логи - должно появиться сообщение о настройке CORS
3. Попробуйте выполнить запрос из мобильного приложения

## Решение проблем

### Ошибка CORS при запросах из мобильного приложения

1. Убедитесь, что IP-адрес в `application.yml` правильный
2. Проверьте, что устройство и сервер в одной сети
3. Для Expo Go используйте паттерн `exp://*`
4. Проверьте логи Spring Boot на наличие ошибок CORS

### Для разработки на физическом устройстве

Используйте IP-адрес вашего компьютера вместо localhost:
- Windows: `ipconfig` в командной строке
- Mac/Linux: `ifconfig` или `ip addr`

Пример:
```yaml
app:
  cors:
    allowed-origins: http://192.168.1.100:8080,exp://192.168.1.100:8081
```




