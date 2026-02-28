# Fluvion Mobile App

Мобильное приложение для платформы доставки товаров из Китая Fluvion.

## Технологии

- **React Native** с Expo
- **React Navigation** для навигации
- **React Query** для управления состоянием и кэширования
- **Axios** для HTTP запросов
- **AsyncStorage** для локального хранения данных

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Для iOS:
```bash
npm run ios
```

3. Для Android:
```bash
npm run android
```

## Структура проекта

```
Mobile/
├── App.js                 # Главный компонент приложения
├── app.json               # Конфигурация Expo
├── package.json           # Зависимости
├── src/
│   ├── api/              # API клиент
│   │   └── axiosInstance.js
│   ├── context/          # React Context провайдеры
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── navigation/       # Навигация
│   │   └── AppNavigator.js
│   └── screens/         # Экраны приложения
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── HomeScreen.js
│       ├── CatalogScreen.js
│       ├── CartScreen.js
│       ├── ProductDetailScreen.js
│       ├── ProfileScreen.js
│       ├── OrdersScreen.js
│       ├── OrderDetailScreen.js
│       ├── CalculatorScreen.js
│       ├── NewsScreen.js
│       ├── SupportScreen.js
│       └── NotificationsScreen.js
```

## Основные функции

- ✅ Аутентификация (вход/регистрация)
- ✅ Каталог товаров с поиском и фильтрацией
- ✅ Корзина покупок
- ✅ Детали товара
- ✅ История заказов
- ✅ Калькулятор стоимости доставки
- ✅ Новости
- ✅ Поддержка (тикеты)
- ✅ Уведомления

## Настройка API

По умолчанию приложение использует:
- **Development**: `http://localhost:8080/api`
- **Production**: `https://fluvion.by/api`

Измените `BASE_URL` в `src/api/axiosInstance.js` для настройки под ваше окружение.

## Адаптивность

Приложение адаптировано для:
- ✅ iOS (iPhone и iPad)
- ✅ Android (телефоны и планшеты)

## Сборка для продакшена

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Требования

- Node.js 18+
- Expo CLI
- Для iOS: Xcode и CocoaPods
- Для Android: Android Studio и Android SDK

## Лицензия

Proprietary - Fluvion




