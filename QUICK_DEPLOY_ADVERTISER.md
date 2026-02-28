# 🚀 Быстрое развертывание Telegram Advertiser

Краткая инструкция по развертыванию рекламного бота на новом сервере.

## 📋 Что нужно перед началом

1. **IP адрес сервера** и SSH доступ
2. **Telegram API credentials** (api_id, api_hash) - уже есть в коде
3. **Файл со списком чатов** (`fleamarkets_list.txt`)

## ⚡ Быстрый деплой (3 шага)

### Шаг 0: Настройка SSH (если нужно)

**Если у вас нет SSH ключа**, скрипт будет запрашивать пароль при каждом подключении.

**Для автоматической передачи пароля:**
```bash
# Установите sshpass
sudo apt install sshpass

# Установите пароль (будет использоваться автоматически)
export SSHPASS='ваш-пароль-для-root'
```

**Или настройте SSH ключи (рекомендуется):**
```bash
ssh-copy-id root@ваш-сервер-ip
```

Подробнее: см. `SSH_SETUP.md`

### Шаг 1: Настройка скрипта

Откройте файл `deploy-telegram-advertiser.sh` и измените:
```bash
SERVER_HOST="ваш-сервер-ip"  # Укажите IP вашего сервера
```

### Шаг 2: Запуск деплоя

```bash
./deploy-telegram-advertiser.sh
```

Скрипт автоматически:
- ✅ Скопирует файлы на сервер
- ✅ Создаст виртуальное окружение
- ✅ Установит зависимости

### Шаг 3: Авторизация и запуск

```bash
# Подключитесь к серверу
ssh root@ваш-сервер-ip

# Перейдите в директорию бота
cd /root/telegram_advertiser

# Активируйте окружение и запустите бота
source telegram_advertiser_env/bin/activate
python telegram_advertiser.py
```

**При первом запуске:**
1. Введите номер телефона (например: `+375291234567`)
2. Введите код подтверждения из Telegram
3. Если есть 2FA - введите пароль

После авторизации остановите бота (`Ctrl+C`).

### Шаг 4: Автозапуск (опционально)

Настройте скрипт `deploy-telegram-advertiser-service.sh` (укажите IP сервера) и запустите:

```bash
./deploy-telegram-advertiser-service.sh
```

Готово! Бот будет работать автоматически.

## 🔍 Проверка работы

```bash
# На сервере
systemctl status telegram-advertiser
journalctl -u telegram-advertiser -f
```

## 📝 Ручной деплой (если скрипты не работают)

### 1. Копирование файлов

```bash
scp telegram_advertiser.py root@сервер:/root/telegram_advertiser/
scp fleamarkets_list.txt root@сервер:/root/telegram_advertiser/
scp requirements.txt root@сервер:/root/telegram_advertiser/
```

### 2. Настройка на сервере

```bash
ssh root@сервер
cd /root/telegram_advertiser
python3 -m venv telegram_advertiser_env
source telegram_advertiser_env/bin/activate
pip install -r requirements.txt
python telegram_advertiser.py
```

### 3. Systemd сервис (вручную)

```bash
nano /etc/systemd/system/telegram-advertiser.service
```

Вставьте:
```ini
[Unit]
Description=Telegram Advertiser Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/telegram_advertiser
ExecStart=/root/telegram_advertiser/telegram_advertiser_env/bin/python /root/telegram_advertiser/telegram_advertiser.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Запуск:
```bash
systemctl daemon-reload
systemctl enable telegram-advertiser
systemctl start telegram-advertiser
```

## ❓ Частые проблемы

**Бот не запускается:**
- Проверьте логи: `journalctl -u telegram-advertiser -n 100`
- Убедитесь, что файл `my_session.session` существует (нужна авторизация)

**Ошибка авторизации:**
- Удалите `my_session.session` и запустите бота снова
- Проверьте правильность api_id и api_hash

**Нет файла fleamarkets_list.txt:**
- Создайте файл со списком чатов в формате: `Название: chat_id`

## 📖 Подробная инструкция

См. файл `DEPLOY_TELEGRAM_ADVERTISER.md` для полной документации.

