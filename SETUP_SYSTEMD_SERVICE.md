# Настройка systemd сервиса для Telegram Advertiser

## Вариант 1: С виртуальным окружением (рекомендуется)

### Создайте файл сервиса:

```bash
sudo nano /etc/systemd/system/telegram-advertiser.service
```

### Вставьте следующее содержимое:

```ini
[Unit]
Description=Telegram Advertiser Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/telegram_advertiser
ExecStart=/root/telegram_advertiser/telegram_advertiser_env/bin/python3 /root/telegram_advertiser/telegram_advertiser.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PATH=/root/telegram_advertiser/telegram_advertiser_env/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
```

## Вариант 2: Без виртуального окружения

### Создайте файл сервиса:

```bash
sudo nano /etc/systemd/system/telegram-advertiser.service
```

### Вставьте следующее содержимое:

```ini
[Unit]
Description=Telegram Advertiser Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/telegram_advertiser
ExecStart=/usr/bin/python3 /root/telegram_advertiser/telegram_advertiser.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

[Install]
WantedBy=multi-user.target
```

## Активация сервиса

После создания файла выполните:

```bash
# Перезагрузите systemd
sudo systemctl daemon-reload

# Включите автозапуск
sudo systemctl enable telegram-advertiser

# Запустите сервис
sudo systemctl start telegram-advertiser

# Проверьте статус
sudo systemctl status telegram-advertiser
```

## Управление сервисом

```bash
# Запуск
sudo systemctl start telegram-advertiser

# Остановка
sudo systemctl stop telegram-advertiser

# Перезапуск
sudo systemctl restart telegram-advertiser

# Статус
sudo systemctl status telegram-advertiser

# Просмотр логов
sudo journalctl -u telegram-advertiser -f

# Последние 100 строк логов
sudo journalctl -u telegram-advertiser -n 100
```

## Быстрая установка

Если файл `telegram-advertiser.service` уже есть в проекте:

```bash
# Скопируйте файл
sudo cp telegram-advertiser.service /etc/systemd/system/

# Активируйте сервис
sudo systemctl daemon-reload
sudo systemctl enable telegram-advertiser
sudo systemctl start telegram-advertiser
```

## Проверка работы

```bash
# Проверьте, что сервис запущен
sudo systemctl status telegram-advertiser

# Должно быть: Active: active (running)

# Проверьте логи
sudo journalctl -u telegram-advertiser -f
```

## Troubleshooting

### Сервис не запускается

1. Проверьте логи: `sudo journalctl -u telegram-advertiser -n 50`
2. Убедитесь, что путь к Python правильный
3. Проверьте права доступа к файлам
4. Убедитесь, что файл `my_session.session` существует

### Ошибка "ModuleNotFoundError"

Убедитесь, что зависимости установлены в правильном окружении:
- Если используете venv: `source telegram_advertiser_env/bin/activate && pip list`
- Если не используете venv: `python3 -m pip list`
























