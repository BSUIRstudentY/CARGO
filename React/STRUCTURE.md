# Структура React приложения

## Обновленная структура файлов

### Компоненты UI (`src/components/ui/`)
Переиспользуемые UI компоненты с единым дизайном:

- **Button.jsx** - Универсальная кнопка с вариантами (primary, secondary, outline, ghost)
- **Card.jsx** - Карточка с эффектами hover и glow
- **ProductCard.jsx** - Специализированная карточка товара для каталога

### Страницы (`src/pages/`)
Основные страницы приложения:

- **Home.jsx** - Главная страница с hero-секцией и преимуществами
- **Catalog.jsx** - Каталог товаров с фильтрами и поиском
- **Header.jsx** - Навигационный header с мобильным меню
- **CartPage.jsx** - Страница корзины
- **Profile.jsx** - Профиль пользователя
- И другие страницы...

### Утилиты (`src/utils/`)
- **performance.js** - Утилиты для оптимизации (memoize, throttle, debounce)

### Хуки (`src/hooks/`)
- **useOptimizedCallback.js** - Оптимизированные колбэки

### Конфигурация (`src/config/`)
- **theme.js** - Единая тема приложения

### Стили (`src/styles/`)
- **animations.css** - CSS анимации
- **index.css** - Глобальные стили

## Принципы организации

1. **Модульность** - Каждый компонент в отдельном файле
2. **Переиспользование** - UI компоненты в `components/ui/`
3. **Оптимизация** - Использование memo, useCallback, useMemo
4. **Единый дизайн** - Все компоненты используют общую тему
5. **Адаптивность** - Поддержка мобильных и десктопных версий

## Использование компонентов

```jsx
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProductCard } from '../components/ui/ProductCard';

// Использование
<Button variant="primary" size="lg" onClick={handleClick}>
  Кнопка
</Button>

<Card hover glow>
  Контент карточки
</Card>

<ProductCard 
  product={product}
  onAddToCart={handleAddToCart}
  onViewDetails={handleViewDetails}
/>
```












