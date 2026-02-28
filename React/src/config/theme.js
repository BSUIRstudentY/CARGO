/**
 * Unified theme configuration for the e-commerce application.
 * Ensures consistent styling across all components.
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
    // Background colors
    background: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      tertiary: '#2F2F2F',
      card: '#1f1f1f',
      hover: '#2a2a2a',
    },
    // Text colors
    text: {
      primary: '#ffffff',
      secondary: '#cdcdcd',
      muted: '#808080',
      disabled: '#555555',
    },
    // Border colors
    border: {
      primary: '#333333',
      secondary: '#404040',
      hover: '#555555',
    },
    // Status colors
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Common component styles for consistency
 */
export const componentStyles = {
  button: {
    base: 'px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-[#e81e2d] text-white hover:bg-[#d91a2a] focus:ring-[#e81e2d]',
    secondary: 'bg-[#407CFF] text-white hover:bg-[#4d7fff] focus:ring-[#407CFF]',
    outline: 'border-2 border-[#333333] text-white hover:bg-[#2a2a2a] hover:border-[#555555]',
    ghost: 'text-white hover:bg-[#2a2a2a]',
  },
  input: {
    base: 'w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white placeholder-[#808080] focus:outline-none focus:ring-2 focus:ring-[#407CFF] focus:border-transparent transition-all',
  },
  card: {
    base: 'bg-[#1f1f1f] rounded-lg border border-[#333333] p-6 shadow-lg',
    hover: 'hover:border-[#555555] transition-all duration-300',
  },
};

export default theme;












