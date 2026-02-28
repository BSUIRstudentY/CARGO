# Деплой Telegram бота на сервер

## Быстрый старт

### 1. Деплой бота:

```bash
./deploy-telegram-bot.sh
```

Скрипт автоматически:
- ✅ Копирует `main.py` и `requirements.txt` на сервер в `/root/telegram_bot/`
- ✅ Создает виртуальное окружение на сервере
- ✅ Устанавливает все зависимости
- ✅ Настраивает права доступа

### 2. Создание systemd сервиса (для автозапуска):

```bash
./deploy-telegram-bot-service.sh
```

Скрипт создаст systemd сервис для автозапуска бота.

## Структура на сервере

После деплоя на сервере будет:

```
/root/telegram_bot/
├── main.py                    # Основной файл бота
├── requirements.txt           # Зависимости
└── telegram_bot_env/          # Виртуальное окружение
    ├── bin/
    ├── lib/
    └── ...
```

## Ручной деплой

### 1. Копирование файлов:

```bash
# С вашего компьютера
scp main.py root@ваш-сервер:/root/telegram_bot/
scp requirements.txt root@ваш-сервер:/root/telegram_bot/
```

### 2. Настройка на сервере:

```bash
# На сервере
cd /root/telegram_bot

# Создаем виртуальное окружение
python3 -m venv telegram_bot_env

# Активируем окружение
source telegram_bot_env/bin/activate

# Устанавливаем зависимости
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Проверка BACKEND_URL:

Убедитесь, что в `main.py` правильный `BACKEND_URL`:

```python
BACKEND_URL = "http://localhost:8080/api/telegram"  # Для продакшена
```

Если Spring Boot работает на другом порту или хосте, измените URL.

### 4. Запуск бота:

```bash
# На сервере
cd /root/telegram_bot
source telegram_bot_env/bin/activate
python main.py
```

## Настройка systemd сервиса (вручную)

### 1. Создайте unit файл:

```bash
# На сервере
sudo nano /etc/systemd/system/telegram-bot.service
```

### 2. Содержимое файла:

```ini
[Unit]
Description=Fluvion Telegram Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/telegram_bot
Environment="PATH=/root/telegram_bot/telegram_bot_env/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/root/telegram_bot/telegram_bot_env/bin/python /root/telegram_bot/main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 3. Запустите сервис:

```bash
# На сервере
sudo systemctl daemon-reload
sudo systemctl enable telegram-bot
sudo systemctl start telegram-bot
sudo systemctl status telegram-bot
```

## Управление сервисом

### Просмотр логов:

```bash
# На сервере
sudo journalctl -u telegram-bot -f
```

### Перезапуск:

```bash
# На сервере
sudo systemctl restart telegram-bot
```

### Остановка:

```bash
# На сервере
sudo systemctl stop telegram-bot
```

### Статус:

```bash
# На сервере
sudo systemctl status telegram-bot
```

## Проверка работы

### 1. Проверьте логи:

```bash
# На сервере
sudo journalctl -u telegram-bot -n 50
```

Должно быть:
```
INFO:__main__:Bot started successfully
```

### 2. Проверьте процесс:

```bash
# На сервере
ps aux | grep "python.*main.py"
```

### 3. Проверьте в Telegram:

Откройте бота в Telegram и отправьте команду `/start` - должен ответить.

## Troubleshooting

### Проблема: Бот не запускается

**Решение:**
1. Проверьте логи: `sudo journalctl -u telegram-bot -n 100`
2. Проверьте, что виртуальное окружение создано
3. Проверьте, что зависимости установлены
4. Проверьте BACKEND_URL в main.py

### Проблема: Ошибка подключения к backend

**Решение:**
1. Убедитесь, что Spring Boot запущен
2. Проверьте BACKEND_URL в main.py
3. Проверьте, что порт 8080 доступен

### Проблема: Бот не отвечает

**Решение:**
1. Проверьте BOT_TOKEN в main.py
2. Проверьте логи на ошибки
3. Убедитесь, что бот запущен: `sudo systemctl status telegram-bot`

## Обновление бота

### Автоматическое обновление:

```bash
# Просто запустите скрипт деплоя снова
./deploy-telegram-bot.sh

# Перезапустите сервис
ssh root@ваш-сервер "sudo systemctl restart telegram-bot"
```

### Ручное обновление:

```bash
# 1. Скопируйте новый main.py
scp main.py root@ваш-сервер:/root/telegram_bot/

# 2. Перезапустите сервис
ssh root@ваш-сервер "sudo systemctl restart telegram-bot"
```

## Важные моменты

- ✅ Виртуальное окружение создается автоматически на сервере
- ✅ Зависимости устанавливаются из requirements.txt
- ✅ Systemd сервис обеспечивает автозапуск и автоперезапуск
- ✅ Логи доступны через journalctl
- ⚠️ Проверьте BACKEND_URL перед деплоем

## Итог

После выполнения скриптов:
- ✅ Бот задеплоен в `/root/telegram_bot/`
- ✅ Виртуальное окружение настроено
- ✅ Systemd сервис создан и запущен
- ✅ Бот автоматически запускается при перезагрузке сервера






























