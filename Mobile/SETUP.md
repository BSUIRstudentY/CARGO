# Инструкция по настройке мобильного приложения

## Предварительные требования

1. **Node.js** версии 18 или выше
2. **npm** или **yarn**
3. **Expo CLI** (установите глобально):
   ```bash
   npm install -g expo-cli
   ```

## Установка

1. Перейдите в директорию Mobile:
   ```bash
   cd Mobile
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

## Настройка API

1. Откройте файл `src/api/axiosInstance.js`

2. Измените `BASE_URL` в зависимости от вашего окружения:
   ```javascript
   const BASE_URL = __DEV__ 
     ? 'http://YOUR_LOCAL_IP:8080/api'  // Для разработки (замените YOUR_LOCAL_IP на ваш IP)
     : 'https://fluvion.by/api';         // Для продакшена
   ```

   **Важно**: Для разработки на физическом устройстве используйте IP-адрес вашего компьютера в локальной сети, а не `localhost`.

## Настройка CORS в Spring Boot

Для работы мобильного приложения необходимо настроить CORS в Spring Boot:

1. Откройте файл `Spring Boot/src/main/resources/application.yml`

2. Добавьте или обновите настройки CORS:
   ```yaml
   app:
     cors:
       allowed-origins: http://localhost:5173,https://fluvion.by,exp://192.168.1.XXX:8081
   ```

   Где `192.168.1.XXX` - IP адрес вашего компьютера в локальной сети.

3. Или обновите `SecurityConfiguration.java` для поддержки всех Expo URL:
   ```java
   configuration.setAllowedOriginPatterns(Arrays.asList(
       "http://localhost:*",
       "https://*.fluvion.by",
       "exp://*"
   ));
   ```

## Запуск приложения

### Для iOS (требуется Mac)

1. Установите Xcode из App Store
2. Установите CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```
3. Запустите приложение:
   ```bash
   npm run ios
   ```

### Для Android

1. Установите Android Studio
2. Настройте Android SDK
3. Запустите эмулятор Android или подключите физическое устройство
4. Запустите приложение:
   ```bash
   npm run android
   ```

### Для веб-браузера (для тестирования)

```bash
npm run web
```

## Разработка на физическом устройстве

1. Установите приложение **Expo Go** на ваш телефон:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Запустите сервер разработки:
   ```bash
   npm start
   ```

3. Отсканируйте QR-код, который появится в терминале, с помощью:
   - iOS: Камера приложения
   - Android: Приложение Expo Go

## Сборка для продакшена

### iOS

1. Создайте аккаунт в Expo
2. Настройте Apple Developer аккаунт
3. Соберите приложение:
   ```bash
   expo build:ios
   ```

### Android

1. Создайте аккаунт в Expo
2. Настройте Google Play Console
3. Соберите приложение:
   ```bash
   expo build:android
   ```

## Структура проекта

```
Mobile/
├── App.js                    # Точка входа
├── app.json                  # Конфигурация Expo
├── package.json              # Зависимости
├── src/
│   ├── api/                  # API клиент
│   ├── context/              # React Context
│   ├── navigation/           # Навигация
│   └── screens/              # Экраны приложения
└── assets/                   # Изображения и ресурсы
```

## Решение проблем

### Проблема: Не могу подключиться к API

**Решение**:
1. Убедитесь, что Spring Boot сервер запущен
2. Проверьте, что IP-адрес в `axiosInstance.js` правильный
3. Убедитесь, что устройство и компьютер в одной сети
4. Проверьте настройки CORS в Spring Boot

### Проблема: Ошибка при установке зависимостей

**Решение**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Проблема: Приложение не запускается на iOS

**Решение**:
1. Убедитесь, что Xcode установлен
2. Установите CocoaPods:
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Дополнительные ресурсы

- [Документация Expo](https://docs.expo.dev/)
- [Документация React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)




