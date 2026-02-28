# Исправление ошибки: ModuleNotFoundError: No module named 'telegram'

## Проблема

Systemd сервис не может найти модуль `telegram`, потому что использует системный Python вместо Python из виртуального окружения.

## Решение

### Вариант 1: Автоматическое исправление (рекомендуется)

```bash
# 1. Исправьте виртуальное окружение и зависимости
./fix-telegram-bot.sh

# 2. Обновите systemd сервис
./deploy-telegram-bot-service.sh
```

### Вариант 2: Ручное исправление на сервере

```bash
# На сервере
cd /root/telegram_bot

# 1. Убедитесь, что виртуальное окружение существует
if [ ! -d "telegram_bot_env" ]; then
    python3 -m venv telegram_bot_env
fi

# 2. Активируйте виртуальное окружение
source telegram_bot_env/bin/activate

# 3. Установите зависимости
pip install --upgrade pip
pip install -r requirements.txt

# 4. Проверьте установку
python3 -c "import telegram; print('OK')"

# 5. Проверьте путь к Python
which python3
# Должен показать: /root/telegram_bot/telegram_bot_env/bin/python3
```

### Вариант 3: Исправление systemd unit файла

```bash
# На сервере
sudo nano /etc/systemd/system/telegram-bot.service
```

Убедитесь, что в файле правильный путь к Python:

```ini
[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/telegram_bot
# КРИТИЧНО: Используем полный путь к Python из виртуального окружения
ExecStart=/root/telegram_bot/telegram_bot_env/bin/python3 /root/telegram_bot/main.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PATH=/root/telegram_bot/telegram_bot_env/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```

После изменения:

```bash
# На сервере
sudo systemctl daemon-reload
sudo systemctl restart telegram-bot
sudo systemctl status telegram-bot
```

## Проверка

### 1. Проверьте, что виртуальное окружение работает:

```bash
# На сервере
cd /root/telegram_bot
source telegram_bot_env/bin/activate
python3 -c "import telegram; print('✅ Модуль telegram установлен')"
```

### 2. Проверьте логи:

```bash
# На сервере
sudo journalctl -u telegram-bot -n 50
```

Должно быть:
```
INFO:__main__:Bot started successfully
```

И НЕ должно быть:
```
ModuleNotFoundError: No module named 'telegram'
```

### 3. Проверьте процесс:

```bash
# На сервере
ps aux | grep "python.*main.py"
```

Должен показать процесс с путем к Python из виртуального окружения.

## Частые проблемы

### Проблема: Python не найден в виртуальном окружении

**Решение:**
```bash
# На сервере
cd /root/telegram_bot
rm -rf telegram_bot_env
python3 -m venv telegram_bot_env
source telegram_bot_env/bin/activate
pip install -r requirements.txt
```

### Проблема: Неправильный путь в systemd

**Решение:**
Проверьте путь к Python:
```bash
# На сервере
ls -la /root/telegram_bot/telegram_bot_env/bin/python3
```

И используйте этот путь в systemd unit файле.

### Проблема: Зависимости не установлены

**Решение:**
```bash
# На сервере
cd /root/telegram_bot
source telegram_bot_env/bin/activate
pip install --upgrade pip
pip install python-telegram-bot==20.7 requests==2.31.0 aiohttp==3.9.1
```

## Итог

После исправления:
- ✅ Виртуальное окружение настроено правильно
- ✅ Зависимости установлены
- ✅ Systemd использует правильный путь к Python
- ✅ Бот запускается без ошибок






























