// Updated Tailwind Config (tailwind.config.js) - Full Theme Definition
// This extends the provided config into a complete theme with fonts, colors, text sizes, backgrounds, etc.
// You can customize variables in CSS (e.g., :root { --bg-primary: #0a0a0a; }) for easy global changes.

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Full Color Palette (based on Delta HTML: dark bg, red accents, white text, grays)
      colors: {
        // Primary Backgrounds (dark theme)
        'bg-primary': 'var(--bg-primary, #0a0a0a)', // Deep black for main bg
        'bg-secondary': 'var(--bg-secondary, #1a1a1a)', // Dark gray for sections
        'bg-tertiary': 'var(--bg-tertiary, #2F2F2F)', // Medium dark for cards
        'bg-accent': 'var(--bg-accent, #e81e2d)', // Red for highlights

        // Text Colors
        'text-primary': 'var(--text-primary, #ffffff)', // White for main text
        'text-secondary': 'var(--text-secondary, #cdcdcd)', // Light gray for subtitles
        'text-muted': 'var(--text-muted, #808080)', // Muted gray for details

        // Accents (from HTML)
        'accent-primary': 'var(--accent-primary, #e81e2d)', // Red for buttons, titles
        'accent-secondary': 'var(--accent-secondary, #407CFF)', // Blue for secondary buttons
        'accent-muted': 'var(--accent-muted, #FF5722)', // Orange accent if needed

        // Borders & Shadows
        'border-primary': 'var(--border-primary, #333333)', // Dark borders
        'shadow-primary': 'var(--shadow-primary, rgba(0, 0, 0, 0.5))', // Dark shadows
      },
      // Fonts — Black Void: Cabinet Grotesk (headings), Neue Montreal (body)
      fontFamily: {
        'sans': ['Neue Montreal', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'cabinet': ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        'neue-montreal': ['Neue Montreal', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Text Sizes (responsive, based on HTML classes like display-4, lead)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }], // Small text
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // Subtext
        'base': ['1rem', { lineHeight: '1.5rem' }], // Body
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // Lead/paragraphs
        'xl': ['1.25rem', { lineHeight: '1.75rem' }], // Subheadings
        '2xl': ['1.5rem', { lineHeight: '2rem' }], // Headings h3
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // h2
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // h1/display-6
        '5xl': ['3rem', { lineHeight: '1' }], // Display headings
        '6xl': ['3.75rem', { lineHeight: '1' }], // Large titles
      },
      // Background Gradients (matching HTML gradients)
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))',
        'section-gradient': 'linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary))',
      },
      // Spacing & Sizing (full-page responsive)
      spacing: {
        '18': '4.5rem',
        'container-xl': '1140px', // Matches HTML container-xl
      },
      // Shadows (for cards, etc.)
      boxShadow: {
        'card': '0 0.125rem 0.25rem var(--shadow-primary)',
        'modal': '0 0.5rem 1rem var(--shadow-primary)',
      },
      // Animations (for floating logo, etc.)
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

// Add to your global CSS (e.g., index.css) for CSS variables
/*
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-tertiary: #2F2F2F;
  --bg-accent: #e81e2d;
  --text-primary: #ffffff;
  --text-secondary: #cdcdcd;
  --text-muted: #808080;
  --accent-primary: #e81e2d;
  --accent-secondary: #407CFF;
  --accent-muted: #FF5722;
  --border-primary: #333333;
  --shadow-primary: rgba(0, 0, 0, 0.5);
}
*/