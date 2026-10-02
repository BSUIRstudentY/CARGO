/**
 * Unified theme configuration for the e-commerce application.
 * Ensures consistent styling across all components.
 */

export const theme = {
  colors: {
    // Primary colors
    primary: {
      main: '#1d1d1f',
      light: '#3a3a3c',
      dark: '#000000',
      hover: '#000000',
    },
    secondary: {
      main: '#007AFF',
      light: '#409cff',
      dark: '#0066d6',
      hover: '#0066d6',
    },
    accent: {
      main: '#FF5722',
      light: '#ff7043',
      dark: '#e64a19',
    },
    // Background colors
    background: {
      primary: '#f2f2f7',
      secondary: '#ffffff',
      tertiary: '#e5e5ea',
      card: '#ffffff',
      hover: '#ebebf0',
    },
    // Text colors
    text: {
      primary: '#1d1d1f',
      secondary: '#6e6e73',
      muted: '#8e8e93',
      disabled: '#aeaeb2',
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
    primary: 'bg-[#1d1d1f] text-white hover:bg-black focus:ring-[#1d1d1f]',
    secondary: 'bg-[#007AFF] text-white hover:bg-[#0066d6] focus:ring-[#007AFF]',
    outline: 'border border-[rgba(60,60,67,0.16)] text-[#1d1d1f] hover:bg-[#ebebf0]',
    ghost: 'text-[#007AFF] hover:bg-[rgba(0,122,255,0.08)]',
  },
  input: {
    base: 'w-full px-4 py-2 bg-white border border-[rgba(60,60,67,0.16)] rounded-xl text-[#1d1d1f] placeholder-[#8e8e93] focus:outline-none focus:ring-4 focus:ring-[#007AFF]/20 transition-all',
  },
  card: {
    base: 'bg-white rounded-2xl border border-[rgba(60,60,67,0.08)] p-6 shadow-sm',
    hover: 'hover:border-[#555555] transition-all duration-300',
  },
};

export default theme;












