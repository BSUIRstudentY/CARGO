# Настройка Android для разработки

## Проблема: Android SDK не найден

Если вы видите ошибку:
```
Failed to resolve the Android SDK path
Error: spawn adb ENOENT
```

Это означает, что Android SDK не установлен или не настроен.

## Решение 1: Запуск без Android (Рекомендуется для начала)

Вы можете запустить сервер разработки без Android:

```bash
npm start
# или
npx expo start
```

Затем:
- Откройте приложение **Expo Go** на вашем телефоне
- Отсканируйте QR-код, который появится в терминале
- Приложение запустится на вашем телефоне

## Решение 2: Установка Android SDK (для эмулятора)

Если вы хотите запускать приложение в эмуляторе Android:

### Шаг 1: Установите Android Studio

1. Скачайте Android Studio: https://developer.android.com/studio
2. Установите Android Studio
3. Откройте Android Studio и установите Android SDK через SDK Manager

### Шаг 2: Настройте переменные окружения

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Затем выполните:
```bash
source ~/.bashrc  # или source ~/.zshrc
```

### Шаг 3: Создайте эмулятор

1. Откройте Android Studio
2. Tools → Device Manager
3. Create Device
4. Выберите устройство и нажмите Next
5. Выберите системный образ и нажмите Next
6. Нажмите Finish

### Шаг 4: Запустите приложение

```bash
npm run android
```

## Альтернатива: Использование Expo Go на физическом устройстве

Это самый простой способ для начала разработки:

1. Установите **Expo Go** на ваш телефон:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Запустите сервер разработки:
   ```bash
   npm start
   ```

3. Отсканируйте QR-код:
   - iOS: Используйте камеру приложения
   - Android: Используйте приложение Expo Go

## Проверка установки Android SDK

Проверьте, установлен ли Android SDK:

```bash
echo $ANDROID_HOME
which adb
```

Если команды не возвращают путь, Android SDK не настроен.




