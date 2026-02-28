# Исправление проблем с установкой

## Проблема: ERR_PACKAGE_PATH_NOT_EXPORTED

Эта ошибка возникает из-за несовместимости версий зависимостей.

## Решение

1. **Удалите node_modules и package-lock.json**:
   ```bash
   cd Mobile
   rm -rf node_modules package-lock.json
   ```

2. **Установите зависимости заново**:
   ```bash
   npm install
   ```

3. **Если проблема сохраняется, используйте yarn**:
   ```bash
   npm install -g yarn
   yarn install
   ```

## Использование npx

Все команды теперь используют `npx expo` вместо `expo`, что не требует глобальной установки Expo CLI.

## Запуск приложения

```bash
# Запуск сервера разработки
npm start

# Для iOS (требуется Mac)
npm run ios

# Для Android
npm run android

# Для веб-браузера
npm run web
```

## Альтернативный способ запуска

Если проблемы продолжаются, используйте напрямую:

```bash
npx expo start
```

Затем выберите платформу:
- Нажмите `i` для iOS
- Нажмите `a` для Android
- Нажмите `w` для веб

## Проверка версий

Убедитесь, что у вас установлены правильные версии:

- Node.js: 18.x или выше
- npm: 9.x или выше

Проверьте:
```bash
node --version
npm --version
```

## Если ничего не помогает

1. Обновите Expo CLI:
   ```bash
   npm install -g @expo/cli@latest
   ```

2. Очистите кэш:
   ```bash
   npx expo start --clear
   ```

3. Переустановите зависимости:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```




