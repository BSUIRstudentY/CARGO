# Установка зависимостей на сервере

## Команды для копирования и выполнения

Подключитесь к серверу и выполните:

```bash
# 1. Перейдите в директорию бота
cd /root/telegram_advertiser

# 2. Обновите pip (опционально, но рекомендуется)
python3 -m pip install --upgrade pip

# 3. Установите зависимости
python3 -m pip install python-telegram-bot==20.7 telethon requests==2.31.0 aiohttp==3.9.1
```

## Или установите из файла requirements.txt

Если файл `requirements.txt` уже на сервере:

```bash
cd /root/telegram_advertiser
python3 -m pip install -r requirements.txt
```

## Проверка установки

После установки проверьте:

```bash
python3 -m pip list | grep -E "telethon|telegram|requests|aiohttp"
```

Должны быть установлены:
- python-telegram-bot
- telethon
- requests
- aiohttp

## Запуск бота

После установки зависимостей запустите бота:

```bash
cd /root/telegram_advertiser
python3 telegram_advertiser.py
```

## Если нужны права sudo

Если возникают проблемы с правами, используйте:

```bash
sudo python3 -m pip install --user python-telegram-bot==20.7 telethon requests==2.31.0 aiohttp==3.9.1
```

Или:

```bash
sudo python3 -m pip install --user -r requirements.txt
```
























