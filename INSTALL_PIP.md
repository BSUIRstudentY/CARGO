# Установка pip на сервере

## Проблема: "No module named pip"

Если вы видите ошибку `/usr/bin/python3: No module named pip`, нужно установить pip.

## Решение

### Вариант 1: Установка через apt (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3-pip
```

### Вариант 2: Установка через get-pip.py

```bash
# Скачайте скрипт установки
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Установите pip
python3 get-pip.py

# Удалите временный файл
rm get-pip.py
```

### Вариант 3: Установка python3-pip и python3-venv вместе

```bash
sudo apt update
sudo apt install python3-pip python3-venv
```

## Проверка установки

После установки проверьте:

```bash
python3 -m pip --version
```

Должно показать версию pip, например: `pip 24.0 from ...`

## После установки pip

Теперь можно установить зависимости бота:

```bash
cd /root/telegram_advertiser
python3 -m pip install --upgrade pip
python3 -m pip install python-telegram-bot==20.7 telethon requests==2.31.0 aiohttp==3.9.1
```

Или из файла:

```bash
cd /root/telegram_advertiser
python3 -m pip install -r requirements.txt
```
























