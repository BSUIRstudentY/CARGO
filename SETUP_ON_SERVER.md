# Настройка бота на сервере (Ubuntu 24.04)

## Проблема: externally-managed-environment

Ubuntu 24.04 защищает системный Python от установки пакетов напрямую. Нужно использовать виртуальное окружение.

## Решение: Создание виртуального окружения

### Шаг 1: Установите python3-venv (если еще не установлен)

```bash
sudo apt update
sudo apt install python3-venv python3-pip
```

### Шаг 2: Создайте виртуальное окружение

```bash
cd /root/telegram_advertiser
python3 -m venv telegram_advertiser_env
```

### Шаг 3: Активируйте виртуальное окружение

```bash
source telegram_advertiser_env/bin/activate
```

После активации в начале строки появится `(telegram_advertiser_env)`.

### Шаг 4: Установите зависимости

```bash
pip install --upgrade pip
pip install python-telegram-bot==20.7 telethon requests==2.31.0 aiohttp==3.9.1
```

Или из файла:

```bash
pip install -r requirements.txt
```

### Шаг 5: Запустите бота

```bash
python telegram_advertiser.py
```

## Альтернатива: Установка с флагом --break-system-packages (не рекомендуется)

Если по какой-то причине не хотите использовать venv:

```bash
python3 -m pip install --break-system-packages python-telegram-bot==20.7 telethon requests==2.31.0 aiohttp==3.9.1
```

⚠️ **Внимание:** Это может нарушить системные пакеты Python. Используйте только если понимаете риски.

## Альтернатива: Установка в домашнюю директорию (--user)

```bash
python3 -m pip install --user python-telegram-bot==20.7 telethon requests==2.31.0 aiohttp==3.9.1
```

Затем запускайте:

```bash
python3 telegram_advertiser.py
```

## Для systemd сервиса

Если используете виртуальное окружение, в systemd сервисе используйте:

```ini
ExecStart=/root/telegram_advertiser/telegram_advertiser_env/bin/python /root/telegram_advertiser/telegram_advertiser.py
```

Если используете --user установку:

```ini
ExecStart=/usr/bin/python3 /root/telegram_advertiser/telegram_advertiser.py
Environment="PATH=/root/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
```
























