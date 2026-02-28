# Развертывание Telegram Advertiser на новом сервере

Полная инструкция по развертыванию рекламного бота `telegram_advertiser.py` на новом сервере.

## 📋 Требования

- Linux сервер (Ubuntu/Debian)
- Python 3.8 или выше
- SSH доступ к серверу
- Telegram API credentials (api_id, api_hash)

## 🚀 Быстрый старт

### Вариант 1: Автоматический деплой (рекомендуется)

Используйте готовый скрипт для развертывания:

```bash
./deploy-telegram-advertiser.sh
```

### Вариант 2: Ручной деплой

Следуйте инструкциям ниже.

## 📦 Шаг 1: Подготовка сервера

### 1.1 Подключение к серверу

```bash
ssh root@ваш-сервер-ip
```

### 1.2 Обновление системы

```bash
apt update && apt upgrade -y
```

### 1.3 Установка Python и необходимых пакетов

```bash
apt install -y python3 python3-pip python3-venv
```

### 1.4 Проверка версии Python

```bash
python3 --version
# Должно быть Python 3.8 или выше
```

## 📁 Шаг 2: Создание структуры директорий

```bash
# Создаем директорию для бота
mkdir -p /root/telegram_advertiser
cd /root/telegram_advertiser
```

## 📤 Шаг 3: Копирование файлов на сервер

### 3.1 С вашего компьютера

```bash
# Копируем основной файл бота
scp telegram_advertiser.py root@ваш-сервер:/root/telegram_advertiser/

# Копируем список чатов
scp fleamarkets_list.txt root@ваш-сервер:/root/telegram_advertiser/

# Копируем зависимости
scp requirements.txt root@ваш-сервер:/root/telegram_advertiser/
```

### 3.2 Или клонируйте репозиторий на сервере

```bash
# Если у вас есть git репозиторий
cd /root
git clone ваш-репозиторий
cd telegram_advertiser
```

## 🐍 Шаг 4: Настройка виртуального окружения

```bash
cd /root/telegram_advertiser

# Создаем виртуальное окружение
python3 -m venv telegram_advertiser_env

# Активируем виртуальное окружение
source telegram_advertiser_env/bin/activate

# Обновляем pip
pip install --upgrade pip

# Устанавливаем зависимости
pip install -r requirements.txt
```

## ⚙️ Шаг 5: Настройка конфигурации

### 5.1 Проверка API credentials

Убедитесь, что в файле `telegram_advertiser.py` указаны правильные:
- `api_id` - ваш Telegram API ID
- `api_hash` - ваш Telegram API Hash

**Важно:** Для безопасности рекомендуется вынести эти данные в переменные окружения или отдельный конфигурационный файл.

### 5.2 Настройка параметров (опционально)

В файле `telegram_advertiser.py` можно изменить:
- `TARGET_CHATS_COUNT` - количество чатов для отправки за раз (по умолчанию 20)
- `SEND_INTERVAL` - интервал между отправками в секундах (по умолчанию 1800 = 30 минут)
- `AD_MESSAGE` - текст рекламного сообщения

### 5.3 Проверка файла со списком чатов

Убедитесь, что файл `fleamarkets_list.txt` существует и содержит список чатов в формате:
```
Название чата: chat_id
```

Пример:
```
Маркетплейс Беларусь Минск: 2388742658
Куплю/Продаю/Отдаю/Меняю/Предлагаю: 2094402328
```

## 🔐 Шаг 6: Первый запуск и авторизация

### 6.1 Запуск бота для авторизации

```bash
cd /root/telegram_advertiser
source telegram_advertiser_env/bin/activate
python telegram_advertiser.py
```

При первом запуске:
1. Бот запросит ваш номер телефона
2. Введите номер телефона (с кодом страны, например: +375291234567)
3. Введите код подтверждения из Telegram
4. Если включена двухфакторная аутентификация, введите пароль

После успешной авторизации будет создан файл `my_session.session`.

### 6.2 Проверка работы

После авторизации бот начнет отправлять сообщения. Проверьте:
- Логи в консоли
- Файл `advertiser_log.txt` (создается автоматически)

Остановите бота: `Ctrl+C`

## 🔄 Шаг 7: Настройка автозапуска (systemd)

### 7.1 Создание systemd сервиса

```bash
nano /etc/systemd/system/telegram-advertiser.service
```

### 7.2 Содержимое файла сервиса

```ini
[Unit]
Description=Telegram Advertiser Bot
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/root/telegram_advertiser
Environment="PATH=/root/telegram_advertiser/telegram_advertiser_env/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/root/telegram_advertiser/telegram_advertiser_env/bin/python /root/telegram_advertiser/telegram_advertiser.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

### 7.3 Активация и запуск сервиса

```bash
# Перезагружаем systemd
systemctl daemon-reload

# Включаем автозапуск
systemctl enable telegram-advertiser

# Запускаем сервис
systemctl start telegram-advertiser

# Проверяем статус
systemctl status telegram-advertiser
```

## 📊 Управление сервисом

### Просмотр логов

```bash
# В реальном времени
journalctl -u telegram-advertiser -f

# Последние 100 строк
journalctl -u telegram-advertiser -n 100

# Логи за сегодня
journalctl -u telegram-advertiser --since today
```

### Управление сервисом

```bash
# Запуск
systemctl start telegram-advertiser

# Остановка
systemctl stop telegram-advertiser

# Перезапуск
systemctl restart telegram-advertiser

# Статус
systemctl status telegram-advertiser

