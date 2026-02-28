# Безопасность JWT в проекте

## Что сделано

### Mobile (React Native / Expo)
- **Токен** хранится в **expo-secure-store**: на iOS — в Keychain, на Android — в Keystore (шифрование средствами ОС). На web-сборке используется AsyncStorage.
- Модуль `Mobile/src/utils/authStorage.js` единообразно читает/пишет токен; `AuthContext` и `api/axiosInstance` используют только его.
- Установите зависимость: `cd Mobile && npm install` (в `package.json` добавлен `expo-secure-store`).

### React (веб) — httpOnly-кука
- **JWT не хранится в JavaScript**: бэкенд при логине/регистрации устанавливает куку `auth_token` с флагами **HttpOnly**, **SameSite=Lax**, **Secure** (на HTTPS). Скрипты не имеют доступа к токену — защита от XSS.
- Все запросы к API идут с `withCredentials: true`, кука отправляется браузером автоматически.
- Состояние «залогинен» восстанавливается при загрузке через запрос `GET /api/users/me`; при 401 фронт считает пользователя неавторизованным.
- Мобильное приложение по-прежнему использует заголовок `Authorization: Bearer ...` (токен в теле ответа при логине).

## Рекомендации на будущее (бэкенд)

1. **Короткий срок жизни access-токена** — в `application.yml` задать `jwt.expiration` в диапазоне 15–30 минут.
2. **Refresh token** — выдать долгоживущий refresh-токен в httpOnly cookie при логине; отдельный endpoint `/auth/refresh` по этому cookie возвращает новый access-токен. Тогда access-токен можно не хранить в sessionStorage, а держать только в памяти (и при перезагрузке страницы получать новый через refresh).
3. **CSP (Content-Security-Policy)** — ограничить источники скриптов, чтобы снизить риск XSS и кражи токена из sessionStorage.
