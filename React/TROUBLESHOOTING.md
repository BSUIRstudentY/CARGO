# Решение проблемы "Invalid or unexpected token"

## Проблема
Ошибка `Uncaught SyntaxError: Invalid or unexpected token` в файле `index-DKSs9nkM.js` обычно означает, что:

1. **Файл не полностью загружен** - файл оборвался при передаче
2. **Сервер возвращает HTML вместо JS** - неправильная настройка Nginx
3. **Неправильный MIME тип** - сервер отправляет `text/html` вместо `application/javascript`
4. **Проблемы с кодировкой** - файл поврежден при передаче

## Решения

### 1. Проверка файла на сервере

```bash
# Подключитесь к серверу
ssh root@93.125.114.252

# Проверьте размер файла
ls -lh /var/www/fluvion.by/html/assets/index-*.js

# Проверьте первые строки файла (должен быть валидный JS)
head -c 100 /var/www/fluvion.by/html/assets/index-DKSs9nkM.js

# Если видите HTML (например, "<!DOCTYPE html>"), значит файл не загрузился
```

### 2. Проверка Nginx конфигурации

```bash
# На сервере проверьте конфигурацию
ssh root@93.125.114.252 "cat /etc/nginx/sites-available/fluvion.by | grep -A 5 '\.js'"

# Должно быть:
# location ~* \.js$ {
#     add_header Content-Type application/javascript;
# }
```

### 3. Перезагрузка с проверкой

Используйте обновленный скрипт `deploy.sh`, который:
- Проверяет размеры файлов
- Использует атомарную замену
- Устанавливает правильные права доступа

```bash
cd CargoSite/React
./deploy.sh
```

### 4. Очистка кеша браузера

После деплоя:
- Нажмите `Ctrl+Shift+R` (Windows/Linux) или `Cmd+Shift+R` (Mac)
- Или откройте в режиме инкогнито

### 5. Проверка в браузере

1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Найдите запрос к `index-DKSs9nkM.js`
4. Проверьте:
   - **Status**: должен быть `200 OK`
   - **Content-Type**: должен быть `application/javascript` (НЕ `text/html`)
   - **Size**: должен совпадать с размером локального файла

### 6. Ручная проверка файла

```bash
# На сервере проверьте, что файл валидный JS
ssh root@93.125.114.252 "file /var/www/fluvion.by/html/assets/index-DKSs9nkM.js"

# Должно быть: "ASCII text" или "UTF-8 Unicode text"
# НЕ должно быть: "HTML document"
```

### 7. Если файл поврежден

```bash
# Перезагрузите только проблемный файл
cd CargoSite/React
scp dist/assets/index-DKSs9nkM.js root@93.125.114.252:/var/www/fluvion.by/html/assets/

# Проверьте размер
ssh root@93.125.114.252 "ls -lh /var/www/fluvion.by/html/assets/index-DKSs9nkM.js"
```

### 8. Обновление конфигурации Nginx

Если проблема в MIME типах, обновите конфигурацию Nginx:

```bash
# На сервере
ssh root@93.125.114.252

# Отредактируйте конфигурацию
nano /etc/nginx/sites-available/fluvion.by

# Добавьте или обновите:
location ~* \.js$ {
    add_header Content-Type application/javascript;
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# Проверьте конфигурацию
nginx -t

# Перезагрузите Nginx
systemctl reload nginx
```

## Быстрое решение

Если нужно быстро исправить:

```bash
cd CargoSite/React

# 1. Пересоберите проект
npm run build

# 2. Очистите старые файлы на сервере
ssh root@93.125.114.252 "rm -rf /var/www/fluvion.by/html/*"

# 3. Загрузите новые файлы
scp -r dist/* root@93.125.114.252:/var/www/fluvion.by/html/

# 4. Установите права
ssh root@93.125.114.252 "chown -R www-data:www-data /var/www/fluvion.by/html && chmod -R 755 /var/www/fluvion.by/html"

# 5. Перезагрузите Nginx
ssh root@93.125.114.252 "systemctl reload nginx"
```