# Отключить автозапуск
systemctl disable telegram-advertiser
```

### Просмотр логов бота

Бот также пишет логи в файл `advertiser_log.txt`:

```bash
tail -f /root/telegram_advertiser/advertiser_log.txt
```

## 🔍 Проверка работы

### 1. Проверка процесса

```bash
ps aux | grep telegram_advertiser
```

### 2. Проверка логов systemd

```bash
journalctl -u telegram-advertiser -n 50
```

Должны быть сообщения типа:
```
Подключение к Telegram...
Подключено! Скрипт запущен.
```

### 3. Проверка файла сессии

```bash
ls -la /root/telegram_advertiser/my_session.session
```

Файл должен существовать после первой авторизации.

### 4. Проверка логов бота

```bash
cat /root/telegram_advertiser/advertiser_log.txt
```

## 🛠️ Troubleshooting

### Проблема: Бот не запускается

**Решение:**
1. Проверьте логи: `journalctl -u telegram-advertiser -n 100`
2. Проверьте, что виртуальное окружение создано
3. Проверьте, что зависимости установлены: `pip list`
4. Проверьте права доступа: `chmod +x telegram_advertiser.py`

### Проблема: Ошибка авторизации

**Решение:**
1. Удалите файл сессии: `rm my_session.session`
2. Запустите бота вручную для повторной авторизации
3. Проверьте правильность api_id и api_hash

### Проблема: Ошибка "FileNotFoundError: fleamarkets_list.txt"

**Решение:**
1. Убедитесь, что файл существует: `ls -la fleamarkets_list.txt`
2. Проверьте путь в коде (должен быть в той же директории)
3. Проверьте права доступа: `chmod 644 fleamarkets_list.txt`

### Проблема: FloodWait ошибки

**Решение:**
Это нормально - Telegram ограничивает частоту отправки сообщений. Бот автоматически обрабатывает эти ошибки и ждет нужное время.

### Проблема: "ChatWriteForbiddenError"

**Решение:**
Бот не имеет прав на отправку сообщений в этот чат. Убедитесь, что:
- Бот добавлен в чат
- У бота есть права на отправку сообщений
- Чат не заблокировал бота

### Проблема: Бот не отправляет сообщения

**Решение:**
1. Проверьте логи: `journalctl -u telegram-advertiser -f`
2. Проверьте файл `fleamarkets_list.txt` - формат должен быть правильным
3. Проверьте, что бот авторизован (файл `my_session.session` существует)
4. Запустите бота вручную для отладки

## 🔄 Обновление бота

### Автоматическое обновление

```bash
# С вашего компьютера
scp telegram_advertiser.py root@ваш-сервер:/root/telegram_advertiser/
scp fleamarkets_list.txt root@ваш-сервер:/root/telegram_advertiser/

# На сервере
systemctl restart telegram-advertiser
```

### Обновление зависимостей

```bash
cd /root/telegram_advertiser
source telegram_advertiser_env/bin/activate
pip install --upgrade -r requirements.txt
systemctl restart telegram-advertiser
```

## 🔒 Безопасность

### Рекомендации:

1. **Не храните api_id и api_hash в коде** - используйте переменные окружения:
   ```python
   import os
   api_id = int(os.getenv('TELEGRAM_API_ID'))
   api_hash = os.getenv('TELEGRAM_API_HASH')
   ```

2. **Защитите файл сессии:**
   ```bash
   chmod 600 my_session.session
   ```

3. **Ограничьте доступ к директории:**
   ```bash
   chmod 700 /root/telegram_advertiser
   ```

4. **Используйте отдельного пользователя** (не root) для запуска бота

## 📝 Структура файлов на сервере

После развертывания структура будет следующей:

```
/root/telegram_advertiser/
├── telegram_advertiser.py      # Основной файл бота
├── fleamarkets_list.txt         # Список чатов
├── requirements.txt              # Зависимости Python
├── my_session.session            # Файл сессии Telegram (создается автоматически)
├── advertiser_log.txt            # Логи бота (создается автоматически)
└── telegram_advertiser_env/     # Виртуальное окружение
    ├── bin/
    ├── lib/
    └── ...
```

## 📞 Полезные команды

```bash
# Быстрая проверка статуса
systemctl status telegram-advertiser

# Просмотр логов в реальном времени
journalctl -u telegram-advertiser -f

# Перезапуск после изменений
systemctl restart telegram-advertiser

# Проверка последних записей в логе бота
tail -20 /root/telegram_advertiser/advertiser_log.txt

# Проверка количества чатов в списке
wc -l /root/telegram_advertiser/fleamarkets_list.txt
```

## ✅ Чеклист развертывания

- [ ] Python 3.8+ установлен
- [ ] Файлы скопированы на сервер
- [ ] Виртуальное окружение создано
- [ ] Зависимости установлены
- [ ] API credentials настроены
- [ ] Файл fleamarkets_list.txt загружен
- [ ] Первая авторизация выполнена (файл my_session.session создан)
- [ ] Systemd сервис создан и запущен
- [ ] Автозапуск включен
- [ ] Логи проверены - бот работает

## 🎯 Итог

После выполнения всех шагов:
- ✅ Бот развернут в `/root/telegram_advertiser/`
- ✅ Виртуальное окружение настроено
- ✅ Systemd сервис создан и запущен
- ✅ Бот автоматически запускается при перезагрузке сервера
- ✅ Бот отправляет рекламные сообщения каждые 30 минут в 20 случайных чатов

---

**Примечание:** Убедитесь, что соблюдаете правила Telegram и не нарушаете политику использования API при массовой рассылке сообщений.
























