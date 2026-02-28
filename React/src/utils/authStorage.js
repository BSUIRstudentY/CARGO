/**
 * Единое хранилище JWT для веб-приложения.
 * Токен хранится в localStorage: вход сохраняется до истечения срока действия токена.
 * Безопасность: проверка срока (exp) при загрузке в AuthProvider, короткий срок жизни на бэкенде (jwt.expiration).
 */
const TOKEN_KEY = 'token';

// Один раз переносим токен из sessionStorage в localStorage (если пользователь перешёл с прошлой версии)
if (typeof window !== 'undefined') {
  try {
    const fromSession = sessionStorage.getItem(TOKEN_KEY);
    if (fromSession && !localStorage.getItem(TOKEN_KEY)) {
      localStorage.setItem(TOKEN_KEY, fromSession);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch (_) {}
}

export const authStorage = {
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token) {
    try {
      if (token != null) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (_) {}
  },

  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (_) {}
  },
};
