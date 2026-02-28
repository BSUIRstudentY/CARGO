# ✅ Мобильное приложение - Финальная версия

## Что реализовано

### ✅ Структура как в веб-версии

1. **AxiosInstance** - полностью повторяет веб-версию:
   - Кэширование через React Query
   - Автоматическое добавление токенов
   - Обработка ошибок
   - Запросы на `localhost:8080/api` (или IP:8080/api)

2. **GuestLayout** - для неавторизованных пользователей:
   - Доступ к каталогу, новостям, калькулятору
   - Возможность просматривать товары
   - Вход/регистрация

3. **AppLayout** - для авторизованных пользователей:
   - Все функции GuestLayout +
   - Корзина
   - Заказы
   - Профиль
   - Уведомления
   - Самовыкуп
   - Сборные грузы

4. **AdminLayout** - для администраторов:
   - Dashboard
   - Управление пользователями
   - Управление заказами
   - Управление товарами
   - Управление тикетами
   - Управление новостями
   - Управление промокодами
   - Управление квестами
   - Управление батч-карго
   - Каталог
   - Статистика

### ✅ Все экраны из веб-версии

**Guest экраны:**
- Home
- Catalog
- ProductDetail
- Calculator
- News
- Reviews
- DeliveryPayment
- FAQ
- Support
- Rate
- MultiTerminal (Заказать товар)
- Login/Register

**App экраны (авторизованные):**
- Все Guest экраны +
- Cart
- Profile
- Orders
- OrderDetail
- Notifications
- SelfPickup
- BatchCargoList
- BatchCargoDetails
- OrderInstructions

**Admin экраны:**
- AdminDashboard
- AdminUsers
- AdminOrders
- AdminProducts
- AdminTickets
- AdminNews
- AdminPromocodes
- AdminQuests
- AdminBatchCargos
- AdminCatalog
- AdminStats

## Настройка API

API настроен на `localhost:8080/api` или `IP:8080/api` для разработки.

Для изменения IP откройте `src/api/axiosInstance.js` и измените:
```javascript
const BASE_URL = __DEV__ 
  ? 'http://ВАШ_IP:8080/api'  // Замените на ваш IP
  : 'https://fluvion.by/api';
```

## Навигация

- **Guest**: Табы (Home, Catalog, Заказать, Calculator, News)
- **User**: Табы (Home, Catalog, Cart, Profile)
- **Admin**: Drawer меню со всеми админ функциями

## Запуск

```bash
cd Mobile
npx expo start --clear
```

Затем нажмите `a` для Android или `i` для iOS.

## Готово к использованию! 🎉

Все функции веб-версии реализованы в мобильном приложении!




