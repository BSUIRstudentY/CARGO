# Инструкция по деплою React приложения

## Автоматический деплой (рекомендуется)

Используйте созданный скрипт:

```bash
cd CargoSite/React
./deploy.sh
```

## Ручной деплой

### 1. Сборка production версии

```bash
cd CargoSite/React
npm run build
```

### 2. Загрузка на сервер

```bash
scp -r dist/* root@93.125.114.252:/var/www/fluvion.by/html/
```

## Важные моменты

### Очистка старых файлов (опционально)

Если нужно полностью очистить директорию перед загрузкой:

```bash
ssh root@93.125.114.252 "rm -rf /var/www/fluvion.by/html/*"
scp -r dist/* root@93.125.114.252:/var/www/fluvion.by/html/
```

### Проверка прав доступа

После загрузки убедитесь, что файлы имеют правильные права:

```bash
ssh root@93.125.114.252 "chown -R www-data:www-data /var/www/fluvion.by/html && chmod -R 755 /var/www/fluvion.by/html"
```

### Настройка Nginx

Убедитесь, что Nginx правильно настроен для SPA (Single Page Application):

```nginx
server {
    listen 80;
    server_name fluvion.by www.fluvion.by;
    
    root /var/www/fluvion.by/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кеширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Проверка после деплоя

1. Откройте https://fluvion.by в браузере
2. Проверьте консоль браузера на ошибки
3. Проверьте Network tab - все ли файлы загружаются

## Troubleshooting

### Проблема: Белый экран после деплоя

**Решение**: Проверьте путь к файлам в `index.html`. Если используется относительный путь, убедитесь, что он правильный.

### Проблема: 404 на прямые ссылки

**Решение**: Убедитесь, что Nginx настроен с `try_files $uri $uri/ /index.html;` для обработки SPA роутинга.

### Проблема: Старые файлы не обновляются

**Решение**: Очистите кеш браузера (Ctrl+Shift+R) или добавьте версионирование к файлам в `vite.config.js`.

### Проблема: Ошибки загрузки assets

**Решение**: Проверьте, что все файлы из `dist/assets/` загружены на сервер.






