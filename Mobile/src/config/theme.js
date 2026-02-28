/**
 * Unified theme configuration for the mobile application.
 * Matches the web version's color palette and design system.
 */

export const theme = {
  colors: {
    // Primary colors
    primary: {
      main: '#e81e2d',
      light: '#ff4757',
      dark: '#c1121f',
      hover: '#d91a2a',
    },
    secondary: {
      main: '#407CFF',
      light: '#5a8fff',
      dark: '#2e5fcc',
      hover: '#4d7fff',
    },
    accent: {
      main: '#FF5722',
      light: '#ff7043',
      dark: '#e64a19',
    },
    // Background colors (ТОЧНО как в веб-версии)
    background: {
      primary: '#0a0d14', // Основной фон веб-версии
      secondary: 'rgba(255,255,255,0.02)', // Для карточек
      tertiary: '#1a1a1a',
      card: 'rgba(255,255,255,0.02)',
      hover: 'rgba(255,255,255,0.04)',
    },
    // Text colors (ТОЧНО как в веб-версии)
    text: {
      primary: '#e5e7eb', // Основной текст веб-версии
      secondary: '#9ca3af', // Вторичный текст веб-версии
      muted: '#808080',
      disabled: '#555555',
    },
    // Border colors (ТОЧНО как в веб-версии)
    border: {
      primary: 'rgba(255,255,255,0.1)', // Основная граница веб-версии
      secondary: 'rgba(255,255,255,0.2)',
      hover: 'rgba(0,240,255,0.5)', // Cyan при hover
    },
    // Status colors
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    // Additional accent colors (ТОЧНО как в веб-версии)
    cyan: '#00f0ff', // Основной акцент веб-версии
    purple: '#a78bfa',
    green: '#10b981',
    // Градиент для заголовков
    gradient: {
      from: '#00f0ff',
      via: '#a78bfa',
      to: '#10b981',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 8,
    },
  },
};

export default theme;

