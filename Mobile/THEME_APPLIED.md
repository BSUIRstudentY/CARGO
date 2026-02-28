# ✅ Дизайн применён

## 🎨 Цветовая палитра (как в веб-версии)

### Основные цвета
- **Фон основной**: `#0a0a0a` (темный черный)
- **Фон вторичный**: `#1a1a1a` (темно-серый)
- **Фон карточек**: `#1f1f1f`
- **Акцент основной**: `#e81e2d` (красный)
- **Акцент вторичный**: `#407CFF` (синий)
- **Текст основной**: `#ffffff` (белый)
- **Текст вторичный**: `#cdcdcd` (светло-серый)
- **Текст приглушенный**: `#808080` (серый)

### Дополнительные акценты
- **Cyan**: `#00f0ff`
- **Purple**: `#a78bfa`
- **Green**: `#10b981`

## 📁 Структура темы

### Файлы
- `src/config/theme.js` - основная конфигурация темы
- `src/components/ui/Button.js` - кнопка с темизацией
- `src/components/ui/Card.js` - карточка с темизацией
- `src/components/ui/Input.js` - поле ввода с темизацией
- `src/utils/applyTheme.js` - утилиты для применения темы

## ✅ Обновлённые экраны

### Основные экраны
- ✅ `HomeScreen.js` - главный экран
- ✅ `CatalogScreen.js` - каталог товаров
- ✅ `CartScreen.js` - корзина
- ✅ `ProfileScreen.js` - профиль

### Экраны авторизации
- ✅ `LoginScreen.js` - вход
- ✅ `RegisterScreen.js` - регистрация

### Навигация
- ✅ `AppNavigator.js` - навигация (Tab и Drawer)

## 🔧 Как применить тему к остальным экранам

### Шаг 1: Импортируйте тему
```javascript
import { theme } from '../config/theme';
```

### Шаг 2: Замените цвета в стилях

**Было:**
```javascript
backgroundColor: '#fff',
color: '#1f2937',
borderColor: '#e5e7eb',
```

**Стало:**
```javascript
backgroundColor: theme.colors.background.card,
color: theme.colors.text.primary,
borderColor: theme.colors.border.primary,
```

### Шаг 3: Используйте spacing и typography

**Было:**
```javascript
padding: 16,
fontSize: 16,
```

**Стало:**
```javascript
padding: theme.spacing.md,
fontSize: theme.typography.fontSize.base,
```

### Шаг 4: Используйте готовые компоненты

Вместо создания своих кнопок/карточек, используйте:
```javascript
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
```

## 📝 Пример обновления экрана

```javascript
import { theme } from '../config/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.md,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
});
```

## 🎯 Основные паттерны

### Фоны
- `theme.colors.background.primary` - основной фон
- `theme.colors.background.secondary` - вторичный фон
- `theme.colors.background.card` - фон карточек

### Текст
- `theme.colors.text.primary` - основной текст
- `theme.colors.text.secondary` - вторичный текст
- `theme.colors.text.muted` - приглушенный текст

### Акценты
- `theme.colors.primary.main` - основной акцент (красный)
- `theme.colors.secondary.main` - вторичный акцент (синий)

### Отступы
- `theme.spacing.xs` - 4px
- `theme.spacing.sm` - 8px
- `theme.spacing.md` - 16px
- `theme.spacing.lg` - 24px
- `theme.spacing.xl` - 32px

### Тени
- `theme.shadows.sm` - маленькая тень
- `theme.shadows.md` - средняя тень
- `theme.shadows.lg` - большая тень

## ✨ Результат

Теперь мобильное приложение имеет **идентичный дизайн** веб-версии:
- ✅ Темная тема
- ✅ Красные акценты (#e81e2d)
- ✅ Синие акценты (#407CFF)
- ✅ Единая типографика
- ✅ Единые отступы и радиусы скругления
- ✅ Единые тени и эффекты

Все основные экраны обновлены и готовы к использованию!




