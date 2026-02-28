# Быстрая инструкция по миграции на сервере

## 🚀 Быстрый старт (3 шага)

### 1. Подключитесь к серверу и остановите приложение
```bash
ssh root@fluvion.vm
systemctl stop fluvion
cd /path/to/your/app  # Перейдите в директорию приложения
```

### 2. Выполните миграцию
```bash
# Скачайте скрипт на сервер (или скопируйте его содержимое)
# Затем выполните:

chmod +x migrate_remove_balance_server.sh
export DB_PATH="./data/cargo.sqlite"  # или путь к вашей БД
./migrate_remove_balance_server.sh
```

### 3. Запустите приложение
```bash
systemctl start fluvion
```

---

## 📋 Что делает скрипт:

1. ✅ **Автоматически создает резервную копию** базы данных
2. ✅ **Проверяет наличие колонок** balance перед удалением
3. ✅ **Удаляет колонки** balance, reserved_balance из users и balance_amount из orders
4. ✅ **Сохраняет все данные** - пересоздает таблицы без колонок balance
5. ✅ **Проверяет результат** - сравнивает количество записей до и после
6. ✅ **Восстанавливает индексы** для оптимальной производительности

---

## ⚠️ Важные моменты:

- **Резервная копия создается автоматически** с временной меткой
- **Все данные сохраняются** - удаляются только колонки balance
- **Приложение должно быть остановлено** во время миграции
- **Время простоя:** обычно 1-2 минуты

---

## 🔍 Проверка после миграции:

```bash
# Проверьте, что колонки удалены
sqlite3 ./data/cargo.sqlite "PRAGMA table_info(users);" | grep balance
# Должно быть пусто

# Проверьте количество записей
sqlite3 ./data/cargo.sqlite "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM orders;"

# Проверьте логи приложения
journalctl -u fluvion -n 50
```

---

## 🔄 Откат (если нужно):

```bash
systemctl stop fluvion
cp ./data/cargo.sqlite.backup.YYYYMMDD_HHMMSS ./data/cargo.sqlite
systemctl start fluvion
```

---

Подробная инструкция: см. `MIGRATION_SERVER_INSTRUCTIONS.md`










