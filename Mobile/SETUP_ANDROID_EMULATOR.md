# Настройка Android эмулятора - Пошаговая инструкция

## Шаг 1: Найти путь к Android SDK

Android SDK обычно устанавливается в одно из этих мест:
- `~/Android/Sdk` (стандартное место)
- `~/.android/sdk`
- `~/Library/Android/sdk` (на Mac)
- Или в папке, которую вы указали при установке Android Studio

## Шаг 2: Настроить переменные окружения

Откройте файл `~/.bashrc` (или `~/.zshrc` если используете zsh):

```bash
nano ~/.bashrc
```

Добавьте в конец файла (замените путь на ваш реальный путь к SDK):

```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Сохраните файл (Ctrl+O, Enter, Ctrl+X) и выполните:

```bash
source ~/.bashrc
```

## Шаг 3: Проверить установку

```bash
echo $ANDROID_HOME
adb version
```

Если команды работают - SDK настроен правильно!

## Шаг 4: Создать эмулятор в Android Studio

1. **Откройте Android Studio**

2. **Откройте Device Manager**:
   - Нажмите на иконку "Device Manager" в правом верхнем углу
   - Или: Tools → Device Manager

3. **Создайте устройство**:
   - Нажмите "Create Device"
   - Выберите устройство (например, Pixel 5)
   - Нажмите "Next"

4. **Выберите системный образ**:
   - Выберите образ (рекомендуется последняя версия, например API 33 или 34)
   - Если образа нет - нажмите "Download" рядом с ним
   - Нажмите "Next"

5. **Завершите создание**:
   - Проверьте настройки
   - Нажмите "Finish"

## Шаг 5: Запустить эмулятор

### Вариант A: Из Android Studio
- В Device Manager нажмите ▶️ (Play) рядом с созданным устройством

### Вариант B: Из командной строки
```bash
# Список доступных эмуляторов
emulator -list-avds

# Запуск эмулятора (замените имя на ваше)
emulator -avd Pixel_5_API_33 &
```

## Шаг 6: Запустить приложение

После того как эмулятор запустился:

```bash
cd Mobile
npm run android
```

Или если сервер уже запущен:
- Нажмите `a` в терминале где запущен `npm start`

## Проверка подключения

Убедитесь, что эмулятор виден:

```bash
adb devices
```

Должна появиться строка с устройством, например:
```
List of devices attached
emulator-5554   device
```

## Решение проблем

### Проблема: "ANDROID_HOME not set"

Проверьте, что вы:
1. Добавили переменные в `~/.bashrc`
2. Выполнили `source ~/.bashrc`
3. Перезапустили терминал

### Проблема: "adb: command not found"

Убедитесь, что `platform-tools` установлены:
- Откройте Android Studio
- Tools → SDK Manager
- SDK Tools → установите "Android SDK Platform-Tools"

### Проблема: Эмулятор не запускается

1. Убедитесь, что включена виртуализация в BIOS
2. Проверьте, что установлены HAXM или KVM
3. Попробуйте запустить эмулятор из Android Studio

### Проблема: "emulator: command not found"

Добавьте путь к эмулятору в PATH (см. Шаг 2)

## Быстрая проверка

Выполните все команды по порядку:

```bash
# 1. Проверить ANDROID_HOME
echo $ANDROID_HOME

# 2. Проверить adb
adb version

# 3. Проверить эмуляторы
emulator -list-avds

# 4. Проверить подключенные устройства
adb devices
```

Если все команды работают - можно запускать приложение!




